import {Octokit} from "@octokit/rest"
const octokit=new Octokit({auth:process.env.GITHUB_TOKEN});
async function prlist(owner,repo)
{
    const {repo}=await octokit.rest.pulls.list({
    owner:owner,
    repo:repo,
    state:"closed"});
    const mergedPrs=repo.filter(x=>x.merged_at!==null);
    return mergedPrs;
}
export default prlist;



