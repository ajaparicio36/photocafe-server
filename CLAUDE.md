# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start HTTPS dev server on `https://photocafe.local:3000` (Turbopack). Requires `./certificates/photocafe.local+3.pem` and matching key; these are gitignored and must be generated locally (e.g. via `mkcert`) before the first run.
- `npm run build` — production Next.js build.
- `npm run start` — run the production build.
- `npm run lint` — ESLint via `next/core-web-vitals` + `next/typescript`.

No test runner is configured.

## Purpose

Server-side companion for the Click Click Photobooth Cafe. Customers' photo sessions are uploaded from a booth/client, grouped under an `archiveId`, served back via a shareable URL, and auto-purged after 8 hours.

## Architecture

Next.js 15 App Router, React 19, TypeScript (`strict`, `@/*` → `src/*`), Tailwind v4, shadcn/ui (`new-york`, lucide icons).

### Archive lifecycle

An archive is a directory on local disk: `./storage/<archiveId>/<originalFilename>`. The `storage/` directory is gitignored and created on demand by `src/lib/storage.ts` (`ensureStorageDir`, `ensureArchiveDir`).

Flow:
1. **Upload** — `POST /api/upload` (multipart `files[]`, optional `archiveId`). Generates a UUID if no `archiveId` is sent, writes each file to `storage/<archiveId>/`, and returns public URLs using `process.env.NEXT_PUBLIC_BASE_URL` (falls back to `http://localhost:3000`).
2. **List** — `GET /api/retrieve/[id]` returns `{ archiveId, files: [{ fileName, fullPath, url }] }`.
3. **Serve a file** — `GET /api/files/[archiveId]/[filename]` streams the file with inferred MIME type (`mime-types`), sets permissive CORS, and uses `Content-Disposition: inline` for images so the lightbox can preview them.
4. **Download one file** — `GET /api/retrieve/[id]/download/[filename]` forces `Content-Disposition: attachment`.
5. **Download all as zip** — `GET /api/retrieve/[id]/zip` streams a zip via `archiver` piped into a `ReadableStream`.
6. **View** — client page `src/app/archive/[archiveId]/page.tsx` composes `ArchiveHeader`, `FileGrid`, `FileCard`, and `LightboxModal` from `src/components/`.

When adding a new route that reads from storage, always go through `getArchiveDir` / `getFilesInArchive` in `src/lib/storage.ts` — do not re-derive the storage path elsewhere.

Dynamic route params are `Promise<...>` (Next 15 convention): `await params` before use.

### Cleanup (two mechanisms, both active)

- **In-process cron** — `src/lib/cron.ts` uses `node-cron` (`0 */8 * * *`, `Asia/Manila`) and is started from `src/app/layout.tsx` behind a `typeof window === "undefined"` guard. This runs only while a server process is alive; it's appropriate for a long-running host but does nothing on serverless cold-start-only environments.
- **HTTP-triggered cleanup** — `GET`/`DELETE /api/delete` calls `deleteOldFiles()` directly. `vercel.json` schedules `/api/delete` daily (`0 0 * * *`) via Vercel Cron, which is the cleanup path when deployed to Vercel.

Both paths delegate to `deleteOldFiles()` in `src/lib/storage.ts`, which deletes any archive directory whose `birthtime` is more than 8 hours old. If you change the retention window, update it in one place — the function — rather than duplicating the constant.

### Environment

- `NEXT_PUBLIC_BASE_URL` — absolute origin used when constructing file URLs returned by `/api/upload` and `/api/retrieve/[id]`. Must be set in production so links work off-host.
- `FIREBASE_STORAGE_BUCKET` and a `serviceAccount.json` at the project root are read by `src/lib/firebase/admin.ts`. Firebase admin is initialized but is not currently used by any route — treat it as scaffolding. Do not add `serviceAccount.json` imports elsewhere; it is intentionally not committed.

### Hosting constraint

`next.config.ts` raises Server Action `bodySizeLimit` to 100 MB. The upload route uses `formData()` (not Server Actions), but the same realistic payload sizes apply — very large archives will bump into platform function limits before they hit any app-level cap. Keep this in mind before suggesting Server Action–based uploads.

## Conventions

- TypeScript: `no any`; prefer `unknown` + type guards, discriminated unions, utility/conditional/mapped types, `satisfies` for literal narrowing.
- Route handlers are arrow-function `export const GET/POST/...` with `NextRequest` / `NextResponse`.
- Client components marked with `"use client"`; the archive viewer is the only client page.
- Styling via Tailwind v4 plus the brand layer in `src/styles/brand.css` (`.brand-bg-primary`, `.brand-logo`, etc.) — reuse these classes rather than hardcoding brand colors.
- `cn()` from `src/lib/utils.ts` for conditional class merging.
