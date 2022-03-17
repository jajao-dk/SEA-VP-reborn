#! /bin/sh

ENV=$1
EMAIL=$2
CUSTOMER_ID=$3

if [ "$#" -eq 3 ]; then
    echo "ENV        : " ${ENV}
    echo "EMAIL      : " ${EMAIL}
    echo "CUSTOMER_ID: " ${CUSTOMER_ID}

    read -p "ok? (y/N): " yn
    case "$yn" in [yY]*) ;; *) echo "abort." ; exit ;; esac

    USER_ID="auth0|${EMAIL}"

    #
    ./user_management_auth0.py add --email ${EMAIL}
    #
    ./user_management_dynamodb.py ${ENV} add --user_id "${USER_ID}" --customer_id ${CUSTOMER_ID}
    ./user_management_dynamodb.py ${ENV} get --user_id "${USER_ID}" |jq .

else
    echo "Usage: $0 <ENV> <EMAIL> <CUSTOMER_ID>"
    exit
fi

#
