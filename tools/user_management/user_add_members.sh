#! /bin/sh

ENV=$1
EMAIL_LIST=$2
APP_FILE=$3
#EMAIL_LIST: comma-separated file [client code], [group name], [email address]
#APP_FILE: Json file (ex: app.json)

if [ "$#" -eq 3 ]; then
  sed -i.back -e 's/\r//g' -e 's/^\xef\xbb\xbf//g' ${EMAIL_LIST}
  while read line || [ -n "${line}" ]; do
    customer_id=`echo ${line} | cut -d , -f 1`
    group_name=`echo ${line} | cut -d , -f 2`
    email=`echo ${line} | cut -d , -f 3`
    
    #add Auth0 and DynamoDB
    yes|./user_add.sh ${ENV} ${customer_id} ${email} ${APP_FILE} >>user_add_members.log
    echo "done ${ENV}, ${customer_id}, ${group_name}, ${email}"

  done < ${EMAIL_LIST}

  #pickup password
  grep 'user_id:auth0|' user_add_members.log >>password.csv

  #error count
  error_count=`grep -o -i PasswordStrengthError user_add_members.log | wc -l`
  echo "Auth0 PasswordStrengthError: ${error_count}"

else
    echo "Usage: $0 <ENV> <EMAILLIST> <APP_FILE>"
    exit
fi

#
