function buildPrompt(chunk,retrievedMatches)
{
    const history = retrievedMatches.map((match, index) => `
${index + 1}. PR #${match.prNumber}
Title: ${match.title}

Diff:
${match.diff}

Review Comments:
${match.comments.map(c => c.body).join("\n")||"No review comments"}

Similarity Score:
${match.similarityScore}
`).join("\n");


    const prompt=`You are reviewing a code change against this team's established conventions.

   NEW CODE CHANGE:
   File: ${chunk.file}
   Diff: ${chunk.diff}

   SIMILAR PAST DECISIONS FROM THIS REPO:
    ${history}
   
   YOU NEED TO BE EXTRA SMART LIKE THE EINSTEIN AND GIVE THE OUTPUT AS A JSON FILE.eg.
   {
    deviates: false,
    deviationType: null,
    severity: "low",
    explanation: "...",
    citedPr: 15
    ...
    ...
    }

   `;
   return prompt;
}
export default buildPrompt;