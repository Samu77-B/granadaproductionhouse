import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "node:fs";
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
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId || projectId === "your_project_id") {
  console.error("Set SANITY_PROJECT_ID in .env");
  process.exit(1);
}

if (!token) {
  console.error("Set SANITY_WRITE_TOKEN in .env (Editor token from Sanity → API → Tokens).");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.SANITY_API_VERSION || "2024-01-01",
  token,
  useCdn: false,
});

function block(text, key, marks = []) {
  return {
    _type: "block",
    _key: key,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `${key}s`, text, marks }],
  };
}

function blockWithLink(before, href, label, after, key) {
  const markKey = `${key}l`;
  return {
    _type: "block",
    _key: key,
    style: "normal",
    markDefs: [{ _type: "link", _key: markKey, href }],
    children: [
      { _type: "span", _key: `${key}a`, text: before, marks: [] },
      { _type: "span", _key: `${key}b`, text: label, marks: [markKey] },
      { _type: "span", _key: `${key}c`, text: after, marks: [] },
    ],
  };
}

function slug(current) {
  return { _type: "slug", current };
}

const documents = [
  {
    _id: "siteSettings",
    _type: "siteSettings",
    siteTitle: "Granada Production House",
    defaultMetaDescription:
      "A boutique photoshoot production company based in Granada, specialising in fashion, commercial, editorial and advertising print shoots, film production and events.",
    contactEmail: "hola@granadaproductionhouse.com",
    enquiryEmail: "enquiries@granadaproductionhouse.com",
    phone: "+34 7222 23 7929",
    instagramUrl: "https://www.instagram.com/granadaproductionhouse",
    footerTagline: "Boutique photoshoot production company based in Granada, Spain.",
  },
  {
    _id: "homePage",
    _type: "homePage",
    heroCopy:
      "A Boutique photoshoot production company, based in Granada, specialising in fashion, commercial, editorial & advertising print shoots, film production and events.",
    aboutHeadline: "We translate complexed creative concepts into iconic visual assets.",
    aboutBlocks: [
      {
        _key: "landscape",
        subhead: "The landscape",
        body: "Granada is our backyard. We offer a curated portfolio of locations to provide the perfect light and architectural depth for your next campaign.",
      },
      {
        _key: "craft",
        subhead: "The Craft.",
        body: "Specialised consultancy for print and production. With thirty years in the industry, we ensure the technical integrity of your project from the first shot to the final ink on paper.",
      },
    ],
  },
  {
    _id: "aboutPage",
    _type: "aboutPage",
    metaTitle: "About Us — Granada Production House",
    metaDescription:
      "Granada Production House — a sister-led production company with over 30 years of experience in fashion, editorial, and print production across Andalucía.",
    heroEyebrow: "About Us",
    heroTitle: "A Legacy of Sight, Style & Storytelling",
    body: [
      block(
        "At Granada Production House, production is in our DNA. Founded by two sisters with over 30 years of combined experience in fashion, editorial, and print production, we blend international production standards with the beauty and soul of Andalucía.",
        "a1"
      ),
      block(
        "Based in Granada, we help brands, photographers, and agencies bring their creative visions to life through unforgettable locations, seamless coordination, and local expertise. From hidden gems and iconic backdrops to permits, accommodations, equipment rentals, and production support — we handle every detail so your team can focus on creating exceptional work.",
        "a2"
      ),
      block(
        "As a sister-led company, we bring a shared creative eye, strong industry experience, and a personal approach to every project.",
        "a3"
      ),
      block("Locally rooted. Globally minded. Let's create something unforgettable together.", "a4"),
    ],
  },
  {
    _id: "teamPage",
    _type: "teamPage",
    metaTitle: "Meet The Team — Granada Production House",
    metaDescription:
      "Meet the Granada Production House team — producers, casting directors, and production specialists based in Granada and London.",
    heroEyebrow: "Meet The Team",
    heroTitle: "People behind the frame",
  },
  {
    _id: "contactPage",
    _type: "contactPage",
    metaTitle: "Contact — Granada Production House",
    metaDescription: "Contact Granada Production House to start your next creative project in Granada.",
    heroEyebrow: "Contact",
    heroTitle: "Looking to start your project?",
    introText: [
      block(
        "If you're interested in working on a creative project with us, simply pop us a call or fill out the contact form below and one of the team will be in touch within 24 hours! From here, we'll either quote on the spot or arrange a video call to discuss the project further before quoting and booking.",
        "c1"
      ),
      blockWithLink(
        "For non-project enquiries, please email us at ",
        "mailto:enquiries@granadaproductionhouse.com",
        "enquiries@granadaproductionhouse.com",
        ".",
        "c2"
      ),
    ],
  },
  {
    _id: "servicesPage",
    _type: "servicesPage",
    metaTitle: "Our Services — Granada Production House",
    metaDescription:
      "Complete 360° production support from Granada Production House — location scouting, logistics, permits, crew, casting, and equipment.",
    heroEyebrow: "Our Services",
    heroTitle: "We LOVE what we do — and we do it exceptionally well.",
    heroLede:
      "From pre-production planning to on-the-ground coordination, we provide complete 360° production support tailored to your project needs.",
    services: [
      { _key: "s1", title: "Curated location scouting", description: "Tailored to your creative vision." },
      {
        _key: "s2",
        title: "Travel logistics",
        description: "Coordinating travel logistics, accommodation, and visa support.",
      },
      {
        _key: "s3",
        title: "Permits & clearances",
        description: "Working closely with local government authorities to secure permits and filming clearances.",
      },
      {
        _key: "s4",
        title: "Carnets & customs",
        description: "Organising carnets and customs documentation.",
      },
      {
        _key: "s5",
        title: "Insurance & risk",
        description: "Managing insurance coordination and risk assessments.",
      },
      {
        _key: "s6",
        title: "Transport",
        description: "Booking transport, including location vehicles, car hire, and professional drivers.",
      },
      {
        _key: "s7",
        title: "Crew & equipment",
        description: "Hiring experienced local crews, trusted service providers, and production equipment.",
      },
      { _key: "s8", title: "Casting coordination", description: "Model and talent casting coordination." },
      {
        _key: "s9",
        title: "Accommodation partnerships",
        description: "Contracting and managing hotel and accommodation partnerships.",
      },
    ],
  },
  {
    _id: "ourWorkPage",
    _type: "ourWorkPage",
    metaTitle: "Our Work — Granada Production House",
    metaDescription: "Selected fashion, commercial and editorial work produced by Granada Production House.",
    heroEyebrow: "Our Work",
    heroTitle: "Selected productions",
    heroLede:
      "A look at recent fashion, commercial and editorial work produced across Granada and the surrounding landscape.",
    introHeadline: "Campaigns shaped by light, place, and craft.",
    intro:
      "From coastal fashion stories to city editorials, our production work is built around locations that give each campaign a clear visual identity — and logistics that keep the day calm and considered.",
  },
  {
    _id: "locationsIndexPage",
    _type: "locationsIndexPage",
    metaTitle: "Locations — Granada Production House",
    metaDescription:
      "Explore curated shoot locations across Granada and Andalucía — Moorish architecture, Mediterranean coastlines, city centre, and alpine landscapes.",
    heroEyebrow: "Locations",
    heroTitle: "Granada is our backyard",
    bodyParagraphs: [
      "Looking to capture some amazing images in Granada? Look no further! We're the go-to production company in the Andalucía area, and we've got all the inside scoop to make your shoot unforgettable. If you want a place that instantly gets your creative brain buzzing, Granada is one of those cities.",
      "It's honestly wild how much visual variety you get in such a small area. One minute you're shooting in whitewashed alleys and crumbling stone stairways, the next you're surrounded by ornate Moorish arches, tiled courtyards, and palm-filled gardens. You barely have to move, but every frame looks completely different. The light here is a dream. Soft, golden, flattering — especially in the mornings and around sunset. The buildings and stone bounce the light beautifully, so even simple setups look elevated. If you love working with natural light, Granada really shows up for you.",
      "We've got a knack for finding unique and quirky backdrops as well as breathtaking scenic spots. From hidden gems to iconic locations, we'll suggest the perfect locations to make your content pop!",
      "But that's not all — we'll take care of all the nitty-gritty details too. Permits? No problem. Accommodation? We've got you covered. Equipment? Ready to hire! We'll ensure your team has everything they need to focus on creating stunning work.",
      "And here's the best part: we'll let you in on the local secrets. So, let's make your shoot in Granada absolutely unforgettable. Get in touch with us today and let's capture some magic together!",
    ],
  },
  {
    _id: "location-moorish-architecture",
    _type: "location",
    title: "Moorish Architecture",
    slug: slug("moorish-architecture"),
    formLocationKey: "moorish-architecture",
    sortOrder: 1,
    cardDescription: "Ornate details, warm stone, and timeless Andalusian backdrops rich in culture and atmosphere.",
    metaTitle: "Moorish Architecture — Granada Production House",
    metaDescription: "Shoot locations featuring Moorish architecture across Granada.",
    heroEyebrow: "Locations",
    heroTitle: "Moorish Architecture",
    heroLede: "Ornate details, warm stone, and timeless Andalusian backdrops rich in culture and atmosphere.",
    introText: "Ornate details, warm stone, and timeless Andalusian backdrops rich in culture and atmosphere.",
    enquiryIntro: "Share a few details and one of the team will be in touch within 48 hours.",
  },
  {
    _id: "location-historic-and-traditional",
    _type: "location",
    title: "Historic and Traditional",
    slug: slug("historic-and-traditional"),
    formLocationKey: "historic-and-traditional",
    sortOrder: 2,
    cardDescription:
      "Granada's unique architecture provides an instant, textured depth that makes subjects pop without complex studio setups. Additionally, the hillside alleys of traditional quarters capture dramatic natural lighting and timeless sunset backdrops that simply cannot be replicated.",
    metaTitle: "Historic and Traditional — Granada Production House",
    metaDescription: "Historic and traditional shoot locations across Granada and Andalucía.",
    heroEyebrow: "Locations",
    heroTitle: "Historic and Traditional",
    heroLede:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    introText:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    enquiryIntro: "Share a few details and one of the team will be in touch within 48 hours.",
  },
  {
    _id: "location-mediterranean-coastlines",
    _type: "location",
    title: "Mediterranean Coastlines",
    slug: slug("mediterranean-coastlines"),
    formLocationKey: "mediterranean-coastlines",
    sortOrder: 3,
    cardDescription:
      "Sunlit shores, textured cliffs, and expansive sea views ideal for clean, natural, and light-filled imagery.",
    metaTitle: "Mediterranean Coastlines — Granada Production House",
    metaDescription: "Mediterranean coastline shoot locations near Granada for fashion and lifestyle campaigns.",
    heroEyebrow: "Locations",
    heroTitle: "Mediterranean Coastlines",
    heroLede:
      "Sunlit shores, textured cliffs, and expansive sea views ideal for clean, natural, and light-filled imagery.",
    introText:
      "Sunlit shores, textured cliffs, and expansive sea views ideal for clean, natural, and light-filled imagery.",
    enquiryIntro: "Share a few details and one of the team will be in touch within 48 hours.",
  },
  {
    _id: "location-granada-city-center",
    _type: "location",
    title: "Granada City Center & Modern Architecture",
    slug: slug("granada-city-center"),
    formLocationKey: "granada-city-center",
    sortOrder: 4,
    cardDescription:
      "Historic streetscapes where aged architecture contrasts sleek modern lines, offering visual interest, lighting, composition, and everyday movement to create an authentic lived-in backdrop.",
    metaTitle: "Granada City Center & Modern Architecture — Granada Production House",
    metaDescription: "Granada city centre and modern architecture locations for editorial and commercial shoots.",
    heroEyebrow: "Locations",
    heroTitle: "Granada City Center & Modern Architecture",
    heroLede:
      "Historic streetscapes where aged architecture contrasts sleek modern lines, offering visual interest, lighting, composition, and everyday movement to create an authentic lived-in backdrop.",
    introText:
      "Historic streetscapes where aged architecture contrasts sleek modern lines, offering the best visual interest, lighting and composition, everyday movement to create an authentic lived-in backdrop.",
    enquiryIntro: "Share a few details and one of the team will be in touch within 48 hours.",
  },
  {
    _id: "location-alpine-and-vistas",
    _type: "location",
    title: "Alpine and Vistas",
    slug: slug("alpine-and-vistas"),
    formLocationKey: "alpine-and-vistas",
    sortOrder: 5,
    cardDescription:
      "Dramatic mountain scenery, open horizons, and high-altitude light for bold, cinematic compositions. Frame your subject against the breathtaking, sun-drenched palaces of the Alhambra, where ancient architecture meets the dramatic backdrop of mountains. Capture the essence of romance amidst the winding, whitewashed alleys opening up to panoramic vistas that perfectly frame Spain’s most iconic historic skyline.",
    metaTitle: "Alpine and Vistas — Granada Production House",
    metaDescription:
      "Alpine landscape shoot locations near Granada for campaigns needing mountain scale and open horizons.",
    heroEyebrow: "Locations",
    heroTitle: "Alpine and Vistas",
    heroLede: "Dramatic mountain scenery, open horizons, and high-altitude light for bold, cinematic compositions.",
    introText: "Dramatic mountain scenery, open horizons, and high-altitude light for bold, cinematic compositions.",
    enquiryIntro: "Share a few details and one of the team will be in touch within 48 hours.",
  },
  {
    _id: "team-myra",
    _type: "teamMember",
    name: "Myra Gonzalez",
    role: "Creative Producer, Casting Director, Co-founder",
    sortOrder: 1,
    email: "myra@granadaproductionhouse.com",
    bio: "Based between London and Granada, Myra brings over 20 years of extensive experience coordinating high-end fashion, commercial, and editorial photo shoots across international locations. Skilled in overseeing every stage of production, from concept development and location scouting to talent coordination, scheduling, logistics, and on-set management, ensuring each project runs seamlessly from start to finish. Myra has a strong background in casting and delivers projects on time and within budget. As an international shoot producer, she has worked with global brands and specialises in partnerships and strategic collaborations. Myra is passionate about storytelling through imagery and creating collaborative, efficient, and inspiring shoot experiences for brands, photographers, models, and creative teams worldwide, delivering visually compelling campaigns while managing budgets, client relationships, and fast-paced production environments with professionalism and precision.",
  },
  {
    _id: "team-didra",
    _type: "teamMember",
    name: "Didra Gonzalez",
    role: "Executive Producer, Co-founder",
    sortOrder: 2,
    email: "Didra@granadaproductionhouse.com",
    bio: "With over 10 years of experience in the fashion industry, Didra specialises in fashion production, model scouting, event production, and fashion marketing. Her work is rooted in a deep understanding of both the creative and logistical sides of production, allowing her to bring concepts to life with precision and intention.",
  },
  {
    _id: "team-bella",
    _type: "teamMember",
    name: "Bella Lawrence Mills",
    role: "Art Director, Creative Producer",
    sortOrder: 3,
    email: "bella@granadaproductionhouse.com",
    bio: "Bella Lawrence Mills is a freelance Art Director and Creative Producer based in London. A graduate of London College of Fashion, Bella combines expertise in art direction, creative production, and styling to create visually compelling and thoughtfully crafted brand stories. Her work is inspired by nature, feminine aesthetics, and bold, vibrant colour palettes, drawing influence from organic forms, seasonal landscapes, and the beauty found in everyday details. With a strong eye for composition, styling, and visual storytelling, Bella develops creative concepts and imagery that feel both distinctive and engaging, balancing artistic vision with commercial impact. Bella has extensive experience directing and producing shoots in Spain and is considered a valuable asset and creative contributor to any team shooting in Spain, especially ours.",
  },
  {
    _id: "team-jarl",
    _type: "teamMember",
    name: "Jarl Allard",
    role: "Production Assistant",
    sortOrder: 4,
    email: "jarl@granadaproductionhouse.com",
    bio: "Jarl is a detail-driven photoshoot production assistant with a knack for smooth, on-set logistics and clear communication. From prop sourcing and last-minute problem solving, Jarl keeps shoots on schedule and teams aligned. Comfortable across studio and location settings, Jarl supports photographers and producers with calm efficiency, a collaborative spirit, and a sharp eye for continuity. When the pressure's on, Jarl is the steady hand that helps deliver clean, on-brief results.",
  },
  {
    _id: "team-kenny",
    _type: "teamMember",
    name: "Kenneth Martiatu",
    role: "Production Assistant",
    sortOrder: 5,
    email: "kenny@granadaproductionhouse.com",
    bio: "Kenny is a dedicated and highly organised Production Assistant, supporting creative teams and ensuring photoshoots run smoothly from start to finish. With a proactive attitude, strong attention to detail, and excellent problem-solving skills, Kenny assists with all aspects of production, including logistics, equipment coordination, talent support, location preparation, transportation, and on-set operations. Kenny's reliability, professionalism, and ability to remain calm in fast-paced environments makes him a valuable member of any production team.",
  },
];

async function main() {
  const transaction = client.transaction();
  for (const doc of documents) {
    transaction.createOrReplace(doc);
  }
  await transaction.commit();
  console.log(`Seeded ${documents.length} documents into ${projectId}/${dataset}.`);
  console.log("Next: open Studio, upload images, then Publish.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
