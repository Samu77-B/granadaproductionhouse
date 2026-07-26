(function () {
  const LOCATION_TYPES = [
    { slug: "historic-moorish-architecture", label: "Historic Moorish Architecture" },
    { slug: "historic-and-traditional", label: "Historic and Traditional" },
    { slug: "mediterranean-coastlines", label: "Mediterranean Coastlines" },
    { slug: "granada-city-center", label: "Granada City Center & Modern Architecture" },
    { slug: "alpine-and-vistas", label: "Alpine and Vistas" },
  ];

  function locationOptionsHtml(selectedSlug, withPlaceholder) {
    let html = "";
    if (withPlaceholder) {
      html += `<option value="" disabled${selectedSlug ? "" : " selected"}>Select a location</option>`;
    }
    for (const loc of LOCATION_TYPES) {
      const selected = loc.slug === selectedSlug ? " selected" : "";
      html += `<option value="${loc.label}"${selected}>${loc.label}</option>`;
    }
    return html;
  }

  function initLocationSelects() {
    document.querySelectorAll("[data-location-select]").forEach((select) => {
      const selected = select.dataset.selected || "";
      const withPlaceholder = select.hasAttribute("data-location-placeholder");
      select.innerHTML = locationOptionsHtml(selected, withPlaceholder);
    });
  }

  function renderLocationEnquiryForm() {
    const mount = document.getElementById("location-enquiry-form");
    if (!mount) return;

    const selected = mount.dataset.location || "";

    mount.innerHTML = `
      <form class="contact-form contact-form--short" action="mailto:enquiries@granadaproductionhouse.com" method="post" enctype="text/plain">
        <label>
          Name
          <input type="text" name="name" required autocomplete="name">
        </label>
        <label>
          Email
          <input type="email" name="email" required autocomplete="email">
        </label>
        <label>
          Location type
          <select name="location" data-location-select data-selected="${selected}" required></select>
        </label>
        <label>
          Message
          <textarea name="message" required placeholder="Brief details about your shoot…"></textarea>
        </label>
        <button type="submit">Send enquiry</button>
      </form>
    `;

    initLocationSelects();
  }

  renderLocationEnquiryForm();
  initLocationSelects();
})();
