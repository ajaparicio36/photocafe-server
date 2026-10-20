# Archive server improvement scope

This repository owns customer uploads and archive delivery. Central discovery: [Flutter edsdk improvement index](../../../.worktrees/keychain-edsdk-release/docs/improvements/README.md), [frame editor/catalog questions](../../../.worktrees/keychain-edsdk-release/docs/improvements/frame-editor.md), and [pending interview](../../../.worktrees/keychain-edsdk-release/docs/improvements/interview.md). These relative links assume the current sibling workspace layout.

Source baseline: `main` at `804c78bfe2e021820e132da7b337f2e811e99b16`.

- `src/lib/storage.ts:4,14–25,38–54` uses `storage/<archiveId>` and recursively deletes archive directories older than eight hours by birth time.
- `src/lib/cron.ts:4–21` schedules cleanup every eight hours in Asia/Manila; eligibility and actual deletion time differ. `src/app/api/delete/route.ts:4–6,33–34` exposes the same purge through GET/DELETE.
- `src/app/api/upload/route.ts:9–47` accepts multipart files and optional archive ID, generates a UUID otherwise, writes original filenames, and constructs URLs from `NEXT_PUBLIC_BASE_URL`.

The inspected upload/retrieval service is a customer archive boundary. No frame-template API was found in the route inventory. A persistent frame catalog is an unresolved proposal and must live outside customer-retention storage. Local Next.js plus Cloudflare is user-described deployment context, not runtime-verified hosting evidence. No direct SQLite dependency was present in `package.json`.

[Local tracker](agents/issue-tracker.md), [triage roles](agents/triage-labels.md), and [domain rules](agents/domain.md) configure this repository. No routes, storage behavior, deployment, or source code changed; no GUI/API runtime QA, build, test, or performance measurement was run.
