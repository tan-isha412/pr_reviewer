function computeSimilarity(v1, v2)
{
    let dot = 0;
    let mag1 = 0;
    let mag2 = 0;
    for (let i = 0; i < v1.length; i++)
    {
        dot += v1[i] * v2[i];
        mag1 += v1[i] * v1[i];
        mag2 += v2[i] * v2[i];
    }
    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);
    if (mag1 === 0 || mag2 === 0)
        return 0;
    return dot / (mag1 * mag2);
}
export default computeSimilarity;