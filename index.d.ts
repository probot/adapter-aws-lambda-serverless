import { Probot } from "probot";
import { APIGatewayProxyHandler } from "aws-lambda";
import { ApplicationFunction } from "probot/lib/types";

export * from "probot";

export function createLambdaFunction(
  app: ApplicationFunction,
  options: { probot: Probot }
): APIGatewayProxyHandler;
