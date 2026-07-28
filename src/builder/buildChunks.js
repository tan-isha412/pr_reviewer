function buildChunks(pr, chunks) {

    return chunks.map(chunk => ({

        prNumber: pr.pr_number||pr.number,

        title: pr.title,

        author: pr.author,

        mergedAt: pr.merged_at || pr.mergedAt,

        file: chunk.file,

        diff: chunk.diff,

        comments: chunk.comments,

        hasComments: chunk.hasComments

    }));

}
export default buildChunks;