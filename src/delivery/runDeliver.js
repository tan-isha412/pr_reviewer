import readJson from "../utils/readJson.js";
import formatComment from "./formatComment.js";
import postComment from "./postComment.js";
async function runDeliver(owner,repo,pr_number,commit_id)
{
    const findings=await readJson("./data/processed/findings.json");
    const result=[];
    for(const f of findings)
    {
        const fc= formatComment(f);
        const res=await postComment(fc,f,owner,repo,pr_number,commit_id);
        result.push(res);
    }
    return result;
}