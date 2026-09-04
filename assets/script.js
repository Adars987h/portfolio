/* ==========================================================================
   Adarsh Kumar Srivastava — portfolio behaviour
   ========================================================================== */
(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  /* ---------- theme ---------- */
  const root = document.documentElement;
  const themeToggle = $("#theme-toggle");
  const STORAGE_KEY = "theme";

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    root.dataset.theme = stored;
  } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    root.dataset.theme = "light";
  }

  const syncThemeColor = () => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", root.dataset.theme === "light" ? "#f6f7fb" : "#0b0d12");
    }
  };
  syncThemeColor();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
      localStorage.setItem(STORAGE_KEY, root.dataset.theme);
      syncThemeColor();
    });
  }

  /* ---------- mobile navigation ---------- */
  const nav = $("#nav");
  const navOpen = $("#nav-open");
  const navClose = $("#nav-close");

  const setNav = (open) => {
    if (!nav) return;
    nav.classList.toggle("is-open", open);
    if (navOpen) navOpen.setAttribute("aria-expanded", String(open));
  };

  if (navOpen) navOpen.addEventListener("click", () => setNav(true));
  if (navClose) navClose.addEventListener("click", () => setNav(false));

  $$(".nav__link").forEach((link) => link.addEventListener("click", () => setNav(false)));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setNav(false);
  });

  document.addEventListener("click", (event) => {
    if (!nav || !nav.classList.contains("is-open")) return;
    if (nav.contains(event.target) || (navOpen && navOpen.contains(event.target))) return;
    setNav(false);
  });

  /* ---------- header + scroll-to-top state ---------- */
  const header = $("#header");
  const scrollUp = $("#scroll-up");

  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 24);
    if (scrollUp) scrollUp.classList.toggle("is-visible", y > 420);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- active nav link ---------- */
  const sections = $$("main section[id]");
  const navLinks = new Map($$(".nav__link").map((link) => [link.getAttribute("href"), link]));

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => link.classList.remove("is-active"));
          const active = navLinks.get("#" + entry.target.id);
          if (active) active.classList.add("is-active");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach((section) => spy.observe(section));
  }

  /* ---------- reveal on scroll ---------- */
  const revealables = $$(".reveal");

  if ("IntersectionObserver" in window && revealables.length) {
    const revealer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry, index) => {
          if (!entry.isIntersecting) return;
          entry.target.style.transitionDelay = Math.min(index * 70, 280) + "ms";
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );

    revealables.forEach((element) => revealer.observe(element));
  } else {
    revealables.forEach((element) => element.classList.add("is-visible"));
  }

  /* ---------- about photo: play drift + caption when it scrolls into view ---------- */
  const aboutMedia = $("#about-media");

  if (aboutMedia && "IntersectionObserver" in window) {
    let playTimer;

    const player = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          aboutMedia.classList.add("is-playing");
          clearTimeout(playTimer);
          // let the 5s drift finish, then settle back so hover can replay it
          playTimer = setTimeout(() => aboutMedia.classList.remove("is-playing"), 5600);
        });
      },
      { threshold: 0.45 }
    );

    player.observe(aboutMedia);
  }

  /* ---------- footer year ---------- */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
