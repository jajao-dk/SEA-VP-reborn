#! /usr/bin/env python3

import string
import random
import argparse
import json
import os
import re
from auth0.v3.authentication import GetToken
from auth0.v3.management import Auth0

AUTH0_DOMAIN = os.environ.get('AUTH0_DOMAIN')
AUTH0_CLIENT_ID = os.environ.get('AUTH0_CLIENT_ID')
AUTH0_CLIENT_SECRET = os.environ.get('AUTH0_CLIENT_SECRET')

if(AUTH0_DOMAIN==None or AUTH0_CLIENT_ID==None or AUTH0_CLIENT_SECRET==None):
    print('env parameter not set : AUTH0_DOMAIN, AUTH0_CLIENT_ID and AUTH0_CLIENT_SECRET')
    exit()

def get_access_token(domain,client_id,client_secret):
    get_token = GetToken(domain)
    token = get_token.client_credentials(
        client_id,
        client_secret,
        'https://{}/api/v2/'.format(domain))
    mgmt_api_token = token['access_token']
    return mgmt_api_token

def list_users(auth0):
    print("list")
    users = auth0.users.list()
    # print(users)
    for user in users['users']:
        print(user['user_id'], user['name'])

def get_user(auth0, user_id):
    user=auth0.users.get(user_id)
    print(json.dumps(user))

def add_user(auth0, file):
    print("add")
    userdata={}
    with open(file, 'r') as f:
        userdata=json.load(f)
    userdata['user_id']=userdata['email']
    userdata['username']=re.sub('@','#a#',userdata['email'])
    userdata['password']=generate_password()
    userdata['connection']='Username-Password-Authentication'
    userdata['email_verified']=True
    userdata['blocked']=False
    # print(userdata)
    try:
        user = auth0.users.create(userdata)
        print(user)
        user_id = user.get('user_id')
        print(f'user_id:{user_id}, password:{userdata["password"]}')
    except Exception as error:
        print(error)

def send_verification_mail(auth0, user_id, client_id):
    print('mail')
    maildata = {
        'user_id': user_id,
        'client_id': client_id,
    }
    print(maildata)
    jobs = auth0.jobs.send_verification_email(maildata)
    print(jobs)

def generate_password():
    characters = list(string.ascii_letters + string.digits + "!@#$%^&*()")
    length=10
    random.shuffle(characters)
	
    password = []
    for i in range(length):
        password.append(random.choice(characters))
    random.shuffle(password)

    return "".join(password)

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("command",     choices=["list","get","add","send_verification_mail"])
    parser.add_argument("--file",      help="user json file: necessary for add and update")
    parser.add_argument("--user_id",   help="user_id : necessary for get and update")
    parser.add_argument("--client_id", help="client_id : necessary for send verification mail")

    args=parser.parse_args()

    # print(args.mode)
    # print(args)
    mgmt_api_token = get_access_token(AUTH0_DOMAIN,AUTH0_CLIENT_ID,AUTH0_CLIENT_SECRET)
    auth0 = Auth0(AUTH0_DOMAIN, mgmt_api_token)

    if(args.command == 'list'):
        list_users(auth0)
    elif(args.command == 'get'):
        get_user(auth0, args.user_id)
    elif(args.command == 'add'):
        add_user(auth0, args.file)
    elif(args.command == 'send_verification_mail'):
        send_verification_mail(auth0, args.user_id, args.client_id)
    else:
        parser.print_help()
        exit()

if __name__ == '__main__':
    main()
