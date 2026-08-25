document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // ---------- nav toggle ----------
  var navToggle = document.getElementById("nav-toggle");
  var navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      navLinks.classList.toggle("open");
    });
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
      });
    });
  }

  // ---------- navbar shadow on scroll ----------
  var navbar = document.getElementById("navbar");
  if (navbar) {
    window.addEventListener("scroll", function () {
      navbar.style.boxShadow = window.scrollY > 40 ? "0 10px 36px rgba(0,0,0,.45)" : "none";
    }, { passive: true });
  }

  // ---------- smooth scroll for anchor links ----------
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var href = this.getAttribute("href");
      if (!href || href === "#") return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // ---------- nav scrollspy ----------
  var spyLinks = document.querySelectorAll(".nav-link");
  var spySections = [];

  spyLinks.forEach(function (link) {
    var id = link.getAttribute("href");
    if (!id) return;
    var section = document.querySelector(id);
    if (section) spySections.push({ link: link, section: section });
  });

  if ("IntersectionObserver" in window && spySections.length) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var activeId = "#" + entry.target.id;
        spySections.forEach(function (item) {
          if (item.link.getAttribute("href") === activeId) {
            item.link.classList.add("active");
          } else {
            item.link.classList.remove("active");
          }
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });

    spySections.forEach(function (item) {
      spyObserver.observe(item.section);
    });
  }

  // ---------- hero parallax ----------
  var heroBg = document.querySelector(".hero-bg");
  if (heroBg) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          heroBg.style.transform = "translateY(" + y * 0.28 + "px)";
        }
        ticking = false;
      });
    }, { passive: true });
  }

  // ---------- reveal on scroll ----------
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.dataset.delay || "0", 10);
        setTimeout(function () {
          el.classList.add("visible");
        }, delay);
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  // ---------- faq accordion ----------
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var question = item.querySelector(".faq-question");
    if (!question) return;
    question.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      faqItems.forEach(function (other) {
        other.classList.remove("open");
        var q = other.querySelector(".faq-question");
        if (q) q.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        question.setAttribute("aria-expanded", "true");
      }
    });
  });

  // ---------- gallery lightbox ----------
  var galleryItems = document.querySelectorAll(".gallery-item");
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxClose = document.getElementById("lightbox-close");
  var lightboxPrev = document.getElementById("lightbox-prev");
  var lightboxNext = document.getElementById("lightbox-next");

  var current = 0;
  var sources = [];

  galleryItems.forEach(function (item, index) {
    var img = item.querySelector("img");
    if (img) sources.push(img.src);
    item.addEventListener("click", function () {
      if (!lightbox || !lightboxImg) return;
      current = index;
      lightboxImg.src = sources[current];
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }

  function step(dir) {
    if (!sources.length) return;
    current = (current + dir + sources.length) % sources.length;
    lightboxImg.src = sources[current];
  }

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener("click", function () { step(-1); });
  if (lightboxNext) lightboxNext.addEventListener("click", function () { step(1); });
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (!lightbox || lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  // ---------- preview video: autoplay + fallback ----------
  var panelVideo = document.querySelector(".preview-video");

  if (panelVideo) {
    panelVideo.muted = true;

    function tryPlay() {
      var p = panelVideo.play();
      if (p && typeof p.catch === "function") {
        p.catch(function () {});
      }
    }

    tryPlay();

    panelVideo.addEventListener("loadedmetadata", tryPlay);
    panelVideo.addEventListener("canplay", tryPlay);

    var videoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) tryPlay();
      });
    }, { threshold: 0.1 });
    videoObserver.observe(panelVideo);

    document.addEventListener("click", function once() {
      tryPlay();
      document.removeEventListener("click", once);
    }, { once: true });
  }

  // ---------- easter egg: click logo 5 times ----------
  var eggClicks = 0;
  var eggTarget = document.getElementById("nav-logo-link");
  var toast = document.getElementById("toast");

  if (eggTarget && toast) {
    eggTarget.addEventListener("click", function (e) {
      e.preventDefault();
      eggClicks++;
      if (eggClicks >= 5) {
        eggClicks = 0;
        toast.hidden = false;
        setTimeout(function () {
          toast.hidden = true;
        }, 2600);
      }
    });
  }

  // ---------- footer year ----------
  var yearEl = document.getElementById("footer-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});