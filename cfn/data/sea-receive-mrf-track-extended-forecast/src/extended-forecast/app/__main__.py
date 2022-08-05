import json

from aws_lambda_powertools.utilities.typing import LambdaContext

from app.lambda_function import lambda_handler

if __name__ == '__main__':
    body = {
        'Type': 'Notification',
        'MessageId': 'ae981dbc-dda2-5939-866a-44c7218a02ee',
        'TopicArn': 'arn:aws:sns:ap-northeast-1:707399091575:dev-env-wxdp-TagID-411024695',
        'Message': '411024695/2022/04/07/20220407000637.76a18631-aff7-4569-9aa4-c55d7bd36077',
        'Timestamp': '2021-07-29T00:44:24.654Z',
        'SignatureVersion': '1',
        'Signature': 'DtbMmHu2Ne5SbUY42wV0BYySltNlovgaQMXvQAqFNDDvxifET/pa3xA89HnxpFmpoDFUi/MlBfMiRGP+C9clg1l8rinyF75a45Alm1CxY6YtYRmzXYK0a79mQYvMiTUDQsgesTqv9PvjkmcnwkrfblaF0fp22788kpFr7aUl4d07aHwYawbGzHreA2uzffsgaI6HB0jaYKv3538YZZZUbv09ikiSrK4tWcRsrwlUzoRO2AaqMi7KibMXCiXQs38ai9v2M36r0CNyoCDP99qZN4dF5EWeyi3laMUWbdftlWe4B+wzX+gVFVKvuiT/EvYJ7TT+9WhJQx+oA8ug2ivJWw==',
        'SigningCertURL': 'https://sns.ap-northeast-1.amazonaws.com/SimpleNotificationService-010a507c1833636cd94bdb98bd93083a.pem',
        'UnsubscribeURL': 'https://sns.ap-northeast-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:ap-northeast-1:707399091575:dev-env-wxdp-TagID-431010073:173178ec-666c-48d1-bc23-f10838dacef2'
    }

    event = {
        'Records': [
            {
                'body': json.dumps(body),
                'eventSourceARN': "arn:aws:sqs:ap-northeast-1:707399091575:dev-env-dp-input-calender"
            }
        ]
    }

    ctx = LambdaContext()
    ctx._function_name = ''
    ctx._function_version = ''
    ctx._invoked_function_arn = ''
    ctx._memory_limit_in_mb = 0
    ctx._aws_request_id = ''
    ctx._log_group_name = ''
    ctx._log_stream_name = ''

    lambda_handler(event, ctx)
