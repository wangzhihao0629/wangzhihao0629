# AGENTS.md

## Cursor Cloud specific instructions

This repository is a **zero-dependency static website** (a personal portfolio, served in production via GitHub Pages using the domains in `CNAME`). There is no package manager, build step, backend, database, tests, or lint config.

- Source of truth: `index.html` (single self-contained page with inline CSS/JS), `calendar.html` (Google Calendar iframe), and static assets under `resource/`.
- No dependencies to install and nothing to build; there is no update/setup script beyond confirming `python3` is present.
- Run locally by serving the repo root with any static file server, e.g. `python3 -m http.server 8000`, then open `http://localhost:8000/index.html`. In production, GitHub Pages serves the files directly on push to the default branch.
- Interactive features to spot-check: the theme toggle (`[theme]` in the top nav / `#theme-btn`, dark↔light) and the command palette overlay (opens via the `[/]` nav item or the `/` key). Note that `Ctrl+K`/`Cmd+K` triggers the browser's own search, not the site palette.
- Non-obvious caveats: `calendar.html` embeds a Google Calendar and will show a Google sign-in prompt rather than a calendar (expected). The page also pings an external hit counter (`api.counterapi.dev`) and loads Google Fonts; both are optional and the page renders fine offline via system-font fallbacks.
