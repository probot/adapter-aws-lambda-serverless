import { ApplicationFunction, Probot } from "probot";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
  LambdaFunctionURLEvent,
  LambdaFunctionURLResult,
} from "aws-lambda";

export * from "probot";

export function createLambdaFunction(
  app: ApplicationFunction,
  options: { probot: Probot }
): (
  event: APIGatewayProxyEvent | LambdaFunctionURLEvent,
  context: Context
) => Promise<APIGatewayProxyResult | LambdaFunctionURLResult>;
