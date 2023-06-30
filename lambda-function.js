module.exports = lambdaFunction;

const lowercaseKeys = require("lowercase-keys");
const { template } = require("./views/probot");

async function lambdaFunction(probot, event) {
  if (event.httpMethod === "GET" && event.path === "/probot") {
    const res = {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html",
      },
      body: template,
    };
    return res;
  }

  // lowercase all headers to respect headers insensitivity (RFC 7230 $3.2 'Header Fields', see issue #62)
  const headersLowerCase = lowercaseKeys(event.headers);

  // this will be simpler once we ship `verifyAndParse()`
  // see https://github.com/octokit/webhooks.js/issues/379
  await probot.webhooks.verifyAndReceive({
    id: headersLowerCase["x-github-delivery"],
    name: headersLowerCase["x-github-event"],
    signature:
      headersLowerCase["x-hub-signature-256"] ||
      headersLowerCase["x-hub-signature"],
    payload: event.body,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true }),
  };
}
