(function () {
  const config = window.GPH_CMS || {};
  const projectId = (config.projectId || "").trim();

  if (!projectId || projectId === "your_project_id") {
    return;
  }

  const dataset = config.dataset || "production";
  const apiVersion = config.apiVersion || "2024-01-01";
  const page = document.body.dataset.page || "";
  const locationSlug = /^[a-z0-9-]+$/.test(document.body.dataset.location || "")
    ? document.body.dataset.location
    : "";

  const IMAGE_FRAGMENT = `{
    alt,
    "url": asset->url
  }`;

  const GALLERY_FRAGMENT = `{
    alt,
    caption,
    "url": image.asset->url
  }`;

  const SETTINGS_FRAGMENT = `{
    siteTitle,
    contactEmail,
    enquiryEmail,
    phone,
    instagramUrl,
    footerTagline
  }`;

  function queryForPage() {
    if (page === "home") {
      return `{
        "settings": *[_type == "siteSettings"][0] ${SETTINGS_FRAGMENT},
        "doc": *[_type == "homePage"][0]{
          heroCopy,
          aboutHeadline,
          aboutBlocks[]{ subhead, body },
          aboutImage ${IMAGE_FRAGMENT},
          heroSlides[]{ alt, "url": image.asset->url }
        }
      }`;
    }

    if (page === "about") {
      return `{
        "settings": *[_type == "siteSettings"][0] ${SETTINGS_FRAGMENT},
        "doc": *[_type == "aboutPage"][0]{
          metaTitle,
          metaDescription,
          heroEyebrow,
          heroTitle,
          heroImage ${IMAGE_FRAGMENT},
          body
        }
      }`;
    }

    if (page === "team") {
      return `{
        "settings": *[_type == "siteSettings"][0] ${SETTINGS_FRAGMENT},
        "doc": *[_type == "teamPage"][0]{
          metaTitle,
          metaDescription,
          heroEyebrow,
          heroTitle,
          heroImage ${IMAGE_FRAGMENT}
        },
        "team": *[_type == "teamMember"] | order(sortOrder asc, name asc){
          name,
          role,
          bio,
          email,
          photo ${IMAGE_FRAGMENT}
        }
      }`;
    }

    if (page === "services") {
      return `{
        "settings": *[_type == "siteSettings"][0] ${SETTINGS_FRAGMENT},
        "doc": *[_type == "servicesPage"][0]{
          metaTitle,
          metaDescription,
          heroEyebrow,
          heroTitle,
          heroLede,
          heroImage ${IMAGE_FRAGMENT},
          sideImage ${IMAGE_FRAGMENT},
          services[]{ title, description }
        }
      }`;
    }

    if (page === "our-work") {
      return `{
        "settings": *[_type == "siteSettings"][0] ${SETTINGS_FRAGMENT},
        "doc": *[_type == "ourWorkPage"][0]{
          metaTitle,
          metaDescription,
          heroEyebrow,
          heroTitle,
          heroLede,
          heroImage ${IMAGE_FRAGMENT},
          introHeadline,
          intro,
          gallery[] ${GALLERY_FRAGMENT}
        }
      }`;
    }

    if (page === "contact") {
      return `{
        "settings": *[_type == "siteSettings"][0] ${SETTINGS_FRAGMENT},
        "doc": *[_type == "contactPage"][0]{
          metaTitle,
          metaDescription,
          heroEyebrow,
          heroTitle,
          heroImage ${IMAGE_FRAGMENT},
          introText
        }
      }`;
    }

    if (page === "locations") {
      return `{
        "settings": *[_type == "siteSettings"][0] ${SETTINGS_FRAGMENT},
        "doc": *[_type == "locationsIndexPage"][0]{
          metaTitle,
          metaDescription,
          heroEyebrow,
          heroTitle,
          heroImage ${IMAGE_FRAGMENT},
          bodyParagraphs
        },
        "locations": *[_type == "location"] | order(sortOrder asc, title asc){
          title,
          cardDescription,
          "slug": slug.current,
          heroImage ${IMAGE_FRAGMENT}
        }
      }`;
    }

    if (page === "location" && locationSlug) {
      return `{
        "settings": *[_type == "siteSettings"][0] ${SETTINGS_FRAGMENT},
        "doc": *[_type == "location" && slug.current == "${locationSlug}"][0]{
          title,
          metaTitle,
          metaDescription,
          heroEyebrow,
          heroTitle,
          heroLede,
          introText,
          enquiryIntro,
          heroImage ${IMAGE_FRAGMENT},
          sideImage ${IMAGE_FRAGMENT},
          gallery[] ${GALLERY_FRAGMENT}
        }
      }`;
    }

    return `{
      "settings": *[_type == "siteSettings"][0] ${SETTINGS_FRAGMENT}
    }`;
  }

  function fetchContent(groq) {
    const url =
      `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}` +
      `?query=${encodeURIComponent(groq)}`;

    return fetch(url).then((response) => {
      if (!response.ok) {
        throw new Error("CMS request failed");
      }
      return response.json();
    });
  }

  function imageUrl(url, width) {
    if (!url) return "";
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}auto=format&fit=max&q=80&w=${width || 1600}`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function hasText(value) {
    return typeof value === "string" && value.trim() !== "";
  }

  function setText(selector, value) {
    const el = document.querySelector(selector);
    if (!el || !hasText(value)) return;
    el.textContent = value;
  }

  function setMetaDescription(value) {
    if (!hasText(value)) return;
    const el = document.querySelector('meta[name="description"]');
    if (el) el.setAttribute("content", value);
  }

  function setTitle(value) {
    if (!hasText(value)) return;
    document.title = value;
  }

  function setImage(selector, image, width) {
    const el = document.querySelector(selector);
    if (!el || !image || !image.url) return;
    el.src = imageUrl(image.url, width);
    if (hasText(image.alt)) el.alt = image.alt;
  }

  function spanToHtml(span, markDefs) {
    let html = escapeHtml(span.text || "");
    (span.marks || []).forEach((mark) => {
      if (mark === "strong") html = `<strong>${html}</strong>`;
      else if (mark === "em") html = `<em>${html}</em>`;
      else {
        const def = (markDefs || []).find((item) => item._key === mark);
        if (def && def._type === "link" && def.href) {
          const href = escapeHtml(def.href);
          html = `<a href="${href}">${html}</a>`;
        }
      }
    });
    return html;
  }

  function blocksToHtml(blocks, className) {
    if (!Array.isArray(blocks) || !blocks.length) return "";
    const cls = className ? ` class="${className}"` : "";
    return blocks
      .filter((block) => block._type === "block")
      .map((block) => {
        const inner = (block.children || [])
          .map((child) => spanToHtml(child, block.markDefs))
          .join("");
        return `<p${cls}>${inner}</p>`;
      })
      .join("");
  }

  function paragraphsFromText(value, className) {
    if (!hasText(value)) return "";
    const cls = className ? ` class="${className}"` : "";
    return value
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => `<p${cls}>${escapeHtml(part).replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  function applySettings(settings) {
    if (!settings) return;

    const tagline = document.querySelector("[data-cms-footer='tagline']");
    if (tagline && hasText(settings.footerTagline)) {
      tagline.textContent = settings.footerTagline;
    }

    const email = document.querySelector("[data-cms-footer='email']");
    if (email && hasText(settings.contactEmail)) {
      email.href = `mailto:${settings.contactEmail}`;
      email.textContent = settings.contactEmail;
    }

    const instagram = document.querySelector("[data-cms-footer='instagram']");
    if (instagram && hasText(settings.instagramUrl)) {
      instagram.href = settings.instagramUrl;
    }
  }

  function renderHome(doc) {
    if (!doc) return;
    setText(".hero__copy", doc.heroCopy);
    setText(".about__headline", doc.aboutHeadline);
    setImage(".about__media img", doc.aboutImage, 1200);

    if (Array.isArray(doc.aboutBlocks) && doc.aboutBlocks.length) {
      const content = document.querySelector(".about__content");
      if (content) {
        const headline = content.querySelector(".about__headline");
        const blocksHtml = doc.aboutBlocks
          .map(
            (block, index) => `
              <div class="about__block"${index === 0 ? ' id="services"' : ""}>
                <h2 class="about__subhead">${escapeHtml(block.subhead || "")}</h2>
                <p class="about__text">${escapeHtml(block.body || "")}</p>
              </div>`
          )
          .join("");
        content.innerHTML = (headline ? headline.outerHTML : "") + blocksHtml;
      }
    }

    const slides = (doc.heroSlides || []).filter((slide) => slide && slide.url);
    if (!slides.length) return;

    const slidesMount = document.querySelector(".hero__slides");
    const dotsMount = document.querySelector(".hero__dots");
    if (!slidesMount || !dotsMount) return;

    slidesMount.innerHTML = slides
      .map(
        (slide, index) => `
          <div class="hero__slide${index === 0 ? " hero__slide--active" : ""}">
            <div class="hero__pan">
              <img src="${imageUrl(slide.url, 2000)}" alt="${escapeHtml(slide.alt || "")}">
            </div>
          </div>`
      )
      .join("");

    dotsMount.innerHTML = slides
      .map(
        (_, index) =>
          `<button class="hero__dot${index === 0 ? " hero__dot--active" : ""}" type="button" aria-label="Slide ${index + 1}"></button>`
      )
      .join("");
  }

  function renderHero(doc) {
    if (!doc) return;
    setText(".page-hero__eyebrow", doc.heroEyebrow);
    setText(".page-hero__title", doc.heroTitle);
    setText(".page-hero__lede", doc.heroLede);
    setImage(".page-hero__media img, .page-section__media--about-photo img", doc.heroImage, 2000);
    setTitle(doc.metaTitle);
    setMetaDescription(doc.metaDescription);
  }

  function renderAbout(doc) {
    renderHero(doc);
    setText(".page-section--about .page-hero__eyebrow", doc.heroEyebrow);
    setText(".page-section--about .page-hero__title", doc.heroTitle);
    const body = document.querySelector(".page-section__body");
    const html = blocksToHtml(doc.body, "page-section__text");
    if (body && html) {
      const meetLink = body.querySelector(".page-section__text-link");
      const linkHtml = meetLink
        ? `<p class="page-section__text">${meetLink.parentElement.innerHTML}</p>`
        : "";
      body.innerHTML = html + linkHtml;
    }
  }

  function renderTeam(doc, members) {
    renderHero(doc);
    if (!Array.isArray(members) || !members.length) return;
    if (!members.some((member) => member.photo && member.photo.url)) return;
    const grid = document.querySelector(".team-grid");
    if (!grid) return;

    grid.innerHTML = members
      .map((member) => {
        const photo = member.photo && member.photo.url
          ? imageUrl(member.photo.url, 900)
          : "";
        const alt = escapeHtml(member.photo && member.photo.alt ? member.photo.alt : member.name || "");
        const email = hasText(member.email)
          ? `<p class="team-card__email"><a href="mailto:${escapeHtml(member.email)}">${escapeHtml(member.email)}</a></p>`
          : "";
        return `
          <article class="team-card">
            <div class="team-card__image">
              ${photo ? `<img src="${photo}" alt="${alt}">` : ""}
            </div>
            <h3 class="team-card__name">${escapeHtml(member.name || "")}</h3>
            <p class="team-card__role">${escapeHtml(member.role || "")}</p>
            <p class="team-card__bio">${escapeHtml(member.bio || "")}</p>
            ${email}
          </article>`;
      })
      .join("");
  }

  function renderServices(doc) {
    renderHero(doc);
    setImage(".page-section__grid .page-section__media img", doc.sideImage, 1200);

    if (!Array.isArray(doc.services) || !doc.services.length) return;
    const list = document.querySelector(".services-list");
    if (!list) return;
    list.innerHTML = doc.services
      .map(
        (item) => `
          <article class="service-item">
            <h3 class="service-item__title">${escapeHtml(item.title || "")}</h3>
            <p class="service-item__text">${escapeHtml(item.description || "")}</p>
          </article>`
      )
      .join("");
  }

  function renderOurWork(doc) {
    renderHero(doc);
    setText(".page-section__headline", doc.introHeadline);
    setText(".page-section__inner > .page-section__text", doc.intro);

    const items = (doc.gallery || []).filter((item) => item && item.url);
    if (!items.length) return;
    const grid = document.querySelector(".work-grid");
    if (!grid) return;
    grid.innerHTML = items
      .map((item) => {
        const caption = hasText(item.caption)
          ? ` data-lightbox-caption="${escapeHtml(item.caption)}"`
          : "";
        return `
          <figure class="work-grid__item">
            <img src="${imageUrl(item.url, 1400)}" alt="${escapeHtml(item.alt || "")}"${caption}>
          </figure>`;
      })
      .join("");
  }

  function renderContact(doc, settings) {
    renderHero(doc);
    const details = document.querySelector(".contact-details");
    if (!details) return;

    const introHtml = blocksToHtml(doc && doc.introText, "page-section__text");
    const contactLine = details.querySelector("[data-cms-contact-line]");
    const contactLineHtml = contactLine ? contactLine.outerHTML : "";

    if (introHtml) {
      details.innerHTML = introHtml + contactLineHtml;
    }

    const enquiryEmail =
      (settings && settings.enquiryEmail) ||
      (settings && settings.contactEmail) ||
      "";
    const phone = settings && settings.phone;

    if (hasText(phone) || hasText(enquiryEmail)) {
      let line = details.querySelector("[data-cms-contact-line]");
      if (!line) {
        line = document.createElement("p");
        line.setAttribute("data-cms-contact-line", "");
        details.appendChild(line);
      }
      const parts = [];
      if (hasText(phone)) {
        const tel = phone.replace(/\s+/g, "");
        parts.push(`T: <a href="tel:${escapeHtml(tel)}">${escapeHtml(phone)}</a>`);
      }
      if (hasText(enquiryEmail)) {
        parts.push(
          `E: <a href="mailto:${escapeHtml(enquiryEmail)}">${escapeHtml(enquiryEmail)}</a>`
        );
      }
      line.innerHTML = parts.join("<br>");
    }
  }

  function renderLocations(doc, locations) {
    renderHero(doc);
    if (Array.isArray(doc && doc.bodyParagraphs) && doc.bodyParagraphs.length) {
      const inner = document.querySelector(".page-section__inner");
      const cards = inner && inner.querySelector(".page-cards");
      if (inner && cards) {
        const paras = doc.bodyParagraphs
          .filter((text) => hasText(text))
          .map((text) => `<p class="page-section__text">${escapeHtml(text)}</p>`)
          .join("");
        inner.innerHTML = paras + cards.outerHTML;
      }
    }

    const cards = (locations || []).filter((item) => item && item.slug);
    if (!cards.length) return;
    if (!cards.some((item) => item.heroImage && item.heroImage.url)) return;
    const mount = document.querySelector(".page-cards");
    if (!mount) return;
    mount.innerHTML = cards
      .map((item) => {
        const image = item.heroImage && item.heroImage.url
          ? `<img src="${imageUrl(item.heroImage.url, 1000)}" alt="${escapeHtml(item.heroImage.alt || item.title || "")}">`
          : "";
        return `
          <a class="page-card" href="${escapeHtml(item.slug)}/">
            <div class="page-card__image">${image}</div>
            <h3 class="page-card__title">${escapeHtml(item.title || "")}</h3>
            <p class="page-card__text">${escapeHtml(item.cardDescription || "")}</p>
          </a>`;
      })
      .join("");
  }

  function renderLocation(doc) {
    if (!doc) return;
    renderHero(doc);
    setText(".page-hero__title", doc.heroTitle || doc.title);

    const intro = document.querySelector(".location-intro");
    const introHtml = paragraphsFromText(doc.introText, "page-section__text");
    if (intro && introHtml) intro.innerHTML = introHtml;

    setImage(".page-section__grid--location .page-section__media img", doc.sideImage, 1400);

    if (hasText(doc.enquiryIntro)) {
      document.body.dataset.enquiryIntro = doc.enquiryIntro;
      const lightboxIntro = document.querySelector(".lightbox__enquiry-intro");
      if (lightboxIntro) lightboxIntro.textContent = doc.enquiryIntro;
    }

    const items = (doc.gallery || []).filter((item) => item && item.url);
    if (!items.length) return;
    const gallery = document.querySelector(".location-gallery");
    if (!gallery) return;
    gallery.innerHTML = items
      .map(
        (item) =>
          `<img src="${imageUrl(item.url, 1400)}" alt="${escapeHtml(item.alt || "")}">`
      )
      .join("");
  }

  fetchContent(queryForPage())
    .then((payload) => {
      const data = payload.result || {};
      applySettings(data.settings);

      if (page === "home") renderHome(data.doc);
      else if (page === "about") renderAbout(data.doc);
      else if (page === "team") renderTeam(data.doc, data.team);
      else if (page === "services") renderServices(data.doc);
      else if (page === "our-work") renderOurWork(data.doc);
      else if (page === "contact") renderContact(data.doc, data.settings);
      else if (page === "locations") renderLocations(data.doc, data.locations);
      else if (page === "location") renderLocation(data.doc);

      window.dispatchEvent(new CustomEvent("gph:cms-updated"));
    })
    .catch(() => {
      // Keep the hard-coded HTML if Sanity is unreachable.
    });
})();
