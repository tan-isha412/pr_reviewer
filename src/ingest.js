import fetch_prs from "./github/fetch_prs.js";
import fetchDiff from "./github/fetchDiff.js";
import fetchReviewComments from "./github/fetchReviewComments.js";
import saveJson from "./utils/saveJson.js";

async function runIngest(owner,repo)
{
    const prs = await fetch_prs(owner, repo);

console.log("Merged PRs found:", prs.length);

if (prs.length > 0) {
    console.log("First PR:", prs[0].number, prs[0].title);
}

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
    await saveJson("data/raw/decision-units.json",decisionUnits)
}

export default runIngest;