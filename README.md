# Granada Production House — website

Static site output lives in [`build/`](build/). Hostinger Git deploys the repo root; `.htaccess` serves `build/` at `/` and redirects `/build/` URLs. For Fasthosts later, upload the **contents** of `build/` to `public_html`.

## Content editing (Sanity)

Editors use **Sanity Studio** for text and images. Setup and client workflow:

**[docs/SANITY.md](docs/SANITY.md)**

Quick start:

```bash
npm install
npm install --prefix studio
# Copy .env.example → .env and studio/.env.example → studio/.env (add Project ID)
npm run studio
```

Host Studio for the client: `npm run studio:deploy`

The next development step is a build script that reads Sanity and regenerates `build/` HTML automatically after publish.
