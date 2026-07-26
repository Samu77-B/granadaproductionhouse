# Sanity CMS — Granada Production House

The public website stays **static HTML** on Fasthosts. Editors use **Sanity Studio** (a separate web app) to change text and images. When content is published, a build step updates the `build/` folder and uploads to Fasthosts.

## 1. Create a Sanity project (one time)

1. Sign in at [sanity.io](https://www.sanity.io) and create a new project (free tier is enough for this site).
2. Copy the **Project ID** from [sanity.io/manage](https://www.sanity.io/manage).
3. In the repo root, copy `.env.example` to `.env` and set `SANITY_PROJECT_ID`.
4. In `studio/`, copy `.env.example` to `.env` and set `SANITY_STUDIO_PROJECT_ID` to the same ID.

## 2. Install and run Studio locally

```bash
npm install
npm install --prefix studio
npm run studio
```

Open the URL shown in the terminal (usually `http://localhost:3333`). Log in with your Sanity account and invite the client under **Project → Members** (Editor role).

## 3. Host Studio for the client (recommended)

So the client does not run anything on their computer:

```bash
npm run studio:deploy
```

Choose a hostname such as `granadaproductionhouse`. They will use:

`https://granadaproductionhouse.sanity.studio`

Enable **2FA** on Sanity accounts for anyone with edit access.

## 4. What editors can change

| Studio section | Maps to site |
|----------------|--------------|
| Home page | Hero slides, home about blocks |
| About / Contact / Services / Our work / Locations (main) | Each main page’s hero + body |
| Location detail pages | One document per location (text, hero, side image, gallery) |
| Team members | Names, roles, bios, photos |
| Site settings | Default SEO, contact email, Instagram |

Upload images in Studio; Sanity hosts and optimizes them. The static build will reference Sanity CDN URLs (next implementation step).

## 5. Export content (for backup / future build)

After `.env` is configured:

```bash
npm run content:export
```

Writes `content/sanity-export.json` (gitignored).

## 6. Go live on Fasthosts (workflow)

**Today:** HTML in `build/` is deployed manually (FTP/SFTP) as today.

**Next step (recommended):** Add a static site generator (e.g. Eleventy) that reads Sanity and outputs `build/`, then GitHub Actions on publish:

1. Client clicks **Publish** in Sanity.
2. Webhook or scheduled job runs `npm run build`.
3. Action uploads `build/` to Fasthosts via SFTP.

Production Fasthosts never runs Sanity—only static files—keeping the site secure.

## 7. Security notes

- Do **not** commit `.env` or API tokens.
- Use a **Viewer** token only in CI for builds; never embed write tokens in the website.
- Client uses Sanity login only; no FTP or cPanel for content.

## 8. Current site vs CMS

The live `build/` pages still contain hard-coded HTML. Content in Sanity is ready to edit; wiring Studio fields into generated pages is the next development task. Until then, use Studio to prepare/copy content, or ask your developer to run the Eleventy/build integration.
