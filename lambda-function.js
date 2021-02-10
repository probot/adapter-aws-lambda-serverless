module.exports = lambdaFunction;

async function lambdaFunction(probot, event, context) {
  try {
    // Ends function immediately after callback
    context.callbackWaitsForEmptyEventLoop = false;

    // this will be simpler once we ship `verifyAndParse()`
    // see https://github.com/octokit/webhooks.js/issues/379
    await probot.webhooks.verifyAndReceive({
      id:
        event.headers["X-GitHub-Delivery"] ||
        event.headers["x-github-delivery"],
      name: event.headers["X-GitHub-Event"] || event.headers["x-github-event"],
      signature:
        event.headers["X-Hub-Signature-256"] ||
        event.headers["x-hub-signature-256"] ||
        event.headers["X-Hub-Signature"] ||
        event.headers["x-hub-signature"],
      payload: JSON.parse(event.body),
    });

    return {
      statusCode: 200,
      body: '{"ok":true}',
    };
  } catch (error) {
    return {
      statusCode: error.status || 500,
      error: "ooops",
    };
  }
}
