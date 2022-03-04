# User Management

## User add flow

### Auth0

- set env

```
export AUTH0_DOMAIN=dev-wni.us.auth0.com | wni.us.auth0.com
export AUTH0_CLIENT_ID=************(ManagementAPI)
export AUTH0_CLIENT_SECRET=*************(ManagementAPI)
```

- add user to Auth0

```
./user_management_auth0.py add --email '{EMAIL}'
```

user_idとpasswordが出力されるのでメモしておく

### DynamoDB

- add user to DynamoDB

```
./user_management_dynamodb.py dev add --user_id '{USER_ID}' --qs_user '{QS_USER}' --customer_id '{CUSTOMER_ID}'
```

- get

```
./user_management_dynamodb.py dev get --user_id='{USER_ID}'|jq .
```

- list

```
./user_management_dynamodb.py dev list |jq .
```
