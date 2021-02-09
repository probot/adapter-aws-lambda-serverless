# `@probot/adapter-aws-lambda-serverless`

> Adapter to run a [Probot](https://probot.github.io/) application function in [AWS Lambda](https://aws.amazon.com/lambda/) using the [Serverless Framework](https://github.com/serverless/serverless)

[![Build Status](https://github.com/probot/adapter-aws-lambda-serverless/workflows/Test/badge.svg)](https://github.com/probot/adapter-aws-lambda-serverless/actions)

## Usage

```shell
npm install @probot/adapter-aws-lambda-serverless
```

```javascript
// handler.js
const {
  createLambdaFunction,
  createProbot,
} = require("@probot/adapter-aws-lambda-serverless");
const appFn = require("./");
module.exports.webhooks = createLambdaFunction(appFn, {
  probot: createProbot(),
});
```

## Configuration

You need to add [environment variables to configure Probot](https://probot.github.io/docs/configuration/) to your Lambda function. If you use the [Serverless App](https://app.serverless.com/), you can add parameters for `APP_ID`, `PRIVATE_KEY`, `WEBHOOK_SECRET`, the use these parameters in `serverless.yaml`.

```yml
provider:
  name: aws
  runtime: nodejs12.x
  lambdaHashingVersion: 20201221
  environment:
    APP_ID: ${param:APP_ID}
    PRIVATE_KEY: ${param:PRIVATE_KEY}
    WEBHOOK_SECRET: ${param:WEBHOOK_SECRET}
    NODE_ENV: production
    LOG_LEVEL: debug

functions:
  webhooks:
    handler: handler.webhooks
    events:
      - httpApi:
          path: /api/github/webhooks
          method: post
```

Make sure to configure your GitHub App registration's webhook URL to `<your lambda's URL>/api/github/webhooks`.

## LICENSE

[ISC](LICENSE)
