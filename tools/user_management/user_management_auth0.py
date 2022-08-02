#! /usr/bin/env python3

import string
import secrets
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

def add_user(auth0, email, app_file):
    print("add")
    user_id=email.lower()
    password=generate_password()
    username=re.sub('@','#a#',email)

    with open(app_file, 'r') as f:
        app = json.load(f)

    userdata={
        "user_id": user_id,
        "email": email,
        "name": email,
        "username": username,
        "password": password,
        "connection": "Username-Password-Authentication",
        "email_verified": True,
        "blocked": False,
        "user_metadata": {
            "lang": "en"
        },
        "app_metadata": {
            "plannings": [
                "SEA"
            ],
            "applications": app['applications']
        }
    }
    try:
        user = auth0.users.create(userdata)
        print(user)
        user_id = user.get('user_id')
        print(f'user_id:{user_id}, email:{email}, password:{userdata["password"]}')
    except Exception as error:
        print(error)

def update_user(auth0, user_id, file):
    print("update")
    userdata={}
    with open(file, 'r') as f:
        userdata=json.load(f)

    try:
        user = auth0.users.update(user_id, userdata)
        print(json.dumps(user))
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
    while True:
        password = ''.join(secrets.choice(characters) for i in range(length))
        n = 0
        if any(c.islower() for c in password):
            n = n + 1
        if any(c.isupper() for c in password):
            n = n + 1
        if any(c.isdigit() for c in password):
            n = n + 1
        if bool(re.search(r'!|@|#|\$|%|\^|&|\*|\(|\)', password)):
            n = n + 1
        if n >= 3:
            return password

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("command",     choices=["list","get","add","upd","send_verification_mail"])
    parser.add_argument("--file",      help="user json file: necessary for update")
    parser.add_argument("--user_id",   help="user_id : necessary for get and update")
    parser.add_argument("--client_id", help="client_id : necessary for send verification mail")
    parser.add_argument("--email",     help="email : necessary for add")
    parser.add_argument("--app_file",   help="appfile : necessary for add")
    args=parser.parse_args()

    mgmt_api_token = get_access_token(AUTH0_DOMAIN,AUTH0_CLIENT_ID,AUTH0_CLIENT_SECRET)
    auth0 = Auth0(AUTH0_DOMAIN, mgmt_api_token)

    if(args.command == 'list'):
        list_users(auth0)
    elif(args.command == 'get'):
        get_user(auth0, args.user_id)
    elif(args.command == 'add'):
        add_user(auth0, args.email, args.app_file)
    elif(args.command == 'upd'):
        update_user(auth0, args.user_id, args.file)
    elif(args.command == 'send_verification_mail'):
        send_verification_mail(auth0, args.user_id, args.client_id)
    else:
        parser.print_help()
        exit()

if __name__ == '__main__':
    main()
