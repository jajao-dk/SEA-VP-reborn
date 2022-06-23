#! /bin/sh

ENV=$1
EMAILLIST=$2
#EMAILLIST: csvfile [client code], [email address]

if [ "$#" -eq 2 ]; then
  while read line ; do
    customer_id=`echo ${line} | cut -d , -f 1`
    email=`echo ${line} | cut -d , -f 2`
    
    #add Auth0 and DynamoDB
    yes|./user_add.sh ${ENV} ${customer_id} ${email} >>user_add_members.log
    echo "done ${ENV}, ${customer_id}, ${email}"

  done < ${EMAILLIST}

  #pickup password
  grep 'user_id:auth0|' user_add_members.log >>password.csv

  #error count
  error_count=`grep -o -i PasswordStrengthError user_add_members.log | wc -l`
  echo "Auth0 PasswordStrengthError: ${error_count}"

else
    echo "Usage: $0 <ENV> <EMAILLIST>"
    exit
fi

#
