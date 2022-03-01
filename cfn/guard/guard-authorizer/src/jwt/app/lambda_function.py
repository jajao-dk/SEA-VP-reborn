from __future__ import annotations

import json
from decimal import Decimal
from functools import lru_cache
from typing import Any

import jwt
from aws_lambda_powertools.logging import Logger
from aws_lambda_powertools.utilities.data_classes import event_source
from aws_lambda_powertools.utilities.data_classes.api_gateway_authorizer_event import (
    APIGatewayAuthorizerResponse, APIGatewayAuthorizerTokenEvent)
from aws_lambda_powertools.utilities.typing import LambdaContext
from jwt import PyJWKClient

from .utils.aws import get_dynamodb_resource
from .utils.handler import basic_handler
from .values import Env

logger = Logger()


@lru_cache
def get_jwk_client():
    return PyJWKClient('{0}.well-known/jwks.json'.format(Env.AUTH0_ISSUER))


def dict2str(value: dict[str, Any]):
    def _default(obj: Any):
        if isinstance(obj, Decimal):
            return int(obj) if obj == int(obj) else float(obj)
        elif isinstance(obj, set):
            return list(obj)
        raise TypeError('Object of type {0} is not JSON serializable'.format(type(obj)))

    return json.dumps(value, ensure_ascii=False, separators=(',', ':'), default=_default)


def verify_token(token: str):
    try:
        signing_key = get_jwk_client().get_signing_key_from_jwt(token)
        claims = jwt.decode(
            token,
            signing_key.key,
            ['RS256'],
            audience=Env.AUTH0_AUDIENCE,
            issuer=Env.AUTH0_ISSUER,
        )
        return claims
    except Exception:
        raise Exception('Unauthorized')


def get_user(user_id: str, filter_columns: list[str]):
    table = get_dynamodb_resource().Table(Env.USER_TABLE_NAME)
    res = table.get_item(Key={'uid': user_id})

    if 'Item' not in res:
        return None

    item = res['Item']
    return {el: item[el] for el in filter_columns or item.keys() if el in item}


def create_response(arn: str, claims: dict[str, Any], user: dict[str, Any] | None):
    policy = APIGatewayAuthorizerResponse.from_route_arn(
        arn,
        claims['sub'],
        {'claims': dict2str(claims), 'user': dict2str(user or {})},
    )
    if user is not None:
        policy.allow_all_routes()
    else:
        policy.deny_all_routes()
    return policy.asdict()


def authenticate_user(event: APIGatewayAuthorizerTokenEvent):
    claims = verify_token(event.authorization_token.replace('Bearer ', ''))
    user = get_user(claims['sub'], Env.FILTER_COLUMNS)
    return create_response(event.method_arn, claims, user)


def error_handler(error: Exception):
    if str(error) != 'Unauthorized':
        logger.exception(error)
    raise error


@logger.inject_lambda_context(clear_state=True)
@event_source(data_class=APIGatewayAuthorizerTokenEvent)
@basic_handler(error_handler=error_handler)
def lambda_handler(event: APIGatewayAuthorizerTokenEvent, context: LambdaContext):
    return authenticate_user(event)
