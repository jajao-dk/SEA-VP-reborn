# btob-project-template
## Abstract
BtoB向けAWSプロジェクトテンプレート

## Directory Structure
```
Template
├── .devcontainer
│   └── devcontainer.json              ... VSCode Remote Container用設定
├── .env.template                      ... docker-compose.yaml用環境変数テンプレート
├── .gitignore
├── README.md
├── cfn
│   ├── account
│   │   └── account-config             ... アカウント共通設定
│   ├── alert
│   │   ├── alert-chatbot              ... Chatbot
│   │   ├── alert-slack                ... Slack通知(CloudWatch Logs)
│   │   └── alert-topic                ... Slack通知(CloudWatch Alarm)
│   ├── api
│   │   ├── api-authorizer             ... 認証Cookie API
│   │   ├── api-quicksight             ... QuickSight API
│   │   └── api-s3proxy                ... S3プロキシ API
│   ├── data
│   │   ├── data-holiday               ... Stock on S3処理サンプル
│   │   └── data-schedule              ... スケジュール処理のサンプル
│   ├── guard
│   │   ├── guard-authorizer           ... Custom Authorizer
│   │   └── guard-waf                  ... WAF
│   ├── hosting
│   │   ├── hosting-cloudfront         ... CloudFront
│   │   └── hosting-cloudfront-metrics ... CloudFrontメトリクス
│   ├── infra
│   │   ├── infra-cicd                 ... CI-CD
│   │   ├── infra-keypair              ... CloudFront 公開鍵
│   │   ├── infra-resource             ... 外部認証情報
│   │   └── infra-security             ... 共通IAM/セキュリティグループ
│   ├── site
│   │   └── site-web                   ... サイト
│   └── store
│       ├── store-data                 ... データDB
│       └── store-user                 ... ユーザDB
├── diagram                            ... 構成図
├── doc
│   ├── deploy.md                      ... デプロイ手順書
│   └── develop.md                     ... 開発環境構築手順書
├── docker
│   ├── Dockerfile                     ... 開発環境コンテナ
│   ├── certs                          ... 自己証明書
│   └── nginx                          ... リバースプロキシ
├── docker-compose.yaml                ... 開発環境定義ファイル
├── env_params
│   ├── env.json                       ... 共通パラメータ
│   └── env_common.sh                  ... 共通シェル
├── snippet
│   ├── cfn                            ... CloudFormationサンプル
│   ├── dir                            ... ディレクトリサンプル
│   └── python                         ... Pythonサンプル
└── template
    ├── architectures
    │   └── x86_64
    │       ├── pipeline_lambda.yaml  ... Lambda用CodePipelineテンプレート
    │       └── pipeline_html.yaml    ... HTML用CodePipelineテンプレート
    └── runtimes
        └── python3.8
            └── buildspec_lambda.yaml ... Lambda用CodeBuildテンプレート
```

## Develop Procedure
[develop.md](./doc/develop.md)

## Deploy Procedure
[deploy.md](./doc/deploy.md)
