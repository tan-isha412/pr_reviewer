import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import fetchDiff from "../src/github/fetchDiff.js";
import fetchReviewComments from "../src/github/fetchReviewComments.js";
import parseDiff from "../src/parser/parseDiff.js";
import attachComments from "../src/parser/attachComments.js";
import embedChunk from "../src/embedder/embedChunk.js";
import computeSimilarity from "../src/reasoner/computeSimilarity.js";
import runReasoner from "../src/reasoner/runReasoner.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OWNER = "tan-isha412";
const REPO = "pr_reviewer";
const SIMILARITY_THRESHOLD = 0.75;
const TOP_K = 5;
const CACHE_DIR = path.join(__dirname, ".cache");
const EMBED_CACHE_PATH = path.join(CACHE_DIR, "embeddings.json");
const FOLD_CACHE_PATH = path.join(CACHE_DIR, "fold-results.json");
// The embedding API's free-tier quota is tight enough that even 25s between
// calls isn't always safe -- back off hard and persist progress so a run can
// be resumed instead of re-spending quota on PRs already embedded.
const BACKOFF_SCHEDULE_MS = [10000, 20000, 40000, 60000, 90000, 120000];

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadJsonOrDefault(filePath, fallback) {
    try {
        return JSON.parse(await fs.readFile(filePath, "utf8"));
    } catch (err) {
        if (err.code === "ENOENT") return fallback;
        throw err;
    }
}

async function saveJsonCache(filePath, data) {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function loadDataset() {
    const raw = await fs.readFile(path.join(__dirname, "dataset.json"), "utf8");
    return JSON.parse(raw);
}

async function embedWithAdaptiveBackoff(chunk, label) {
    for (let attempt = 0; attempt <= BACKOFF_SCHEDULE_MS.length; attempt++) {
        const vector = await embedChunk(chunk);
        if (vector) return vector;
        if (attempt === BACKOFF_SCHEDULE_MS.length) {
            throw new Error(`Failed to embed ${label} after exhausting the backoff schedule.`);
        }
        const delay = BACKOFF_SCHEDULE_MS[attempt];
        console.log(`  ${label}: embedding not ready, backing off ${delay / 1000}s (attempt ${attempt + 1})`);
        await sleep(delay);
    }
}

// Fetch + chunk each labeled PR exactly the way the real ingest/chunk pipeline does,
// then embed each chunk exactly once via the real embedChunk.js. Embeddings are
// cached to disk by PR number so a run interrupted by rate limits can resume
// without re-embedding PRs it already has.
async function buildCorpus(dataset) {
    const cache = await loadJsonOrDefault(EMBED_CACHE_PATH, {});
    const corpus = [];

    for (const entry of dataset) {
        const key = String(entry.prNumber);
        if (cache[key]) {
            corpus.push({ entry, chunk: cache[key].chunk, vector: cache[key].vector });
            console.log(`  PR #${entry.prNumber}: using cached embedding`);
            continue;
        }

        const diff = await fetchDiff(OWNER, REPO, entry.prNumber);
        const comments = await fetchReviewComments(OWNER, REPO, entry.prNumber);
        const fileChunks = parseDiff(diff);
        const chunksWithComments = attachComments(fileChunks, comments);
        const chunk = {
            prNumber: entry.prNumber,
            title: entry.title,
            author: OWNER,
            mergedAt: null,
            ...chunksWithComments[0],
        };

        const vector = await embedWithAdaptiveBackoff(chunk, `PR #${entry.prNumber} (${entry.title})`);
        corpus.push({ entry, chunk, vector });
        cache[key] = { chunk, vector };
        await saveJsonCache(EMBED_CACHE_PATH, cache);
        console.log(`  embedded PR #${entry.prNumber} (${entry.title})`);
        await sleep(15000);
    }
    return corpus;
}

// Reproduces retrieveMatches.js's real search+filter logic against an in-memory fold
// (the full corpus minus the held-out item), using the real cosine-similarity function.
function retrieveFoldMatches(queryVector, fold) {
    const scored = fold
        .map(({ chunk, vector }) => ({ chunk, score: computeSimilarity(queryVector, vector) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, TOP_K)
        .filter(({ score }) => score >= SIMILARITY_THRESHOLD);

    return scored.map(({ chunk, score }) => ({ ...chunk, similarityScore: score }));
}

async function evaluate() {
    const dataset = await loadDataset();
    console.log(`Embedding ${dataset.length} historical PRs (once each, cached to disk)...`);
    const corpus = await buildCorpus(dataset);

    const foldCache = await loadJsonOrDefault(FOLD_CACHE_PATH, {});
    const results = [];

    for (const held of corpus) {
        const key = String(held.entry.prNumber);
        let result = foldCache[key];

        if (!result) {
            const fold = corpus.filter((c) => c.entry.prNumber !== held.entry.prNumber);
            const matches = retrieveFoldMatches(held.vector, fold);

            const retrievedMatches = [{ newChunk: held.chunk, matches }];
            const findings = await runReasoner(retrievedMatches, {
                repo: REPO,
                prNumber: `eval-${held.entry.prNumber}`,
                commitId: "eval",
            });

            const flagged = findings.length > 0;
            const citedPr = flagged ? findings[0].citedPr : null;
            const citedCorrectly = flagged && held.entry.expectedCitedPr
                ? citedPr === held.entry.expectedCitedPr
                : null;

            result = {
                prNumber: held.entry.prNumber,
                title: held.entry.title,
                kind: held.entry.kind,
                shouldFlag: held.entry.shouldFlag,
                flagged,
                citedPr,
                expectedCitedPr: held.entry.expectedCitedPr ?? null,
                citedCorrectly,
                topMatchScore: matches[0]?.similarityScore ?? null,
                explanation: flagged ? findings[0].explanation : null,
            };

            foldCache[key] = result;
            await saveJsonCache(FOLD_CACHE_PATH, foldCache);
            await sleep(15000);
        } else {
            console.log(`  PR #${held.entry.prNumber}: using cached fold result`);
        }

        results.push(result);
        console.log(
            `  PR #${result.prNumber} [${result.kind}] -> flagged=${result.flagged}` +
            (result.flagged ? `, citedPr=${result.citedPr}` : "") +
            ` (expected shouldFlag=${result.shouldFlag})`
        );
    }

    const tp = results.filter((r) => r.shouldFlag && r.flagged).length;
    const fp = results.filter((r) => !r.shouldFlag && r.flagged).length;
    const fn = results.filter((r) => r.shouldFlag && !r.flagged).length;
    const tn = results.filter((r) => !r.shouldFlag && !r.flagged).length;
    const precision = tp + fp > 0 ? tp / (tp + fp) : null;
    const recall = tp + fn > 0 ? tp / (tp + fn) : null;
    const evidenceCorrect = results.filter((r) => r.citedCorrectly === true).length;
    const evidenceChecked = results.filter((r) => r.citedCorrectly !== null).length;

    const summary = {
        totalPRs: results.length,
        truePositives: tp,
        falsePositives: fp,
        falseNegatives: fn,
        trueNegatives: tn,
        precision,
        recall,
        evidenceQuality: `${evidenceCorrect}/${evidenceChecked} true positives cited the correct precedent PR`,
    };

    console.log("\n=== Summary ===");
    console.log(JSON.stringify(summary, null, 2));

    await fs.writeFile(
        path.join(__dirname, "results.json"),
        JSON.stringify({ summary, results }, null, 2)
    );
    console.log("\nWrote eval/results.json");

    return { summary, results };
}

evaluate().catch((err) => {
    console.error("Eval run failed:", err);
    process.exit(1);
});
