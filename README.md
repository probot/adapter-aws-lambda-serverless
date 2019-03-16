## AWS Lambda Extension for Probot
A [Probot](https://github.com/probot/probot) extension to make it easier to run your Probot Apps in AWS Lambda.

## Usage

```shell
$ npm install @probot/serverless-lambda
```

```javascript
// handler.js
const { serverless } = require('@probot/serverless-lambda')
const appFn = require('./')
module.exports.probot = serverless(appFn)
```

## Configuration
This package moves the functionality of `probot run` into a handler suitable for usage on AWS Lambda + API Gateway. Follow the documentation on [Environment Configuration](https://probot.github.io/docs/configuration/) to setup your app's environment variables. You can add these to `.env`, but for security reasons you may want to use the [AWS CLI](https://aws.amazon.com/cli/) or [Serverless Framework](https://github.com/serverless/serverless) to set Environment Variables for the function so you don't have to include any secrets in the deployed package.

For the private key, since AWS environment variables cannot be multiline strings, you could [Base64 encode](https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings) the `.pem` file you get from the GitHub App or use [KMS](https://aws.amazon.com/kms/) to encrypt and store the key.

## Differences from `probot run`

#### Local Development
Since Lambda functions do not start a normal node process, the best way we've found to test this out locally is to use [`serverless-offline`](https://github.com/dherault/serverless-offline). This plugin for the serverless framework emulates AWS Lambda and API Gateway on your local machine, allowing you to continue working from `https://localhost:3000/probot` before deploying your function to AWS.

#### Long running tasks
Some Probot Apps that depend on long running processes or intervals will not work with this extension. This is due to the inherent architecture of serverless functions, which are designed to respond to events and stop running as quickly as possible. For longer running apps we recommend using [other deployment options](https://probot.github.io/docs/deployment).

#### If you use [HTTP routes](https://probot.github.io/docs/http/) or [WEBHOOK_PATH](https://probot.github.io/docs/configuration/)
This extension is designed primarily for receiving webhooks from GitHub and responding back as a GitHub App. If you are using [HTTP Routes](https://probot.github.io/docs/http/) in your app to serve additional pages, you should take a look at [`serverless-http`](https://github.com/dougmoscrop/serverless-http), which can be used with Probot's [express server](https://github.com/probot/probot/blob/master/src/server.ts) by wrapping `probot.server`.
