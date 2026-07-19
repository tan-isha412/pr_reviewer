import {Octokit} from "@octokit/rest"
const octokit=new Octokit({auth:process.env.GITHUB_TOKEN});
async function fetchDiff(owner, repo, pull_number) {
    const { data } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number,
        headers: {
            accept: "application/vnd.github.v3.diff"
        }
    });

    return data;
}
export default fetchDiff;