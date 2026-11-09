import path from "node:path";
import { readFileSync } from "node:fs";
import { createHmac } from "node:crypto";
import fetchMock from "fetch-mock";

import { createLambdaFunction, Probot, ProbotOctokit } from "../index.js";
import app from "./fixtures/app.js";

const payload = readFileSync(
  new URL("./fixtures/push.json", import.meta.url),
  "utf8",
);
const signature = `sha256=${createHmac("sha256", "webhooksecret123")
  .update(payload)
  .digest("hex")}`;

const wasCommentCreated = () =>
  fetchMock.callHistory
    .calls({
      url: "https://api.github.com/repos/probot/adapter-adapter-aws-lambda-serverless/commits/headcommitsha123/comments",
      method: "POST",
    })
    .some(
      ({ options }) =>
        JSON.parse(options.body).body ===
        `Hello from test${path.sep}fixtures${path.sep}app.js`,
    );

describe("@probot/adapter-aws-lambda-serverless", () => {
  let probot;

  beforeEach(() => {
    fetchMock.mockGlobal();
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
    fetchMock.hardReset();
  });

  test("happy path", async () => {
    const fn = createLambdaFunction(app, { probot });

    fetchMock.postOnce(
      {
        url: "https://api.github.com/repos/probot/adapter-adapter-aws-lambda-serverless/commits/headcommitsha123/comments",
      },
      {
        body: {},
        status: 201,
      },
    );

    const context = {};
    const event = {
      headers: {
        "x-github-delivery": "eventid123",
        "x-github-event": "push",
        "x-hub-signature": signature,
      },
      body: payload,
    };

    await fn(event, context);

    expect(wasCommentCreated()).toBe(true);
  });

  test("lowercase request headers", async () => {
    const fn = createLambdaFunction(app, { probot });

    fetchMock.postOnce(
      {
        url: "https://api.github.com/repos/probot/adapter-adapter-aws-lambda-serverless/commits/headcommitsha123/comments",
      },
      {
        body: {},
        status: 201,
      },
    );

    const context = {};
    const event = {
      headers: {
        "x-github-delivery": "eventid123",
        "x-github-event": "push",
        "x-hub-signature": signature,
      },
      body: payload,
    };

    await fn(event, context);

    expect(wasCommentCreated()).toBe(true);
  });

  test("GitHub request headers", async () => {
    const fn = createLambdaFunction(app, { probot });

    fetchMock.postOnce(
      {
        url: "https://api.github.com/repos/probot/adapter-adapter-aws-lambda-serverless/commits/headcommitsha123/comments",
      },
      {
        body: {},
        status: 201,
      },
    );

    const context = {};
    const event = {
      headers: {
        "X-Github-Delivery": "eventid123",
        "X-Github-Event": "push",
        "X-Hub-Signature": signature,
      },
      body: payload,
    };

    await fn(event, context);

    expect(wasCommentCreated()).toBe(true);
  });

  test("camelcase request headers (#62)", async () => {
    const fn = createLambdaFunction(app, { probot });

    fetchMock.postOnce(
      {
        url: "https://api.github.com/repos/probot/adapter-adapter-aws-lambda-serverless/commits/headcommitsha123/comments",
      },
      {
        body: {},
        status: 201,
      },
    );

    const context = {};
    const event = {
      headers: {
        "X-Github-Delivery": "EventId123",
        "X-Github-Event": "push",
        "X-Hub-Signature": signature,
      },
      body: payload,
    };

    await fn(event, context);

    expect(wasCommentCreated()).toBe(true);
  });

  test("waits for application loading and only loads once", async () => {
    let loads = 0;
    const fn = createLambdaFunction(
      async () => {
        await Promise.resolve();
        loads++;
      },
      { probot },
    );

    const event = { httpMethod: "GET", path: "/probot" };
    const responses = await Promise.all([fn(event, {}), fn(event, {})]);

    expect(loads).toBe(1);
    for (const response of responses) {
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("Welcome to Probot!");
    }
  });

  test("propagates application loading failures", async () => {
    const error = new Error("App failed to load");
    const fn = createLambdaFunction(
      async () => {
        throw error;
      },
      { probot },
    );

    await expect(fn({ httpMethod: "GET", path: "/probot" }, {})).rejects.toBe(
      error,
    );
  });
});
