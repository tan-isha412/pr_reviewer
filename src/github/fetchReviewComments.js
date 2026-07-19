import {Octokit} from "@octokit/rest"
const octokit=new Octokit({auth:process.env.GITHUB_TOKEN});
async function fetchcomm(owner,repo,pullNumber)
{
    const {data}= await octokit.rest.pulls.listReviewComments({owner,repo,pull_number:pullNumber});
    return data;
}
export default fetchcomm;