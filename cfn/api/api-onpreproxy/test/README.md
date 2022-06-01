# API test using Postman & Newman

0. Condition
    - Env: dev

1. Edit dev.postman_environment.json
    Copy from dev.postman_environment.tmpl.json
    Fill value "Cookie"

2. Run test
    ```
    npx newman run api-onpreproxy.postman_collection.json -e dev.postman_environment.json > api-onpreproxy.postman_collection.out-20220531.txt
    ```
