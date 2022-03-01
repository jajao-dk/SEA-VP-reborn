from __future__ import annotations

import json
from functools import lru_cache

from aws_lambda_powertools.logging import Logger
from aws_lambda_powertools.utilities.data_classes import event_source
from aws_lambda_powertools.utilities.data_classes.cloud_watch_logs_event import (
    CloudWatchLogsDecodedData, CloudWatchLogsEvent)
from aws_lambda_powertools.utilities.typing import LambdaContext
from slack_sdk.web.client import WebClient
from slack_sdk.web.slack_response import SlackResponse

from .clients import (AWSLambdaPowertoolsLog,
                      AWSLambdaPowertoolsLogToSlackMessage,
                      AWSLogToSlackMessage, AWSTextLogToSlackMessage)
from .values import Env

logger = Logger()


@lru_cache
def get_client():
    return WebClient(Env.SLACK_OAUTH_TOKEN)


def to_slack_messages(
    data: CloudWatchLogsDecodedData,
    user_name: str = Env.SLACK_USER_NAME,
    icon_emoji: str = Env.SLACK_ICON_EMOJI,
    icon_url: str = Env.SLACK_ICON_URL,
    region: str = Env.AWS_REGION,
    alert_level: list[str] = Env.ALERT_LEVEL,
    timezone: str = Env.TIMEZONE,
) -> list[AWSLogToSlackMessage]:

    slack_messages = []
    for event in data.log_events:
        try:
            message = json.loads(event.message)
        except ValueError:
            slack_messages.append(
                AWSTextLogToSlackMessage(data.log_group, data.log_stream, event, user_name, icon_emoji, icon_url, region, timezone)
            )
            continue

        if not AWSLambdaPowertoolsLog.EXPECTED_KEYS <= message.keys():
            slack_messages.append(
                AWSTextLogToSlackMessage(data.log_group, data.log_stream, event, user_name, icon_emoji, icon_url, region, timezone)
            )
            continue

        message = AWSLambdaPowertoolsLog(message)
        if message.level not in alert_level:
            logger.info({'skip log': event.raw_event})
            continue

        slack_messages.append(
            AWSLambdaPowertoolsLogToSlackMessage(data.log_group, data.log_stream, event, message, user_name, icon_emoji, icon_url, region, timezone)
        )

    return slack_messages


def post_messages(slack_messages: list[AWSLogToSlackMessage]) -> list[SlackResponse]:
    def _post_message(slack_message: AWSLogToSlackMessage, channel: str = Env.SLACK_CHANNEL_ID):
        return get_client().chat_postMessage(channel=channel, **slack_message.message())

    responses = []
    for slack_message in slack_messages:
        response = _post_message(slack_message)
        if not response['ok']:
            logger.info(slack_message.message())
            logger.error(response)
            continue

        responses.append(response)
    return responses


@logger.inject_lambda_context(clear_state=True)
@event_source(data_class=CloudWatchLogsEvent)
def lambda_handler(event: CloudWatchLogsEvent, context: LambdaContext):
    slack_messages = to_slack_messages(event.parse_logs_data())
    responses = post_messages(slack_messages)

    logger.debug(responses)
    return {"statusCode": 200}
