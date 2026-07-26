import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "siteTitle",
      title: "Site title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "defaultMetaDescription",
      title: "Default meta description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "contactEmail",
      title: "Primary contact email",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
    }),
    defineField({
      name: "instagramUrl",
      title: "Instagram URL",
      type: "url",
    }),
  ],
});

export const seoFields = [
  defineField({
    name: "metaTitle",
    title: "Meta title (SEO)",
    type: "string",
    description: "Browser tab / Google title. Leave empty to use the page heading.",
  }),
  defineField({
    name: "metaDescription",
    title: "Meta description (SEO)",
    type: "text",
    rows: 3,
  }),
];

export const heroFields = [
  defineField({
    name: "heroEyebrow",
    title: "Hero eyebrow",
    type: "string",
    description: "Small label above the main heading (e.g. Locations, Contact).",
  }),
  defineField({
    name: "heroTitle",
    title: "Hero heading",
    type: "string",
    validation: (Rule) => Rule.required(),
  }),
  defineField({
    name: "heroLede",
    title: "Hero intro line",
    type: "text",
    rows: 3,
  }),
  defineField({
    name: "heroImage",
    title: "Hero background image",
    type: "image",
    options: { hotspot: true },
  }),
];

export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  fields: [
    ...seoFields,
    defineField({
      name: "heroSlides",
      title: "Hero slideshow images",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "image", type: "image", options: { hotspot: true } }),
            defineField({ name: "alt", title: "Alt text", type: "string" }),
          ],
          preview: {
            select: { title: "alt", media: "image" },
          },
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "heroCopy",
      title: "Hero overlay text",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "aboutHeadline",
      title: "About section headline",
      type: "string",
    }),
    defineField({
      name: "aboutBlocks",
      title: "About blocks",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "subhead", title: "Subheading", type: "string" }),
            defineField({ name: "body", title: "Body text", type: "text", rows: 4 }),
          ],
          preview: {
            select: { title: "subhead", subtitle: "body" },
          },
        },
      ],
    }),
    defineField({
      name: "aboutImage",
      title: "About section image",
      type: "image",
      options: { hotspot: true },
    }),
  ],
});

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About page",
  type: "document",
  fields: [
    ...seoFields,
    ...heroFields,
    defineField({
      name: "body",
      title: "Main body text",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
});

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact page",
  type: "document",
  fields: [
    ...seoFields,
    ...heroFields,
    defineField({
      name: "introText",
      title: "Intro paragraphs",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "formIntro",
      title: "Text above contact form",
      type: "text",
      rows: 3,
    }),
  ],
});

export const servicesPage = defineType({
  name: "servicesPage",
  title: "Services page",
  type: "document",
  fields: [
    ...seoFields,
    ...heroFields,
    defineField({
      name: "services",
      title: "Services list",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", title: "Service title", type: "string" }),
            defineField({ name: "description", title: "Description", type: "text", rows: 4 }),
          ],
          preview: { select: { title: "title" } },
        },
      ],
    }),
  ],
});

export const ourWorkPage = defineType({
  name: "ourWorkPage",
  title: "Our work page",
  type: "document",
  fields: [
    ...seoFields,
    ...heroFields,
    defineField({
      name: "intro",
      title: "Intro text",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "gallery",
      title: "Work gallery",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "image", type: "image", options: { hotspot: true } }),
            defineField({ name: "alt", type: "string" }),
          ],
          preview: { select: { title: "alt", media: "image" } },
        },
      ],
    }),
  ],
});

export const locationsIndexPage = defineType({
  name: "locationsIndexPage",
  title: "Locations index",
  type: "document",
  fields: [
    ...seoFields,
    ...heroFields,
    defineField({
      name: "bodyParagraphs",
      title: "Body paragraphs",
      type: "array",
      of: [{ type: "text", rows: 4 }],
    }),
  ],
});

export const location = defineType({
  name: "location",
  title: "Location",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "formLocationKey",
      title: "Enquiry form preset",
      type: "string",
      description: "Must match the location dropdown value (usually same as slug).",
      options: {
        list: [
          { title: "Historic Moorish Architecture", value: "historic-moorish-architecture" },
          { title: "Historic and Traditional", value: "historic-and-traditional" },
          { title: "Mediterranean Coastlines", value: "mediterranean-coastlines" },
          { title: "Granada City Center & Modern Architecture", value: "granada-city-center" },
          { title: "Alpine and Vistas", value: "alpine-and-vistas" },
        ],
      },
    }),
    ...seoFields,
    ...heroFields,
    defineField({
      name: "introText",
      title: "Intro text (left column)",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "sideImage",
      title: "Side image (next to intro)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "gallery",
      title: "Location gallery",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "image", type: "image", options: { hotspot: true } }),
            defineField({ name: "alt", type: "string" }),
          ],
          preview: { select: { title: "alt", media: "image" } },
        },
      ],
    }),
    defineField({
      name: "enquiryIntro",
      title: "Text above enquiry form",
      type: "string",
      initialValue: "Share a few details and one of the team will be in touch within 24 hours.",
    }),
  ],
  preview: {
    select: { title: "title", media: "heroImage" },
  },
});

export const teamMember = defineType({
  name: "teamMember",
  title: "Team member",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role / title",
      type: "string",
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "text",
      rows: 8,
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "sortOrder",
      title: "Sort order",
      type: "number",
      description: "Lower numbers appear first.",
    }),
  ],
  orderings: [
    {
      title: "Sort order",
      name: "sortOrderAsc",
      by: [{ field: "sortOrder", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "photo" },
  },
});

export const schemaTypes = [
  siteSettings,
  homePage,
  aboutPage,
  contactPage,
  servicesPage,
  ourWorkPage,
  locationsIndexPage,
  location,
  teamMember,
];
