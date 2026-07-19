function shouldSkip(matches, threshold = 0.75) {

    return matches.some(
        match => match.similarityScore >= threshold
    );

}

export default shouldSkip;