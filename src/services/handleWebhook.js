import retrieveMatches from "../retriever/retrieveMatches.js";
import runReasoner from "../reasoner/runReasoner.js";
import runDeliver from "../delivery/runDeliver.js";

async function handleWebhook(req,res){
    const action=req.body.action;
    if(action!=="opened" && action!=="synchronize")
    {
        return res.sendStatus(200);
    }
    const owner=req.body.repository.owner.login;
    const repo=req.body.repository.name;
    const prNumber=req.body.pull_request.number;
    const commitId = req.body.pull_request.head.sha;
    console.log(
    `Received PR #${prNumber} from ${owner}/${repo}`
);
    try
    {
    const results=await retrieveMatches(owner,repo,prNumber,768,5);

    if(results.length===0)
    console.log("No similar PRs found.");
    await runReasoner(results);
    await runDeliver(owner, repo, prNumber, commitId);
    res.sendStatus(200);
    }
    catch(err)
    {
        console.log(err);
        res.sendStatus(500);
    }
}

export default handleWebhook;