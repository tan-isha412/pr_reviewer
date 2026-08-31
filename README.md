# PR Reviewer

![CI](https://github.com/tan-isha412/pr_reviewer/actions/workflows/ci.yml/badge.svg)

A pull request code reviewer that checks new PR diffs against a repo's own merged-PR history for conventions, using vector similarity search (FAISS) and the Gemini API to flag deviations.

## How it works

1. **Offline preprocessing** (`npm run preprocess`): ingests a repo's merged PRs, chunks their diffs, embeds each chunk, and builds a FAISS vector index (`data/processed/faiss.index`) alongside its aligned metadata (`data/processed/vector-metadata.json`).
2. **Online review** (`app.js`): a GitHub webhook server. On `pull_request.opened`/`synchronize`, it embeds the new PR's diff, retrieves similar past decisions from the index, asks Gemini whether the new change deviates from them, and posts review comments on the PR for anything that does.

## Setup

```bash
npm install
cp .env.example .env   # fill in GITHUB_TOKEN, GITHUB_WEBHOOK_SECRET, GEMINI_API_KEY
```

Required environment variables (the server exits immediately if any are missing):

- `GITHUB_TOKEN`
- `GITHUB_WEBHOOK_SECRET`
- `GEMINI_API_KEY`

## Usage

```bash
npm run preprocess   # build the vector index from a repo's merged PR history
npm start             # run the webhook server
npm test              # run the test suite
```

Or with Docker:

```bash
docker compose run preprocess
docker compose up app
```

## Testing

Unit tests cover the pure parsing/reasoning logic; integration tests exercise `retrieveMatches`, `runReasoner`, and `handleWebhook` against mocked externals (no network calls). Run them with:

```bash
npm test
```

## License

MIT
