function attachComments(chunks, comments) {

    return chunks.map(chunk => {
        const matchedComments = comments.filter(comment =>
            comment.path === chunk.file
        );
        return {
            ...chunk,
            comments: matchedComments,
            hasComments: matchedComments.length > 0
        };
    });
}
export default attachComments;