import { defineCliConfig } from "sanity/cli";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

export default defineCliConfig({
  api: {
    projectId: projectId || "replace_with_project_id",
    dataset,
  },
  studioHost: "granadaproductionhouse",
});
