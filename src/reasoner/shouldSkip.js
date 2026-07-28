function shouldSkip(matches, threshold = 0.75) {
 if (!matches || !Array.isArray(matches) || matches.length === 0) {
        return true;
    }
    return !matches.some(match => match.similarityScore >= threshold);


}

export default shouldSkip;