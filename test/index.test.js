import { describe, test, expect, beforeEach, afterEach } from "vitest";
import path from "node:path";
import fetchMock from "fetch-mock";

import { createLambdaFunction, Probot, ProbotOctokit } from "../index.js";
import app from "./fixtures/app.js";

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

  afterEach(() => {
    fetchMock.restore();
  });

  test("happy path", async () => {
    const fn = createLambdaFunction(app, { probot });

    const mock = fetchMock.postOnce(
      {
        url: "https://api.github.com/repos/probot/adapter-adapter-aws-lambda-serverless/commits/headcommitsha123/comments",
      },
      {
        body: {},
        status: 201,
      },
    );

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

    expect(
      mock.called((_url, options) => {
        return (
          JSON.parse(options.body).body ===
          `Hello from test${path.sep}fixtures${path.sep}app.js`
        );
      }),
    ).toBe(true);
  });

  test("lowercase request headers", async () => {
    const fn = createLambdaFunction(app, { probot });

    const mock = fetchMock.postOnce(
      {
        url: "https://api.github.com/repos/probot/adapter-adapter-aws-lambda-serverless/commits/headcommitsha123/comments",
      },
      {
        body: {},
        status: 201,
      },
    );

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

    expect(
      mock.called((_url, options) => {
        return (
          JSON.parse(options.body).body ===
          `Hello from test${path.sep}fixtures${path.sep}app.js`
        );
      }),
    ).toBe(true);
  });

  test("GitHub request headers", async () => {
    const fn = createLambdaFunction(app, { probot });

    const mock = fetchMock.postOnce(
      {
        url: "https://api.github.com/repos/probot/adapter-adapter-aws-lambda-serverless/commits/headcommitsha123/comments",
      },
      {
        body: {},
        status: 201,
      },
    );

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

    expect(
      mock.called((_url, options) => {
        return (
          JSON.parse(options.body).body ===
          `Hello from test${path.sep}fixtures${path.sep}app.js`
        );
      }),
    ).toBe(true);
  });

  test("camelcase request headers (#62)", async () => {
    const fn = createLambdaFunction(app, { probot });

    const mock = fetchMock.postOnce(
      {
        url: "https://api.github.com/repos/probot/adapter-adapter-aws-lambda-serverless/commits/headcommitsha123/comments",
      },
      {
        body: {},
        status: 201,
      },
    );

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

    expect(
      mock.called((_url, options) => {
        return (
          JSON.parse(options.body).body ===
          `Hello from test${path.sep}fixtures${path.sep}app.js`
        );
      }),
    ).toBe(true);
  });
});
