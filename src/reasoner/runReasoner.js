import askLLM from "./askLLM.js";
import buildPrompt from "./buildprompt.js";
import shouldSkip from "./shouldSkip.js";
import parseResponse from "./parseResponse.js";
import filterbys from "./filterByServerity.js";
import dedupeFindings from "./dedupeFindings.js";
import writeFindings from "./writeFindings.js";

async function runReasoner(retrievedMatches)
{
    const results=[];
   for (const element of retrievedMatches)
    {
        if(shouldSkip(element.matches)===true)
            continue;
        const prompt=buildPrompt(element.newChunk,element.matches);
        const raw=await askLLM(prompt);
        const parsed=parseResponse(raw);
        if(parsed)
        results.push(parsed); 
    }
    const filtered = filterbys(results);
    const unique = dedupeFindings(filtered);
    await writeFindings(unique);
    return unique;
}
export default runReasoner;