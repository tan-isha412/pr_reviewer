function shouldSkip(matches, threshold = 0.75) {

    return matches.filter(
        match => match.similarityScore >= threshold
    );

}

export default shouldSkip;