import { relative } from "node:path";

/**
 * @param {import('probot').Probot} app
 */
export default async function app(app) {
  app.on("push", async (context) => {
    await context.octokit.request(
      "POST /repos/{owner}/{repo}/commits/{commit_sha}/comments",
      context.repo({
        commit_sha: context.payload.head_commit.id,
        body: `Hello from ${relative(process.cwd(), __filename)}`,
      }),
    );
  });
}
