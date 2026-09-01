import { Octokit } from "@octokit/rest";
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function fetchLabels(owner, repo, pull_number) {
    const { data } = await octokit.rest.issues.listLabelsOnIssue({ owner, repo, issue_number: pull_number });
    return data;
}

export default fetchLabels;
