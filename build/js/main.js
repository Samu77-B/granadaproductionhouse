(function () {
  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".site-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const slides = Array.from(document.querySelectorAll(".hero__slide"));
  const dots = Array.from(document.querySelectorAll(".hero__dot"));
  let currentSlide = 0;
  let slideTimer;

  function setHeaderState() {
    header.classList.toggle("site-header--scrolled", window.scrollY > 40);
  }

  function openNav() {
    nav.classList.add("site-nav--open");
    navToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeNav() {
    nav.classList.remove("site-nav--open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function restartPan(pan) {
    if (!pan) return;

    pan.style.animation = "none";
    void pan.offsetWidth;
    pan.style.removeProperty("animation");
  }

  function showSlide(index) {
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
    clearInterval(slideTimer);
    slideTimer = setInterval(nextSlide, 6000);
  }

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

  window.addEventListener("scroll", setHeaderState, { passive: true });
  window.addEventListener("resize", setHeaderState);

  setHeaderState();
  showSlide(0);
  startCarousel();
})();
