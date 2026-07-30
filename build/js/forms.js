(function () {
  const COGNITO_KEY = "nra8M7-W5EyCgKiqoaohEw";
  const COGNITO_FORM_ID = "90";
  const COGNITO_CSS = "/build/css/cognito-form.css?v=2";

  /** Cognito internal field name for location dropdown — update if prefill does not work. */
  const LOCATION_FIELD = "LocationType";

  const LOCATION_LABELS = {
    "historic-moorish-architecture": "Historic Moorish Architecture",
    "historic-and-traditional": "Historic and Traditional",
    "mediterranean-coastlines": "Mediterranean Coastlines",
    "granada-city-center": "Granada City Center & Modern Architecture",
    "alpine-and-vistas": "Alpine and Vistas",
  };

  function injectCognitoStylesheet() {
    if (document.getElementById("gph-cognito-form-css")) return;
    const link = document.createElement("link");
    link.id = "gph-cognito-form-css";
    link.rel = "stylesheet";
    link.href = COGNITO_CSS;
    document.head.appendChild(link);
  }

  function applyCognitoSetCss() {
    if (typeof Cognito === "undefined" || typeof Cognito.setCss !== "function") return;
    Cognito.setCss(COGNITO_CSS);
  }

  function whenFormReady(container, callback) {
    if (container.querySelector(".cog-form")) {
      callback();
      return;
    }
    const observer = new MutationObserver(() => {
      if (container.querySelector(".cog-form")) {
        observer.disconnect();
        callback();
      }
    });
    observer.observe(container, { childList: true, subtree: true });
  }

  function mountCognitoForm(container) {
    if (!container || container.dataset.cognitoMounted === "true") return;

    container.classList.add("gph-cognito-form");
    container.dataset.cognitoMounted = "true";
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://www.cognitoforms.com/f/seamless.js";
    script.dataset.key = COGNITO_KEY;
    script.dataset.form = COGNITO_FORM_ID;

    const slug = container.dataset.location;
    const locationLabel = slug ? LOCATION_LABELS[slug] : "";
    if (locationLabel) {
      script.dataset.entry = JSON.stringify({ [LOCATION_FIELD]: locationLabel });
    }

    script.addEventListener("load", () => {
      whenFormReady(container, () => {
        applyCognitoSetCss();
      });
    });

    container.appendChild(script);
  }

  function init() {
    injectCognitoStylesheet();
    document
      .querySelectorAll("#gph-cognito-form, #location-enquiry-form")
      .forEach(mountCognitoForm);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
