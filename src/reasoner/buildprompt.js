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
   
   YOU NEED TO BE EXTRA SMART LIKE THE EINSTEIN AND GIVE THE OUTPUT AS A JSON FILE.
   "file" and "line" are required so this can be posted as an inline review comment:
   set "file" to the exact path of the new code change above (${chunk.file}), and
   "line" to the specific line number within its diff that the comment should attach to. eg.
   {
    deviates: false,
    deviationType: null,
    severity: "low",
    explanation: "...",
    citedPr: 15,
    file: "${chunk.file}",
    line: 1
    }

   `;
   return prompt;
}
export default buildPrompt;