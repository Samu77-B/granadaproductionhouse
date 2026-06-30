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

  function restartSlidePan(slide) {
    const img = slide.querySelector("img");
    if (!img) return;

    img.style.animation = "none";
    void img.offsetWidth;
    img.style.animation = "";
  }

  function showSlide(index) {
    currentSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle("hero__slide--active", i === currentSlide);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("hero__dot--active", i === currentSlide);
    });

    restartSlidePan(slides[currentSlide]);
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
