import formatComment from "./formatComment.js";
import postComment from "./postComment.js";
async function runDeliver(findings,owner,repo,pr_number,commit_id)
{
    const result=[];
    for(const f of findings)
    {
        const fc= formatComment(f, owner, repo);
        const res=await postComment(fc,f,owner,repo,pr_number,commit_id);
        result.push(res);
    }
    return result;
}

export default runDeliver;