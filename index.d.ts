import { Probot } from "probot";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ApplicationFunction } from "probot/lib/types";

export * from "probot";

export function createLambdaFunction(
  app: ApplicationFunction,
  options: { probot: Probot }
): (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
