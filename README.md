# Case Files: Choose Your Path

Branching detective mysteries in plain HTML/CSS/JS. No build step.

## Structure
- `index.html`: page shell, loads every case then `engine.js`
- `style.css`, `engine.js`: look and logic
- `cases/<id>.js`: one case each, pushes onto `window.CASES`
- `tools/validate.js`: checks every case; `tools/format.js`: shared serialiser

## Run
Open `index.html`, or `npx serve .`

## Add a case
1. Create `cases/<id>.js` using the format in an existing case.
2. Add `<script src="cases/<id>.js"></script>` to `index.html` (before `engine.js`).
3. `node tools/validate.js`

## Scene fields
`t` text, `i` icon, `n` clue, `f` flags set, `c` choices `[label, scene, condition, flagsToSet]`, `b` back scene, `r` router `[condition, scene]`, `g` score router `[[flags], [min, scene]…]`, `e` ending title, `k` win|weak|fail, `s` secret.
Conditions: `a,b` = and, `a|b` = or, `!a` = not. `v_<scene>` is set when a scene is visited.

## Checks
`node tools/validate.js` (also `--prune` to drop unread flags).
Enable the pre-commit hook once: `git config core.hooksPath .githooks`. CI runs the same check.

## Deploy
GitHub Pages: Settings → Pages → Deploy from branch → `main` / root.
