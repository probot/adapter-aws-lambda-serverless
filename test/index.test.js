const nock = require("nock");
const path = require("path");

const { createLambdaFunction, Probot, ProbotOctokit } = require("../index");
const app = require("./fixtures/app");

nock.disableNetConnect();

describe("@probot/adapter-aws-lambda-serverless", () => {
  let probot;

  beforeEach(() => {
    probot = new Probot({
      githubToken: "test",
      // Disable throttling & retrying requests for easier testing
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false },
      }),
      secret: "webhooksecret123",
    });
  });

  test("happy path", async () => {
    const fn = createLambdaFunction(app, { probot });

    const mock = nock("https://api.github.com")
      .post(
        "/repos/probot/adapter-adapter-aws-lambda-serverless/commits/headcommitsha123/comments",
        (requestBody) => {
          expect(requestBody).toStrictEqual({
            body: `Hello from test${path.sep}fixtures${path.sep}app.js`,
          });

          return true;
        }
      )
      .reply(201, {});

    const context = {};
    const payload = JSON.stringify(require("./fixtures/push.json"));
    const signature = await probot.webhooks.sign(payload);
    const event = {
      headers: {
        "x-github-delivery": "eventid123",
        "x-github-event": "push",
        "x-hub-signature": signature,
      },
      body: payload,
    };

    await fn(event, context);

    expect(context).toStrictEqual({
      callbackWaitsForEmptyEventLoop: false,
    });

    expect(mock.activeMocks()).toStrictEqual([]);
  });

  test("lowercase request headers", async () => {
    const fn = createLambdaFunction(app, { probot });

    const mock = nock("https://api.github.com")
      .post(
        "/repos/probot/adapter-adapter-aws-lambda-serverless/commits/headcommitsha123/comments",
        (requestBody) => {
          expect(requestBody).toStrictEqual({
            body: `Hello from test${path.sep}fixtures${path.sep}app.js`,
          });

          return true;
        }
      )
      .reply(201, {});

    const context = {};
    const payload = JSON.stringify(require("./fixtures/push.json"));
    const signature = await probot.webhooks.sign(payload);
    const event = {
      headers: {
        "x-github-delivery": "eventid123",
        "x-github-event": "push",
        "x-hub-signature": signature,
      },
      body: payload,
    };

    await fn(event, context);

    expect(context).toStrictEqual({
      callbackWaitsForEmptyEventLoop: false,
    });

    expect(mock.activeMocks()).toStrictEqual([]);
  });

  test("GitHub request headers", async () => {
    const fn = createLambdaFunction(app, { probot });

    const mock = nock("https://api.github.com")
      .post(
        "/repos/probot/adapter-adapter-aws-lambda-serverless/commits/headcommitsha123/comments",
        (requestBody) => {
          expect(requestBody).toStrictEqual({
            body: `Hello from test${path.sep}fixtures${path.sep}app.js`,
          });

          return true;
        }
      )
      .reply(201, {});

    const context = {};
    const payload = JSON.stringify(require("./fixtures/push.json"));
    const signature = await probot.webhooks.sign(payload);
    const event = {
      headers: {
        "X-Github-Delivery": "eventid123",
        "X-Github-Event": "push",
        "X-Hub-Signature": signature,
      },
      body: payload,
    };

    await fn(event, context);

    expect(context).toStrictEqual({
      callbackWaitsForEmptyEventLoop: false,
    });

    expect(mock.activeMocks()).toStrictEqual([]);
  });

  test("camelcase request headers (#62)", async () => {
    const fn = createLambdaFunction(app, { probot });

    const mock = nock("https://api.github.com")
      .post(
        "/repos/probot/adapter-adapter-aws-lambda-serverless/commits/headcommitsha123/comments",
        (requestBody) => {
          expect(requestBody).toStrictEqual({
            body: `Hello from test${path.sep}fixtures${path.sep}app.js`,
          });

          return true;
        }
      )
      .reply(201, {});

    const context = {};
    const payload = JSON.stringify(require("./fixtures/push.json"));
    const signature = await probot.webhooks.sign(payload);
    const event = {
      headers: {
        "X-Github-Delivery": "EventId123",
        "X-Github-Event": "push",
        "X-Hub-Signature": signature,
      },
      body: payload,
    };

    await fn(event, context);

    expect(context).toStrictEqual({
      callbackWaitsForEmptyEventLoop: false,
    });

    expect(mock.activeMocks()).toStrictEqual([]);
  });
});
