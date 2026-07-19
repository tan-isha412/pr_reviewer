function buildChunks(pr, chunks) {

    return chunks.map(chunk => ({

        prNumber: pr.number,

        title: pr.title,

        author: pr.author,

        mergedAt: pr.mergedAt,

        file: chunk.file,

        diff: chunk.diff,

        comments: chunk.comments,

        hasComments: chunk.hasComments

    }));

}
export default buildChunks;