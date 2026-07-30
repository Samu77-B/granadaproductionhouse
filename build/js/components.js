(function () {
  const base = document.body.dataset.base || "/build/";
  const ADOBE_FONTS_URL = "https://use.typekit.net/rmg3cin.css";

  if (!document.querySelector('link[href*="typekit.net"]')) {
    const fonts = document.createElement("link");
    fonts.rel = "stylesheet";
    fonts.href = ADOBE_FONTS_URL;
    document.head.appendChild(fonts);
  }

  const navLinks = [
    { href: "index.html", label: "Home" },
    { href: "about/", label: "About Us" },
    { href: "team/", label: "Meet The Team" },
    { href: "our-work/", label: "Our Work" },
    { href: "services/", label: "Our Services" },
    { href: "location/", label: "Locations" },
    { href: "contact/", label: "Contact" },
  ];

  const locationLinks = [
    { href: "location/historic-moorish-architecture/", label: "Historic Moorish Architecture" },
    { href: "location/mediterranean-coastlines/", label: "Mediterranean Coastlines" },
    { href: "location/granada-city-center/", label: "Granada City Center & Modern Architecture" },
    { href: "location/alpine-and-vistas/", label: "Alpine and Vistas" },
  ];

  function resolve(path) {
    if (path === "index.html") return base;
    return base + path;
  }

  function renderHeader() {
    const mount = document.getElementById("site-header");
    if (!mount) return;

    mount.outerHTML = `
      <header class="site-header">
        <a href="${resolve("index.html")}" class="site-header__brand" aria-label="Granada Production House home">
          <img
            class="site-header__logo site-header__logo--desktop"
            src="${base}assets/GPH-Logo-Wht.png"
            alt="Granada Production House"
          >
          <img
            class="site-header__logo site-header__logo--mobile"
            src="${base}assets/GPH-Logo-Wht - Mbl.png"
            alt="Granada Production House"
          >
        </a>

        <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav">
          <img
            class="nav-toggle__icon"
            src="${base}assets/GPH-Menu-Hamburger.png?v=3"
            alt=""
            width="52"
            height="52"
          >
        </button>
      </header>

      <nav class="site-nav" id="site-nav" aria-label="Main navigation">
        <ul class="site-nav__list">
          ${navLinks
            .map((link) => `<li><a href="${resolve(link.href)}">${link.label}</a></li>`)
            .join("")}
        </ul>
      </nav>
    `;
  }

  function renderFooter() {
    const mount = document.getElementById("site-footer");
    if (!mount) return;

    mount.outerHTML = `
      <footer class="site-footer" id="contact">
        <div class="site-footer__grid">
          <div class="site-footer__brand">
            <img src="${base}assets/GPH-Logo-Wht.png" alt="Granada Production House">
            <p>Boutique photoshoot production company based in Granada, Spain.</p>
          </div>

          <div class="site-footer__col">
            <h2 class="site-footer__heading">Explore</h2>
            <ul>
              ${navLinks
                .slice(1)
                .map((link) => `<li><a href="${resolve(link.href)}">${link.label}</a></li>`)
                .join("")}
            </ul>
          </div>

          <div class="site-footer__col">
            <h2 class="site-footer__heading">Contact</h2>
            <p>Granada, Spain</p>
            <p><a href="mailto:hola@granadaproductionhouse.com">hola@granadaproductionhouse.com</a></p>
            <p><a href="https://www.instagram.com/granadaproductionhouse" target="_blank" rel="noopener noreferrer">Instagram</a></p>
            <p class="site-footer__locations">
              ${locationLinks
                .map((link) => `<a href="${resolve(link.href)}">${link.label}</a>`)
                .join("<br>")}
            </p>
          </div>
        </div>

        <div class="site-footer__bottom">
          <p>&copy; 2026 Granada Production House. All rights reserved.</p>
          <p class="site-footer__credit">
            Website designed, built and maintained by
            <a href="https://paradigmstudio.net/" target="_blank" rel="noopener noreferrer">Paradigm Studio</a>
          </p>
        </div>
      </footer>
    `;
  }

  renderHeader();
  renderFooter();
})();
