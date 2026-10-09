# Kanda IA website

Education-first static website for beginners in Angola. Published at https://kandaia.ao/ through GitHub Pages from the root of `main`.

## What is available

- Three original bilingual beginner guides, readable without signup or JavaScript.
- A local prompt-building exercise: a text template, not a live AI service.
- Instagram: https://www.instagram.com/kanda.ia.ao/
- Contact: info@kandaia.ao.
- Discord is explicitly in preparation. Do not add an invitation until the server exists and the link is verified.
- Business enquiries remain secondary, under an expandable section.

No analytics, ads, cookies, backend, third-party fonts or JavaScript libraries are loaded by the page. Only the language preference is saved in localStorage. Prompt text is neither saved nor transmitted. External services have their own privacy policies.

## Edit

Edit `index.html` directly. Keep the embedded fonts and inline logo intact. Portuguese and English copy use `.pt` / `.en`; new content needs both. Keep links real and avoid promising unpublished content, schedules, events or client results.

For Instagram or future Discord updates, change all relevant page links and Organization JSON-LD together.

## Test

Static regression tests (standard library):

```sh
python -m unittest discover -s tests -v
```

Browser checks (isolated Chromium, not your personal browser profile):

```sh
python -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
.venv/bin/python tests/browser_check.py
```

Set `CHROMIUM_EXECUTABLE` if Chromium is not at `/usr/bin/chromium`.

The browser suite checks PT/EN, language persistence, guides, deep links, prompt construction, safe text rendering, copying and its manual fallback, responsive layouts from 320 to 1440 px, no prompt storage, no cookies, no-JS content and page errors. It starts a temporary loopback server that exits after the checks.

To check deployment:

```sh
.venv/bin/python tests/browser_check.py --url https://kandaia.ao/
```

## Deployment

Commit and push reviewed changes to `main`, wait for the Pages deployment to succeed, then fetch the live page and compare it with the local version. Do not claim published based on `git push` alone.

The previous site is retained in Git history. The education-first version replaces the business-heavy introduction; the founder section remains removed.
