import { Probot } from "probot";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
  LambdaFunctionURLEvent,
  LambdaFunctionURLResult,
} from "aws-lambda";
import { ApplicationFunction } from "probot/lib/types";

export * from "probot";

export function createLambdaFunction(
  app: ApplicationFunction,
  options: { probot: Probot }
): (
  event: APIGatewayProxyEvent | LambdaFunctionURLEvent,
  context: Context
) => Promise<APIGatewayProxyResult | LambdaFunctionURLResult>;
