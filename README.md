# Portfolio — Adarsh Kumar Srivastava

Personal portfolio site for **Adarsh Kumar Srivastava**, Senior Software Engineer (backend, fintech).

**Live:** [adarshsri.vercel.app](https://adarshsri.vercel.app/)

## Stack

Plain static site — no build step, no framework, no bundler.

- `index.html` — all markup, plus an inline SVG icon sprite
- `assets/style.css` — design system (CSS custom properties, dark/light themes, responsive layout)
- `assets/script.js` — theme toggle, mobile nav drawer (focus trap, scroll lock), scroll-spy nav, reveal-on-scroll, timeline progress, hero parallax
- `assets/img/` — images (`.webp` served via `<picture>`, original `.jpg`/`.png` as fallback)
- `assets/Resume.pdf` — downloadable resume

The only external dependency is Google Fonts (Inter + JetBrains Mono).

## Local development

Any static file server works:

```bash
python -m http.server 5599
```

Then open <http://127.0.0.1:5599>.

## Deployment

Pushing to `main` deploys automatically via Vercel.

## Notes

- Theme defaults to dark, respects `prefers-color-scheme`, and persists the choice in `localStorage`. A tiny inline script in `<head>` applies it before first paint.
- Animations are disabled under `prefers-reduced-motion`.
- Content (role, experience, skills) should be kept in sync with `assets/Resume.pdf`.
- Production work is proprietary: describe problem, ownership and outcome only — no internals.
