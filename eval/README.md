# Evaluation harness

A held-out, leave-one-out evaluation of the retrieval-then-reasoning pipeline against a
labeled corpus of 12 real, merged PRs on this repo itself.

## Why a seeded corpus, not organic history

At the time this was built, `pr_reviewer`'s own real merged-PR history was exactly one PR
(#1, the metadata/index alignment fix) — nowhere near enough for a meaningful held-out
evaluation, and the same is true of every other repo under this account (none had any
merged PRs at all). This is the "cold start" limitation the main README already documents.

Rather than skip the evaluation, the corpus was built deliberately: 3 more real PRs were
opened and merged to establish distinct conventions (each with a real reviewer comment
explaining the "why," same as PR #1), then 8 more held-out test PRs were opened and merged
-- 4 that clearly violate one of the 4 established conventions, and 4 that are either
unrelated or that *correctly* follow a convention (to test for false positives on code that
merely looks similar). Every PR is real, on GitHub, permanently: [#1](../../pull/1),
[#3](../../pull/3)-[#9](../../pull/9), [#12](../../pull/12), [#13](../../pull/13),
[#15](../../pull/15).

Ground truth (`dataset.json`) was assigned by construction -- I know which convention each
PR does or doesn't violate, because I wrote it that way. See `dataset.json` for the full
labels and reasoning per PR.

## Methodology

`runEval.js` does true leave-one-out over the 12 labeled PRs:

1. **Embed once, cache always.** Each PR's diff + review comments are fetched and chunked
   exactly the way the real `ingest`/`chunk` pipeline does, then embedded exactly once via
   the real `embedChunk.js`. Embeddings are cached to `.cache/embeddings.json` by PR number,
   so a run interrupted by the embedding API's rate limit can resume without re-spending
   quota on PRs it already has.
2. **For each PR, held out in turn:** build an in-memory index from the *other 11* cached
   vectors (the real `IndexFlatL2` polyfill), use the held-out PR's own cached vector as the
   query (exactly what `retrieveMatches.js` would compute for a live incoming PR with this
   diff), and search with the real cosine-similarity function and the production 0.75
   threshold.
3. **Feed the real reasoning pipeline.** The retrieved matches go straight into the real
   `runReasoner.js` (`buildPrompt` → `askLLM` → `parseResponse` → `filterBySeverity` →
   `dedupeFindings`) -- nothing about the reasoning path is mocked or simplified.
4. **Score against ground truth.** A PR is "flagged" if a finding survives the severity
   filter. Compare against `shouldFlag`, and check `citedPr` against `expectedCitedPr` where
   one is defined.

Run it yourself: `npm run eval` (needs `GEMINI_API_KEY`; takes several minutes because of
deliberate pacing around the embedding API's per-minute quota).

## Results

See `results.json` for the full per-PR output and computed precision/recall for the most
recent completed run. Numbers are intentionally not duplicated here to avoid this file going
stale relative to the actual data -- read `results.json`'s `summary` block for the current
headline figures, and see the narrative below for how the corpus itself was corrected after
the first run surfaced a labeling problem.

### The first run wasn't clean, and that's the interesting part

The first raw run (`results-run1-raw.json`) scored precision 0.67, recall 1.0, with 2 "false
positives": PR #3 (`fetchWithRetry.js`) and PR #10 (`sleep.js`, since replaced by PR #15 in
the active dataset) were both flagged as deviating from each other.

Manual inspection (exactly the "evidence quality" check this project's own design doc calls
for, not just trusting the automated tally) showed these weren't hallucinations. `PR #3` and
`PR #10` genuinely, independently defined an identical inline `sleep()` helper -- an accident
of how the test corpus was authored, not a flaw in the model's reasoning. The bot's citation
in both directions correctly named the other file and explained the duplication accurately.
That's a real DRY violation a human reviewer should also flag; the ground-truth label (which
only anticipated the four seeded conventions) was the thing that was wrong, not the system.

The fix was **not** a threshold or prompt tweak -- raising the similarity threshold to
suppress this would have made the tool less sensitive everywhere just to hide a labeling
mistake. The actual fixes:

1. [PR #14](../../pull/14) made `fetchWithRetry.js` import the shared `sleep.js` instead of
   redefining it -- a real code-quality fix, merged into `main`.
2. Because GitHub PR diffs are immutable, PR #3/#10's *historical* diffs still show the
   original duplication forever -- fixing `main` after the fact can't retroactively change
   what a leave-one-out run sees when it re-fetches those specific PRs. So PR #10 was
   replaced in the active dataset with [PR #15](../../pull/15), a clamp helper with no
   accidental overlap with anything else in the corpus.

One more finding worth surfacing rather than hiding behind a strict pass/fail: PR #6's
citation didn't exact-match its `expectedCitedPr` (it cited #12 instead of #1). Reading the
full explanation showed the model's prose correctly named *both* #1 and #12 as precedent --
the single-field `citedPr` output just picked the more structurally similar one (#12,
another small `buildXIndex.js`, arguably a better match than #1 itself). Manually verified:
all 4 true positives cited genuinely relevant precedent, not a coincidental surface match --
even the one that "failed" the strict automated check.
