const ProbotExports = require("probot");
const lambdaFunction = require("./lambda-function");

module.exports = { ...ProbotExports, createLambdaFunction };

/**
 *
 * @param {import('probot').ApplicationFunction} app
 * @param { { probot: import('probot').Probot } } options
 */
function createLambdaFunction(app, { probot }) {
  // load app once outside of the function to prevent double
  // event handlers in case of container reuse
  probot.load(app);

  return lambdaFunction.bind(null, probot);
}
