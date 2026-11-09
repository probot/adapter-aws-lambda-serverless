import lambdaFunction from "./lambda-function.js";

export * from "probot";

/**
 *
 * @param {import('probot').ApplicationFunction} app
 * @param { { probot: import('probot').Probot } } options
 */
export function createLambdaFunction(app, { probot }) {
  // load app once outside of the function to prevent double
  // event handlers in case of container reuse
  const appLoaded = probot.load(app);

  return async (event, context) => {
    await appLoaded;
    return lambdaFunction(probot, event, context);
  };
}
