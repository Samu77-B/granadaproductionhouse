import type { StructureResolver } from "sanity/structure";

const singletonIds = [
  "homePage",
  "aboutPage",
  "contactPage",
  "servicesPage",
  "ourWorkPage",
  "locationsIndexPage",
];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Home page")
        .id("homePage")
        .child(S.document().schemaType("homePage").documentId("homePage")),
      S.listItem()
        .title("About")
        .id("aboutPage")
        .child(S.document().schemaType("aboutPage").documentId("aboutPage")),
      S.listItem()
        .title("Contact")
        .id("contactPage")
        .child(S.document().schemaType("contactPage").documentId("contactPage")),
      S.listItem()
        .title("Our services")
        .id("servicesPage")
        .child(S.document().schemaType("servicesPage").documentId("servicesPage")),
      S.listItem()
        .title("Our work")
        .id("ourWorkPage")
        .child(S.document().schemaType("ourWorkPage").documentId("ourWorkPage")),
      S.listItem()
        .title("Locations (main page)")
        .id("locationsIndexPage")
        .child(
          S.document().schemaType("locationsIndexPage").documentId("locationsIndexPage")
        ),
      S.divider(),
      S.documentTypeListItem("location").title("Location detail pages"),
      S.documentTypeListItem("teamMember").title("Team members"),
      S.divider(),
      S.listItem()
        .title("Site settings")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
    ]);

export const singletonTypes = new Set(singletonIds);
