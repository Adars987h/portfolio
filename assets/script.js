/* ==========================================================================
   Adarsh Kumar Srivastava — portfolio behaviour
   (initial theme is applied by the inline script in <head> to avoid a flash)
   ========================================================================== */
(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hasIO = "IntersectionObserver" in window;

  /* ---------- theme ---------- */
  const themeToggle = $("#theme-toggle");
  const themeMeta = $('meta[name="theme-color"]');

  const syncTheme = () => {
    const light = root.dataset.theme === "light";
    if (themeMeta) themeMeta.setAttribute("content", light ? "#f6f6f3" : "#0a0b0e");
    if (themeToggle) themeToggle.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
  };
  syncTheme();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", root.dataset.theme);
      syncTheme();
    });
  }

  /* ---------- mobile navigation drawer ---------- */
  const nav = $("#nav");
  const navOpen = $("#nav-open");
  const navClose = $("#nav-close");
  const scrim = $("#nav-scrim");
  const isOpen = () => nav && nav.classList.contains("is-open");

  const setNav = (open) => {
    if (!nav || open === isOpen()) return;
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("is-locked", open);
    if (navOpen) navOpen.setAttribute("aria-expanded", String(open));
    if (open) {
      if (navClose) navClose.focus();
    } else if (navOpen) {
      navOpen.focus();
    }
  };

  if (navOpen) navOpen.addEventListener("click", () => setNav(true));
  if (navClose) navClose.addEventListener("click", () => setNav(false));
  if (scrim) scrim.addEventListener("click", () => setNav(false));
  $$("#nav a").forEach((link) => link.addEventListener("click", () => setNav(false)));

  document.addEventListener("keydown", (event) => {
    if (!isOpen()) return;
    if (event.key === "Escape") {
      setNav(false);
      return;
    }
    // keep Tab focus inside the open drawer
    if (event.key === "Tab") {
      const focusables = $$("#nav a, #nav button");
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  // drawer is desktop-hidden; don't leave the page locked if the viewport grows
  window.matchMedia("(min-width: 881px)").addEventListener("change", (e) => {
    if (e.matches && isOpen()) {
      nav.classList.remove("is-open");
      document.body.classList.remove("is-locked");
      if (navOpen) navOpen.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- scroll-driven state (one rAF-throttled handler) ---------- */
  const header = $("#header");
  const scrollUp = $("#scroll-up");
  const portrait = $("#portrait");
  const timeline = $("#timeline");
  const tlItems = $$(".tl");
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;

    if (header) header.classList.toggle("is-scrolled", y > 16);
    if (scrollUp) scrollUp.classList.toggle("is-visible", y > 480);

    // hero: portrait drifts slightly slower than the page
    if (portrait && !reduceMotion.matches && y < vh * 1.2) {
      portrait.style.setProperty("--parallax", (y * -0.06).toFixed(1) + "px");
    }

    // experience: rail fills as it passes 60% of the viewport, nodes light up behind it
    if (timeline) {
      const line = vh * 0.6;
      const rect = timeline.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (line - rect.top) / rect.height));
      timeline.style.setProperty("--progress", progress.toFixed(3));
      tlItems.forEach((item) => {
        item.classList.toggle("is-active", item.getBoundingClientRect().top + 8 < line);
      });
    }
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();

  /* ---------- active nav link ---------- */
  const navLinks = new Map($$(".nav__link").map((link) => [link.getAttribute("href"), link]));

  if (hasIO) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const active = navLinks.get("#" + entry.target.id);
          // sections without a nav link (hero, impact) clear the indicator
          navLinks.forEach((link) => link.classList.toggle("is-active", link === active));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    $$("main section[id]").forEach((section) => spy.observe(section));
  }

  /* ---------- reveal on scroll ---------- */
  const revealables = $$(".reveal");

  if (hasIO) {
    const revealer = new IntersectionObserver(
      (entries, observer) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry, index) => {
            // stagger elements that enter together
            entry.target.style.transitionDelay = Math.min(index * 70, 280) + "ms";
            entry.target.classList.add("is-visible");
            entry.target.addEventListener(
              "transitionend",
              () => (entry.target.style.transitionDelay = ""),
              { once: true }
            );
            observer.unobserve(entry.target);
          });
      },
      { rootMargin: "0px 0px -40px 0px" }
    );

    revealables.forEach((element) => revealer.observe(element));
  } else {
    revealables.forEach((element) => element.classList.add("is-visible"));
  }

  /* ---------- about photo: play drift + caption when it scrolls into view ---------- */
  const aboutMedia = $("#about-media");

  if (aboutMedia && hasIO) {
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
