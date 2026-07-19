import askLLM from "./askLLM";
import buildPrompt from "./buildprompt"
import shouldSkip from "./shouldSkip"
import parseResponse from "./parseResponse"
import filterbys from "./filterByServerity"
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
    writeFindigs(unique);
    return unique;
}
module.exports=runReasoner;