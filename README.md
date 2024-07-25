# Badminton Game Generator

This is a simple web app (and REST API) that makes a list of matches given a list of players.

This project uses Next.js and is deployed on Vercel. The game generation algorithm lives in `packages/generator` and the web app lives at `app`.

## Getting Started

```bash
cd app
bun install  # npm, yarn, pnpm and other node package managers should work too
bun run dev
```

On commit, the app is built and deployed to Vercel.

On a non-main branch, When a build is successful it is deployed to a preview version, which the Vercel bot will post a link to on the Pull Request, once opened.

On the main branch, When a build is successful it is deployed to the live version: https://badminton.jakew.me
