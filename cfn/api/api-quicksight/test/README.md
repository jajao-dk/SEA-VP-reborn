# API test using Postman & Newman

0. Condition
    - Env: dev
    - User:
        - sea-dev+tmax-auth0@wni.co.jp for CIM
        - sea-dev+neom@wni.co.jp for SSM

1. Edit dev.postman_environment.json
    Copy from dev.postman_environment.tmpl.json
    Fill value "TOKEN_FOR_CIM", "TOKEN_FOR_SSM", "TOKEN_FOR_GP" and "TOKEN_FOR_NO_QS".

2. Run test
    ```
    npx newman run api-quicksight.postman_collection.json -e dev.postman_environment.json > api-quicksight.postman_collection.out-20220530.txt
    ```
