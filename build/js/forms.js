(function () {
  const COGNITO_FORM_URL =
    "https://www.cognitoforms.com/f/nra8M7-W5EyCgKiqoaohEw/90";
  const IFRAME_HEIGHT_CONTACT = "720";
  const IFRAME_HEIGHT_LOCATION = "580";
  const IFRAME_HEIGHT_LIGHTBOX = "640";

  /** Cognito internal field names — update if prefill does not work. */
  const LOCATION_FIELD = "LocationType";
  /** Cognito text field labeled "Place Name" (internal: PlaceName). */
  const IMAGE_FIELD = "PlaceName";

  const LOCATION_LABELS = {
    // Must match Cognito Location Type dropdown options exactly
    "moorish-architecture": "Moorish Architecture",
    "historic-and-traditional": "Historic and Traditional",
    "mediterranean-coastlines": "Mediterranean Coastlines",
    "granada-city-center": "Granada City Center & Modern Architecture",
    "alpine-and-vistas": "Alpine and Vistas",
  };

  const ADOBE_FONTS_URL = "https://use.typekit.net/rmg3cin.css";
  const FREIGHT_SANS =
    "'freight-sans-pro','Freight Sans Pro',system-ui,sans-serif";

  /**
   * Inline CSS — Cognito fetches external stylesheets from its servers, so local
   * preview URLs fail. Inline styles always apply inside the iframe.
   */
  const COGNITO_CSS_BASE =
    "@import url('" +
    ADOBE_FONTS_URL +
    "');" +
    ":root #cognito .cog-cognito{" +
    "--font-family:" +
    FREIGHT_SANS +
    ";" +
    "--label__font-family:" +
    FREIGHT_SANS +
    ";" +
    "--input__font-family:" +
    FREIGHT_SANS +
    ";" +
    "--button-primary__font-family:" +
    FREIGHT_SANS +
    ";" +
    "--input__border-color:rgba(18,16,14,0.2);--input__border-width:1px;" +
    "--input__border-radius:0;--input__background-color:#fff;--input__color:#1a1a1a;" +
    "--button__border-radius:0;--border-radius:0;--highlight:#12100e;--highlight-reverse:#fff;" +
    "--form__margins:0}" +
    ":root #cognito .cog-form{background:transparent;box-shadow:none;border:none;max-width:100%!important;margin:0!important}" +
    ":root #cognito .cog-header{display:none!important}" +
    ":root #cognito .cog-field__content{display:flex;flex-direction:column;align-items:stretch}" +
    ":root #cognito .cog-label{display:block!important;position:static!important;" +
    "transform:none!important;opacity:1!important;visibility:visible!important;" +
    "color:#1a1a1a!important;font-size:0.95rem!important;font-weight:400!important;" +
    "font-family:" +
    FREIGHT_SANS +
    "!important;margin:0 0 0.4rem!important;padding:0!important;order:-1}" +
    ":root #cognito .cog-field{margin-bottom:1rem}" +
    ":root #cognito .cog-name .cog-field__content{display:grid;" +
    "grid-template-columns:repeat(2,minmax(0,1fr));gap:0.75rem}" +
    ":root #cognito .cog-name>.cog-label{grid-column:1/-1;order:unset}" +
    ":root #cognito .cog-button--primary{background-color:#12100e!important;" +
    "border-color:#12100e!important;color:#fff!important;border-radius:0!important;" +
    "letter-spacing:0.06em!important;text-transform:uppercase!important;" +
    "font-size:0.85rem!important;padding:0.9rem 1.6rem!important}" +
    ":root #cognito .cog-button--primary:hover{background-color:#2a2622!important;" +
    "border-color:#2a2622!important}" +
    ":root #cognito .cog-page__navigation{justify-content:flex-start;padding:0;margin-top:0.25rem}";

  const COGNITO_CSS_LOCATION =
    COGNITO_CSS_BASE +
    ":root #cognito .cog-field.cog-choice~.cog-field.cog-choice{display:none!important}";

  let iframeScriptPromise = null;

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

  function buildPrefill(locationLabel, imageRef) {
    const data = {};
    if (locationLabel) data[LOCATION_FIELD] = locationLabel;
    if (imageRef) data[IMAGE_FIELD] = imageRef;
    return data;
  }

  function applyIframeConfig(iframe, css, locationLabel, imageRef) {
    if (typeof Cognito === "undefined") return;

    const cognito = Cognito("#" + iframe.id);
    cognito.setCss(css);
    const prefill = buildPrefill(locationLabel, imageRef);
    if (Object.keys(prefill).length) {
      cognito.prefill(prefill);
    }
  }

  function configureIframe(iframe, css, locationLabel, imageRef) {
    loadIframeScript()
      .then(() => applyIframeConfig(iframe, css, locationLabel, imageRef))
      .catch(() => {
        /* Form still works with Cognito defaults */
      });
  }

  function createIframe(iframeId, height) {
    const iframe = document.createElement("iframe");
    iframe.id = iframeId;
    iframe.src = COGNITO_FORM_URL;
    iframe.allow = "payment";
    iframe.title = "Enquiry form";
    iframe.setAttribute("height", height);
    iframe.style.border = "0";
    iframe.style.width = "100%";
    return iframe;
  }

  function mountCognitoForm(container) {
    if (!container || container.dataset.cognitoMounted === "true") return;

    const isLocation = container.id === "location-enquiry-form";
    const iframeId = isLocation
      ? "gph-location-enquiry-iframe"
      : "gph-cognito-iframe";
    const css = isLocation ? COGNITO_CSS_LOCATION : COGNITO_CSS_BASE;

    const slug = container.dataset.location;
    const locationLabel = slug ? LOCATION_LABELS[slug] : "";

    container.classList.add("gph-cognito-form");
    container.dataset.cognitoMounted = "true";
    container.innerHTML = "";

    const iframe = createIframe(
      iframeId,
      isLocation ? IFRAME_HEIGHT_LOCATION : IFRAME_HEIGHT_CONTACT
    );
    container.appendChild(iframe);

    configureIframe(iframe, css, locationLabel, "");
    iframe.addEventListener("load", () => {
      configureIframe(iframe, css, locationLabel, "");
    });
  }

  function imageRefFromSrc(src) {
    if (!src) return "";
    try {
      const path = src.split("?")[0];
      const name = decodeURIComponent(path.split("/").pop() || "");
      return name.replace(/\.[^.]+$/, "");
    } catch (err) {
      return "";
    }
  }

  function mountLightboxEnquiry(container, options) {
    if (!container) return;

    const locationSlug = (options && options.locationSlug) || "";
    const imageRef = (options && options.imageRef) || "";
    const locationLabel = LOCATION_LABELS[locationSlug] || "";

    container.classList.add("gph-cognito-form");
    container.dataset.cognitoMounted = "true";
    container.innerHTML = "";

    const iframe = createIframe(
      "gph-lightbox-enquiry-iframe",
      IFRAME_HEIGHT_LIGHTBOX
    );
    container.appendChild(iframe);

    configureIframe(iframe, COGNITO_CSS_LOCATION, locationLabel, imageRef);
    iframe.addEventListener("load", () => {
      configureIframe(iframe, COGNITO_CSS_LOCATION, locationLabel, imageRef);
    });
  }

  function clearLightboxEnquiry(container) {
    if (!container) return;
    container.innerHTML = "";
    delete container.dataset.cognitoMounted;
  }

  function init() {
    document
      .querySelectorAll("#gph-cognito-form, #location-enquiry-form")
      .forEach(mountCognitoForm);
  }

  window.GPHForms = {
    LOCATION_LABELS,
    imageRefFromSrc,
    mountLightboxEnquiry,
    clearLightboxEnquiry,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
