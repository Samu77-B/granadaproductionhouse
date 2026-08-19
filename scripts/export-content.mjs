import { createClient } from "@sanity/client";
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(join(rootDir, ".env"));

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || "production";

if (!projectId || projectId === "your_project_id") {
  console.error("Set SANITY_PROJECT_ID in .env (copy from .env.example).");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_READ_TOKEN || undefined,
  useCdn: false,
});

const query = `{
  "siteSettings": *[_type == "siteSettings"][0],
  "homePage": *[_type == "homePage"][0],
  "aboutPage": *[_type == "aboutPage"][0],
  "contactPage": *[_type == "contactPage"][0],
  "servicesPage": *[_type == "servicesPage"][0],
  "ourWorkPage": *[_type == "ourWorkPage"][0],
  "teamPage": *[_type == "teamPage"][0],
  "locationsIndexPage": *[_type == "locationsIndexPage"][0],
  "locations": *[_type == "location"] | order(title asc),
  "team": *[_type == "teamMember"] | order(sortOrder asc, name asc)
}`;

async function main() {
  const data = await client.fetch(query);
  const outDir = join(rootDir, "content");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "sanity-export.json");
  writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");
  console.log(`Exported Sanity content to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
