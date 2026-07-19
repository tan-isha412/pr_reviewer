async function postComment(text,finding,owner, repo, pull_number, commit_id)
{
    const res=await octokit.rest.pulls.createReviewComment({owner,repo,pull_number,body:text,commit_id,path:finding.file,line:finding.line,side: "RIGHT"});
    return res.data;
}