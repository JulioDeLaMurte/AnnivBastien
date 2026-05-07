# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A static, purely client-side birthday ARG (Alternate Reality Game) built for Bastien's 25th birthday. No build step, no framework, no server - open the HTML files directly in a browser or serve via any static file server.

## How to run

```powershell
# Quick: open the entry point directly in a browser
Start-Process "arg/01-intro.html"

# Or serve locally (any static server works)
npx serve .
python -m http.server 8080
```

Navigate to `arg/01-intro.html` to start. Progress is tracked via `localStorage` (`bastien_unlocked`).

## Architecture

```
arg/
  shared.css       # All shared styles (paper/newspaper aesthetic, avatars, victory overlay)
  shared.js        # All shared JS - classes + utilities
  01-intro.html    # Entry page (always accessible, sets bastien_unlocked=1)
  02-gps.html      # Puzzle 1: GPS coordinates
  03-moto.html     # Puzzle 2: motorcycle
  04-cipher.html   # Puzzle 3: ROT13 + Morse cipher
  05-music.html    # Puzzle 4: music recognition
  06-image.html    # Puzzle 5: image-based puzzle
  07-drone.html    # Puzzle 6: drone
  08-final.html    # Ending: reveals the real-world gift location
uploads/           # Photos and audio assets referenced by HTML pages
```

### `shared.js` key exports

- **`PhotoAvatar`** - renders a real photo in a circular canvas with an animated talking mouth and a speech bubble. Used for Jules (right, fixed) and Juliette (left, fixed) on every page.
- **`JulesAvatar`** - older SVG-based avatar class (kept for compatibility); `JULES_EXPRESSIONS` holds the named SVG eye/brow/mouth variants.
- **`buildAvatarSVG(expression)`** - returns an SVG string for a given expression name (`normal`, `smug`, `shocked`, `dead`, `proud`, `shame`).
- **`ARG_PAGES`** - ordered array of filenames; drives the unlock system.
- **`checkAccess(myIdx)`** - called at the top of every puzzle page; redirects backward if the player hasn't unlocked that step yet.
- **`unlockNext(currentIdx)` / `goToNext(currentIdx, delay?)`** - called on correct answer to persist progress and navigate forward.
- **`showVictory(message, nextFn)`** - triggers the yellow full-screen victory overlay, then calls `nextFn` after 2.5 s.

### Per-page pattern

Each puzzle HTML file follows the same structure:

1. Import `shared.css`, add inline `<style>` for page-specific layout.
2. Newspaper-style header banner (`paper-header`), step badge, lede text.
3. Puzzle UI (input fields, buttons, media players, etc.).
4. `#victory-overlay` markup (required by `showVictory()`).
5. `#juliette-avatar` and `#jules-avatar` divs.
6. `<script src="shared.js"></script>` followed by an inline script that:
   - Calls `checkAccess(pageIndex)` (1-indexed; 0 = intro, skip).
   - Instantiates two `PhotoAvatar` objects with page-specific quips and reaction pools.
   - Defines `validate()` which checks the answer and calls `showVictory(...)` + `goToNext(pageIndex)` on success.

### CSS design tokens (`:root` in `shared.css`)

| Variable       | Value     | Use                    |
| -------------- | --------- | ---------------------- |
| `--paper`      | `#f2ead8` | Page background        |
| `--paper-dark` | `#e8dcc0` | Inset / callout boxes  |
| `--ink`        | `#1a1208` | Text, borders, buttons |
| `--ink-light`  | `#3d3220` | Secondary text         |
| `--red`        | `#c0392b` | Accent / feedback OK   |
| `--yellow`     | `#f4c842` | Victory overlay BG     |
| `--stamp`      | `#8b2500` | Stamp decoration       |

Fonts loaded from Google Fonts: **Bebas Neue** (headlines), **DM Sans** (body), **Special Elite** (body-text / newspaper feel).

## Adding or modifying a puzzle page

1. Copy any existing puzzle HTML as a template.
2. Update `checkAccess(N)` and `goToNext(N)` to use the correct 0-based page index.
3. Add the new filename to `ARG_PAGES` in `shared.js` at the right position.
4. The `PhotoAvatar` constructor signature: `new PhotoAvatar(containerId, photoSrc, name, quips, reactions)` where `reactions` is `{ correct: [], wrong: [], hint: [] }`.

## Asset paths

HTML files live inside `arg/`, so assets in `uploads/` are referenced as `../uploads/filename`.
