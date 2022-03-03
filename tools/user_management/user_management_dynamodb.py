#! /usr/bin/env python3

import argparse
import json
import os
import boto3
from boto3.session import Session

PROFILE_PREFIX='sea_vp_'
TABLENAME_BASE='sea-vp-reborn-store-user'
def update_user(table,file):
    print("add")
    userdata={}
    with open(file, 'r') as f:
        userdata=json.load(f)
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
    parser.add_argument("env",         choices=["dev","stg","prd"])
    parser.add_argument("command",     choices=["list","get","add","del"])
    parser.add_argument("--file",      help="user json file: necessary for add and update")
    parser.add_argument("--user_id",   help="user_id : necessary for get and update")
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
        update_user(table,args.file)
    elif(args.command == 'del'):
        delete_user(table,args.user_id)
    else:
        parser.print_help()
        exit()

if __name__ == '__main__':
    main()