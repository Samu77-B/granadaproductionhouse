(function () {
  const COGNITO_FORM_URL =
    "https://www.cognitoforms.com/f/nra8M7-W5EyCgKiqoaohEw/90";
  const COGNITO_CSS_CONTACT = "/build/css/cognito-form.css?v=5";
  const COGNITO_CSS_LOCATION = "/build/css/cognito-form-location.css?v=1";
  const IFRAME_HEIGHT_CONTACT = "720";
  const IFRAME_HEIGHT_LOCATION = "620";

  /** Cognito internal field name for location dropdown — update if prefill does not work. */
  const LOCATION_FIELD = "LocationType";

  const LOCATION_LABELS = {
    "historic-moorish-architecture": "Historic Moorish Architecture",
    "historic-and-traditional": "Historic and Traditional",
    "mediterranean-coastlines": "Mediterranean Coastlines",
    "granada-city-center": "Granada City Center & Modern Architecture",
    "alpine-and-vistas": "Alpine and Vistas",
  };

  let iframeScriptPromise = null;

  function cognitoCssUrl(path) {
    return new URL(path, window.location.href).href;
  }

  function loadIframeScript() {
    if (typeof Cognito !== "undefined") {
      return Promise.resolve();
    }
    if (iframeScriptPromise) {
      return iframeScriptPromise;
    }

    iframeScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://www.cognitoforms.com/f/iframe.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Cognito iframe.js failed to load"));
      document.body.appendChild(script);
    });

    return iframeScriptPromise;
  }

  function configureIframe(iframe, cssPath, locationLabel) {
    loadIframeScript()
      .then(() => {
        const cognito = Cognito("#" + iframe.id);
        cognito.setCss(cognitoCssUrl(cssPath));
        if (locationLabel) {
          cognito.prefill({ [LOCATION_FIELD]: locationLabel });
        }
      })
      .catch(() => {
        /* Form still works without custom CSS or prefill */
      });
  }

  function mountCognitoForm(container) {
    if (!container || container.dataset.cognitoMounted === "true") return;

    const isLocation = container.id === "location-enquiry-form";
    const iframeId = isLocation
      ? "gph-location-enquiry-iframe"
      : "gph-cognito-iframe";
    const cssPath = isLocation ? COGNITO_CSS_LOCATION : COGNITO_CSS_CONTACT;

    const slug = container.dataset.location;
    const locationLabel = slug ? LOCATION_LABELS[slug] : "";

    container.classList.add("gph-cognito-form");
    container.dataset.cognitoMounted = "true";
    container.innerHTML = "";

    const iframe = document.createElement("iframe");
    iframe.id = iframeId;
    iframe.src = COGNITO_FORM_URL;
    iframe.allow = "payment";
    iframe.title = "Enquiry form";
    iframe.setAttribute(
      "height",
      isLocation ? IFRAME_HEIGHT_LOCATION : IFRAME_HEIGHT_CONTACT
    );
    iframe.style.border = "0";
    iframe.style.width = "100%";

    iframe.addEventListener("load", () => {
      configureIframe(iframe, cssPath, locationLabel);
    });

    container.appendChild(iframe);
  }

  function init() {
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
