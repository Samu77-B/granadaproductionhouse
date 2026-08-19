# Granada Production House — website

Static site output lives in [`build/`](build/). Hostinger Git deploys the repo root; `.htaccess` serves `build/` at `/` and redirects `/build/` URLs.

## Content editing (Sanity)

The client edits text and images in Sanity Studio. After **Publish**, the live site updates without FTP.

Setup, CORS, seeding, and client workflow: **[docs/SANITY.md](docs/SANITY.md)**

Quick start (after you have a Sanity project ID):

```bash
npm install
npm install --prefix studio
# Copy .env.example → .env and studio/.env.example → studio/.env
# Put the same Project ID in build/js/cms-config.js
npm run content:seed
npm run studio
```

Host Studio for the client: `npm run studio:deploy` → `https://granadaproductionhouse.sanity.studio`
