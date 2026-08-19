# Sanity CMS — Granada Production House

The public site stays **static HTML** on Hostinger. Editors change text and images in **Sanity Studio** (a separate website). After they click **Publish**, the live pages fetch the new content. No FTP for the client.

Until a Sanity project ID is added, the site keeps showing the current hard-coded HTML.

## What the client can change

| Studio section | On the website |
|----------------|----------------|
| Home page | Hero slides, overlay copy, about headline/blocks, about image |
| About | Heading, photo, body text |
| Meet the team | Hero + each person's name, role, bio, email, photo |
| Our services | Hero, side image, service titles and descriptions |
| Our work | Hero, intro, gallery images and captions |
| Locations (main page) | Hero, body paragraphs |
| Location detail pages | Title, intro, hero, side image, gallery |
| Site settings | Footer tagline, emails, phone, Instagram |

Galleries and slideshows are replaced as a whole. To change one image in a gallery, keep the other images in Studio too (upload the current set the first time you edit that gallery).

## One-time setup

### 1. Create a Sanity project

1. Sign up at [sanity.io](https://www.sanity.io) (free tier is enough).
2. Create a new project, dataset name `production`.
3. Copy the **Project ID**.

### 2. Put the Project ID in the repo

Root `.env` (copy from `.env.example`):

```
SANITY_PROJECT_ID=abc123xyz
SANITY_DATASET=production
```

`studio/.env` (copy from `studio/.env.example`):

```
SANITY_STUDIO_PROJECT_ID=abc123xyz
SANITY_STUDIO_DATASET=production
```

`build/js/cms-config.js` — same ID, so the live site can read content:

```js
window.GPH_CMS = {
  projectId: "abc123xyz",
  dataset: "production",
  apiVersion: "2024-01-01",
};
```

Then bump the `cms-config.js?v=` number in the HTML pages so browsers load the new file.

### 3. CORS (required or the browser will block the CMS)

In [sanity.io/manage](https://www.sanity.io/manage) → the project → **API** → **CORS origins**, add:

- `https://www.granadaproductionhouse.com`
- `https://granadaproductionhouse.com`

Leave **Allow credentials** off. Dataset `production` should stay **public** (read-only for the website).

### 4. Install, seed current copy, run Studio

```bash
npm install
npm install --prefix studio
```

Create an **Editor** token: Manage → API → Tokens. Put it in root `.env` as `SANITY_WRITE_TOKEN` (never commit this).

```bash
npm run content:seed
npm run studio
```

Open `http://localhost:3333`, log in, upload images, click **Publish**.

### 5. Host Studio for the client

```bash
npm run studio:deploy
```

Hostname is already set to `granadaproductionhouse`, so the editor URL is:

`https://granadaproductionhouse.sanity.studio`

Invite the client: **Project → Members → Editor**. Ask them to turn on **2FA**.

### 6. Deploy the website

Commit the `cms-config.js` project ID and the HTML/`js` changes, then push so Hostinger Git deploy goes live.

After that, the client only uses Studio. **Publish** updates the site within a few seconds (Sanity CDN cache is short).

## Day-to-day for the client

1. Go to `https://granadaproductionhouse.sanity.studio`
2. Open the page they want to change
3. Edit text or click the image to replace it
4. Click **Publish**
5. Refresh granadaproductionhouse.com (hard refresh if the old image is cached)

They never need FTP, Git, or Hostinger.

## Security

- Do not commit `.env`, `studio/.env`, or API tokens.
- The website only *reads* public content. Write access is Sanity login only.
- Do not put an Editor token in `build/js/`.

## If something does not update

- Confirm the document is **Published**, not just saved as a draft
- Confirm `cms-config.js` has the real project ID
- Confirm the website domain is in Sanity CORS origins
- Hard-refresh the page (Ctrl+F5)
