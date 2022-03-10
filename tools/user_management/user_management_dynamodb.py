#! /usr/bin/env python3

import argparse
import json
import os
import boto3
import re
from boto3.session import Session

PROFILE_PREFIX='sea_vp_'
TABLENAME_BASE='sea-vp-reborn-store-user'
def update_user(table,file):
    print("update")
    userdata={}
    with open(file, 'r') as f:
        userdata=json.load(f)
    try:
        res=table.put_item(Item=userdata)
        print(res)
    except Exception as error:
        print(error)

def add_user(table,env,user_id,customer_id,qs_user):
    print("add")

    qs_prefix=''
    if(env == 'dev' or env == 'stg') :
        qs_prefix= f'{env}-'

    if qs_user == None:
        qs_user = re.sub(r"^auth0\|", "", user_id)

    userdata={
      "uid": user_id,
      "customer_ids":[customer_id],
      "cim":{
          "qs_ns": f'{qs_prefix}quicksight-namespace-sea-vp-cim-{customer_id}',
          "qs_did": f'{qs_prefix}quicksight-dashboard-sea-vp-cim-{customer_id}',
          "qs_user": qs_user,
      }
    }
    try:
        res=table.put_item(Item=userdata)
        print(res)
    except Exception as error:
        print(error)

def list_users(table):
    users=[]
    response=table.scan()
    while True:
        users.extend(response["Items"])
        if "LastEvaluatedKey" not in response:
            break
        response=table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
    print(json.dumps(users))

def get_user(table,user_id):
    response=table.get_item(Key={"uid": user_id})
    userdata={}
    if "Item" in response:
        userdata=response["Item"]
    print(json.dumps(userdata))

def delete_user(table,user_id):
    try:
        response=table.delete_item(Key={"uid": user_id})
        print(response)
    except Exception as error:
        print(error)

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("env",           choices=["dev","stg","prd"])
    parser.add_argument("command",       choices=["list","get","add","del"])
    parser.add_argument("--file",        help="user json file: necessary for update")
    parser.add_argument("--user_id",     help="user_id : necessary for get,add,update")
    parser.add_argument("--customer_id", help="customer_id : necessary for add")
    parser.add_argument("--qs_user",     help="qs_user   : necessary for add")
    args=parser.parse_args()

    profile_name=f'{PROFILE_PREFIX}{args.env}'
    table_name=TABLENAME_BASE
    if(args.env == 'dev' or args.env == 'stg') :
        table_name = f'{args.env}-{TABLENAME_BASE}'

    session=Session(profile_name=profile_name)
    table = session.resource('dynamodb').Table(table_name)

    if(args.command == 'list'):
        list_users(table)
    elif(args.command == 'get'):
        get_user(table,args.user_id)
    elif(args.command == 'add'):
        add_user(table,args.env,args.user_id,args.customer_id,args.qs_user or None)
    elif(args.command == 'upd'):
        update_user(table,args.file)
    elif(args.command == 'del'):
        delete_user(table,args.user_id)
    else:
        parser.print_help()
        exit()

if __name__ == '__main__':
    main()