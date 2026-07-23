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
    slideTimer = setInterval(nextSlide, 6000);
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

  window.addEventListener("scroll", setHeaderState, { passive: true });
  window.addEventListener("resize", setHeaderState);

  initNav();
  initParallax();
  setHeaderState();
  showSlide(0);
  startCarousel();
})();
