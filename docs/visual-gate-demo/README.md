# Visual Gate #9 — Demo Assets

> Sample run from 2026-03-28 against salomonrinnert.com/de

## How to reproduce

```bash
BASE_URL=https://salomonrinnert.com \
VISUAL_ROUTES="/de" \
VISUAL_VIEWPORTS="desktop" \
VISUAL_BACKEND="openai-gpt-5.4-mini" \
VISUAL_OUTPUT_DIR=./docs/visual-gate-demo \
bash .claude/hooks/visual-check.sh --verbose
```

## Result

- **Exit code:** 0 (pass)
- **Score:** 9/10
- **Critical issues:** 0
- **Warnings:** 0
- **Passed:** 3 items (layout, readability, images)

See `sample-review.json` for full output structure.
See `salomonrinnert-de-desktop.png` for the captured screenshot.
