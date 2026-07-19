async function runIngest(owner,repo)
{
    const prs=await fetch_prs(owner,repo);
    const decisionUnits=[];
    for(const pr of prs)
    {
        const diff=await fetchDiff(owner,repo,pr.number);
        const comm=await fetchReviewComments(owner,repo,pr.number);
        decisionUnits.push({
            pr_number: pr.number,
            title: pr.title,
            author: pr.user?.login,
            merged_at: pr.merged_at,
            diff: diff,
            review_comments: comm
        });
    }
    await saveJson("C:/Users/tanis/OneDrive/Desktop/SEM-IV/projects_resume/pr_project/src/data/raw/decision-units.json",decisionUnits)
}