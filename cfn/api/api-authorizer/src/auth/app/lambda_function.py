from __future__ import annotations

import json
from base64 import b64encode
from datetime import datetime, timezone
from http.cookies import SimpleCookie

from aws_lambda_powertools.event_handler.api_gateway import (Response,
                                                             ResponseBuilder,
                                                             Route)
from aws_lambda_powertools.logging import Logger
from aws_lambda_powertools.logging.correlation_paths import API_GATEWAY_REST
from aws_lambda_powertools.utilities.data_classes import event_source
from aws_lambda_powertools.utilities.data_classes.api_gateway_proxy_event import \
    APIGatewayProxyEvent
from aws_lambda_powertools.utilities.parameters import get_parameter
from aws_lambda_powertools.utilities.typing import LambdaContext
from botocore.signers import CloudFrontSigner
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding

from .values import Env

logger = Logger()


def rsa_signer(message: bytes, name: str):
    data: str = get_parameter(name, decrypt=True, max_age=3600)
    private_key = serialization.load_pem_private_key(data.encode(), None, default_backend())
    return private_key.sign(message, padding.PKCS1v15(), hashes.SHA1())


def encode_base64(val: bytes):
    return b64encode(val).replace(b'+', b'-').replace(b'=', b'_').replace(b'/', b'~')


def create_signature(url: str, date_less_than: datetime, name: str):
    cf_signer = CloudFrontSigner(Env.CLOUDFRONT_PUBLIC_KEY_ID, rsa_signer)
    policy = cf_signer.build_policy(url, date_less_than).encode()
    policy_64 = encode_base64(policy).decode()
    signature = rsa_signer(policy, name)
    signature_64 = encode_base64(signature).decode()
    return policy_64, signature_64


def set_cookie(cookie: SimpleCookie[str], key: str, val: str, httponly: bool = False, max_age: int | None = None, expires: int | None = None):
    cookie[key] = val
    cookie[key]['path'] = '/'
    cookie[key]['secure'] = True
    cookie[key]['samesite'] = 'None'

    if httponly:
        cookie[key]['httponly'] = httponly

    if max_age is not None:
        cookie[key]['max-age'] = max_age

    if expires is not None:
        cookie[key]['expires'] = datetime.fromtimestamp(expires, timezone.utc).strftime('%a, %d %b %Y %H:%M:%S GMT')


def set_signed_cookie(event: APIGatewayProxyEvent):
    authorizer = event.request_context.authorizer
    claims = json.loads(authorizer['claims'])
    user = json.loads(authorizer['user'])

    expires = int(claims.get('iat', 0)) + Env.COOKIE_EXPIRES_IN
    policy_64, signature_64 = create_signature(
        'https://*',
        datetime.fromtimestamp(expires, timezone.utc),
        Env.RSA_PARAMETER_NAME,
    )

    cookie: SimpleCookie[str] = SimpleCookie()
    set_cookie(cookie, 'CloudFront-Policy', policy_64, expires=expires)
    set_cookie(cookie, 'CloudFront-Signature', signature_64, expires=expires)
    set_cookie(cookie, 'CloudFront-Key-Pair-Id', Env.CLOUDFRONT_PUBLIC_KEY_ID, expires=expires)

    return (
        Response(200, 'application/json', json.dumps({el: user[el] for el in Env.RESPONSE_KEYS if el in user}, separators=(',', ':'))),
        [el.output().replace('Set-Cookie: ', '') for _, el in cookie.items()],
        'max-age=0'
    )


def delete_signed_cookie(event: APIGatewayProxyEvent):
    cookie: SimpleCookie[str] = SimpleCookie()
    set_cookie(cookie, 'CloudFront-Policy', '', max_age=0)
    set_cookie(cookie, 'CloudFront-Signature', '', max_age=0)
    set_cookie(cookie, 'CloudFront-Key-Pair-Id', '', max_age=0)

    return (
        Response(204, None, None),
        [el.output().replace('Set-Cookie: ', '') for _, el in cookie.items()],
        'max-age=0'
    )


@logger.inject_lambda_context(correlation_id_path=API_GATEWAY_REST, clear_state=True)
@event_source(data_class=APIGatewayProxyEvent)
def lambda_handler(event: APIGatewayProxyEvent, context: LambdaContext):
    res, cookies, cache = set_signed_cookie(event) if event.request_context.path == '/api/v1/auth/login' else delete_signed_cookie(event)

    builder = ResponseBuilder(res, Route(event.http_method, None, lambda: None, False, False, cache))
    return {**builder.build(event), 'multiValueHeaders': {'set-cookie': cookies}}
