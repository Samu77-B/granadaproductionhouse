(function () {
  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".site-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const slides = Array.from(document.querySelectorAll(".hero__slide"));
  const dots = Array.from(document.querySelectorAll(".hero__dot"));
  let currentSlide = 0;
  let slideTimer;

  function setHeaderState() {
    if (!header) return;
    header.classList.toggle("site-header--scrolled", window.scrollY > 40);
  }

  function openNav() {
    nav.classList.add("site-nav--open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
  }

  function closeNav() {
    nav.classList.remove("site-nav--open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
  }

  function restartPan(pan) {
    if (!pan) return;

    pan.style.animation = "none";
    void pan.offsetWidth;
    pan.style.removeProperty("animation");
  }

  function showSlide(index) {
    if (!slides.length) return;

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      const isActive = i === currentSlide;
      slide.classList.toggle("hero__slide--active", isActive);

      if (isActive) {
        restartPan(slide.querySelector(".hero__pan"));
      }
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("hero__dot--active", i === currentSlide);
    });
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function startCarousel() {
    if (!slides.length) return;
    clearInterval(slideTimer);
    slideTimer = setInterval(nextSlide, 3500);
  }

  function initNav() {
    if (!header || !nav || !navToggle) return;

    navToggle.addEventListener("click", () => {
      if (nav.classList.contains("site-nav--open")) {
        closeNav();
      } else {
        openNav();
      }
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        showSlide(index);
        startCarousel();
      });
    });
  }

  function initParallax() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const parallaxItems = [];
    const hero = document.querySelector(".hero");
    const heroSlides = document.querySelector(".hero__slides");

    document.querySelectorAll(".page-hero__media img").forEach((img) => {
      img.classList.add("parallax-img", "parallax-img--hero");
      parallaxItems.push({ img, strength: 0.1 });
    });

    if (hero && heroSlides) {
      parallaxItems.push({ hero, heroSlides });
    }

    function updateParallax() {
      const viewportHeight = window.innerHeight;

      parallaxItems.forEach((item) => {
        if (item.heroSlides) {
          const rect = item.hero.getBoundingClientRect();
          if (rect.bottom <= 0 || rect.top >= viewportHeight) return;
          item.heroSlides.style.transform = `translate3d(0, ${window.scrollY * 0.35}px, 0)`;
          return;
        }

        const { img, strength } = item;
        const rect = img.getBoundingClientRect();

        if (rect.bottom < 0 || rect.top > viewportHeight) return;

        const centerOffset = rect.top + rect.height / 2 - viewportHeight / 2;
        const shift = centerOffset * strength;
        img.style.setProperty("--parallax-y", `${shift}px`);
      });
    }

    let parallaxTicking = false;

    function onParallaxScroll() {
      if (parallaxTicking) return;
      parallaxTicking = true;
      requestAnimationFrame(() => {
        updateParallax();
        parallaxTicking = false;
      });
    }

    window.addEventListener("scroll", onParallaxScroll, { passive: true });
    window.addEventListener("resize", updateParallax);
    updateParallax();
  }

  function initLightbox() {
    const thumbSelector =
      ".work-grid__item img, .location-gallery img, .page-section__grid .page-section__media img";
    const thumbs = Array.from(document.querySelectorAll(thumbSelector));
    if (!thumbs.length) return;

    const locationSlug =
      document.body.dataset.location ||
      document.getElementById("location-enquiry-form")?.dataset.location ||
      "";
    const isLocationEnquiry = Boolean(locationSlug);

    let activeIndex = 0;
    let activeGroup = [];
    let lastFocus = null;

    const lightbox = document.createElement("div");
    lightbox.className = "lightbox" + (isLocationEnquiry ? " lightbox--enquiry" : "");
    lightbox.hidden = true;
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute(
      "aria-label",
      isLocationEnquiry ? "Location image enquiry" : "Image preview"
    );
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML = `
      <div class="lightbox__backdrop" data-lightbox-close></div>
      <button type="button" class="lightbox__close" aria-label="Close">&times;</button>
      <button type="button" class="lightbox__nav lightbox__nav--prev" aria-label="Previous image">&#8249;</button>
      <button type="button" class="lightbox__nav lightbox__nav--next" aria-label="Next image">&#8250;</button>
      <div class="lightbox__panel">
        <figure class="lightbox__figure">
          <img class="lightbox__image" src="" alt="">
          <figcaption class="lightbox__caption" hidden></figcaption>
        </figure>
        ${
          isLocationEnquiry
            ? `<div class="lightbox__enquiry">
          <h2 class="lightbox__enquiry-title">Enquire about this location</h2>
          <p class="lightbox__enquiry-intro">Share a few details and one of the team will be in touch within 48 hours.</p>
          <div class="lightbox__enquiry-form" id="lightbox-enquiry-form"></div>
        </div>`
            : ""
        }
      </div>
    `;
    document.body.appendChild(lightbox);

    const image = lightbox.querySelector(".lightbox__image");
    const caption = lightbox.querySelector(".lightbox__caption");
    const prevBtn = lightbox.querySelector(".lightbox__nav--prev");
    const nextBtn = lightbox.querySelector(".lightbox__nav--next");
    const closeBtn = lightbox.querySelector(".lightbox__close");
    const enquiryForm = lightbox.querySelector("#lightbox-enquiry-form");

    function getGroup(img) {
      if (isLocationEnquiry) {
        const gallery = document.querySelector(".location-gallery");
        const media = document.querySelector(
          ".page-section__grid--location .page-section__media img"
        );
        const group = [];
        if (media) group.push(media);
        if (gallery) {
          gallery.querySelectorAll("img").forEach((el) => group.push(el));
        }
        return group.length ? group : [img];
      }

      const section = img.closest(".page-section__inner");
      if (section) {
        return Array.from(section.querySelectorAll(thumbSelector));
      }

      const gallery = img.closest(".work-grid, .location-gallery");
      return gallery ? Array.from(gallery.querySelectorAll("img")) : [img];
    }

    function syncEnquiryForm(img) {
      if (!isLocationEnquiry || !enquiryForm || !window.GPHForms) return;

      const src = img.getAttribute("src") || img.src || "";
      const imageRef =
        img.dataset.imageRef || window.GPHForms.imageRefFromSrc(src);

      window.GPHForms.mountLightboxEnquiry(enquiryForm, {
        locationSlug,
        imageRef,
      });
    }

    function showImage(index) {
      const img = activeGroup[index];
      if (!img) return;

      activeIndex = index;
      image.src = img.getAttribute("src") || img.src;
      image.alt = img.getAttribute("alt") || "";
      image.style.width = "";
      image.style.height = "";
      image.style.transform = "";
      image.style.objectFit = "contain";
      const captionText = img.dataset.lightboxCaption || "";
      caption.textContent = captionText;
      caption.hidden = !captionText;
      const showNav = activeGroup.length > 1;
      prevBtn.hidden = !showNav;
      nextBtn.hidden = !showNav;

      if (isLocationEnquiry) {
        syncEnquiryForm(img);
      }
    }

    function open(img) {
      lastFocus = document.activeElement;
      activeGroup = getGroup(img);
      activeIndex = Math.max(0, activeGroup.indexOf(img));
      showImage(activeIndex);
      lightbox.hidden = false;
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
      closeBtn.focus();
    }

    function close() {
      lightbox.hidden = true;
      lightbox.setAttribute("aria-hidden", "true");
      image.removeAttribute("src");
      document.body.classList.remove("lightbox-open");
      if (isLocationEnquiry && enquiryForm && window.GPHForms) {
        window.GPHForms.clearLightboxEnquiry(enquiryForm);
      }
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    }

    function showNext(step) {
      if (activeGroup.length < 2) return;
      const nextIndex = (activeIndex + step + activeGroup.length) % activeGroup.length;
      showImage(nextIndex);
    }

    thumbs.forEach((thumb) => {
      thumb.classList.add("gallery-thumb");
      const trigger = thumb.closest("figure") || thumb;

      if (trigger.tagName === "FIGURE") {
        trigger.classList.add("gallery-thumb-wrap");
      }

      const onActivate = (event) => {
        event.preventDefault();
        open(thumb);
      };

      thumb.addEventListener("click", onActivate);
      thumb.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          onActivate(event);
        }
      });

      if (!thumb.hasAttribute("tabindex")) {
        thumb.setAttribute("tabindex", "0");
      }
      if (!thumb.getAttribute("role")) {
        thumb.setAttribute("role", "button");
      }
    });

    lightbox.addEventListener("click", (event) => {
      if (event.target.matches("[data-lightbox-close], .lightbox__close")) {
        close();
      }
    });

    prevBtn.addEventListener("click", () => showNext(-1));
    nextBtn.addEventListener("click", () => showNext(1));

    document.addEventListener("keydown", (event) => {
      if (lightbox.hidden) return;

      if (event.key === "Escape") {
        close();
      } else if (event.key === "ArrowLeft") {
        showNext(-1);
      } else if (event.key === "ArrowRight") {
        showNext(1);
      }
    });
  }

  window.addEventListener("scroll", setHeaderState, { passive: true });
  window.addEventListener("resize", setHeaderState);

  initNav();
  initParallax();
  initLightbox();
  setHeaderState();
  showSlide(0);
  startCarousel();
})();
