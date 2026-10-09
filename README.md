# Kanda IA website

Education-first, multipage static website for beginners in Angola. GitHub Pages publishes the repository root from `main` to https://kandaia.ao/.

## Structure

- `/`: short entry page with a featured guide and links into the three community/learning spaces.
- `/aprender/`: guide directory.
- `/aprender/aprender-com-ia/`, `/aprender/escrever-melhor/`, `/aprender/verificar-respostas/`: three independent bilingual beginner guides.
- `/experimentar/`: local prompt-building exercise (a text template, not live AI).
- `/comunidade/`: Instagram, email, participation guidance and Discord marked in preparation.
- `/solucoes/`: separate, secondary business enquiries.

Navigation opens real pages, not homepage sections. Direct links and browser reloads work without a JavaScript router.

## Visual identity

`assets/site.css` retains the original neon stylesheet from commit `53264e1`, including embedded fonts, cyan/magenta, terminal header, holographic cards, CRT texture, grid and glitch titles. Multipage/responsive/accessibility adjustments are appended after the original CSS. Do not replace that visual identity without Bedri's explicit approval.

`assets/site.js` handles the PT/EN preference across pages and the prompt builder when that tool is present. Prompt text is neither saved nor transmitted. Only language preference is saved in localStorage. The site loads no analytics, ads, cookies, remote fonts or JS libraries.

The original single-file design and the intermediate educational landing page remain in Git history. The founder section stays removed.

## Edit

Edit the relevant route's `index.html`; update common navigation/footer consistently across all eight pages. Reuse `assets/site.css` and `assets/site.js`. New content needs both `.pt` and `.en` text. Keep each page's title, description, canonical, social metadata and sitemap entry accurate.

Instagram: https://www.instagram.com/kanda.ia.ao/. Contact: info@kandaia.ao. Add no Discord invitation until the server exists and its link is verified. Do not promise unpublished schedules, events, libraries or client results.

## Test

Standard-library checks:

```sh
python -m unittest discover -s tests -v
node --check assets/site.js
```

Browser checks (isolated Chromium, not the personal browser profile):

```sh
python -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
.venv/bin/python tests/browser_check.py
```

Set `CHROMIUM_EXECUTABLE` if Chromium is not at `/usr/bin/chromium`.

The browser suite follows the actual homepage → directory → article → exercise path, checks all eight direct routes, PT/EN across navigation, active navigation, original animations, prompt building, safe text rendering, copy/manual fallback, layouts from 320 to 1440 px in both languages, no prompt storage or cookies, no-JS navigation and no failed assets or page errors. Its temporary loopback server exits after the checks.

Check production with:

```sh
.venv/bin/python tests/browser_check.py --url https://kandaia.ao/
```

## Deployment

Commit and push reviewed changes to `main`, wait for Pages deployment success, then fetch and compare the exact live pages/assets against local files. Run production browser checks. A successful push alone is not proof of publication.
