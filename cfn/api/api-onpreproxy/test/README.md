# API test using Postman & Newman

0. Condition
    - Env: dev
    - User:
        - sea-dev+tmax-auth0@wni.co.jp for CIM
        - sea-dev+neom@wni.co.jp for SSM

1. Edit dev.postman_environment.json
    Copy from dev.postman_environment.tmpl.json
    Fill value "TOKEN_FOR_CIM" and "TOKEN_FOR_SSM".

2. Run test
    ```
    npx newman run api-onpreproxy.postman_collection.json -e dev.postman_environment.json > api-onpreproxy.postman_collection.out-20220531.txt
    ```
