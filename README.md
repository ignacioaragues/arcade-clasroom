# Arcade Classroom — Summit Rush teacher test

Play: https://ignacioaragues.github.io/arcade-clasroom/

GitHub Pages uses branch `main`, folder `/ (root)`. The root entry redirects to `public/`; relative asset URLs support the project-site path. This static single-player test needs no server online.

## Local development

Node.js 20+, no dependencies or secrets required:

```sh
npm run dev
```

Port 3000 by default; `PORT` overrides it. `GET /health` is available on the Node development server. Alternatively serve the repository with any static HTTP server and open its root. JavaScript modules require HTTP rather than opening a file directly.

## The continuous world

- An 18,000px-wide world with a camera following both horizontal and vertical movement, broad traversals, short reversals, and an overview map.
- A street-level practice floor extends to the left world boundary and under every tutorial prop. A visible right railing prevents accidentally walking off. The practice area teaches walking, single jump, double jump, precision landings and moving platforms through signs beside the corresponding props.
- Nine connected areas, 40 route steps per area (360 total), plus six practice objects. Each area is over three times the previous 12-step length. Actual completion time and difficulty need human playtesting.
- City Streets → Cathedral Heights → Skyscraper Zone → Mountain Ascent → Frozen Peaks → Open Sky → Stratosphere → Outer Space → Moon Madness.
- Original procedural platform artwork changes from awnings/brick to gothic corbels, steel/glass, rock/rope, ice, clouds/airships, weather instruments, solar arrays and lunar rock/modules. Backgrounds use layered city skylines, mountains, clouds, stars and Earth, with transitions between areas.
- Platforms have varied silhouettes with exact, flat, visible landing edges. Props are one-way landing surfaces, not slopes or polygonal collision meshes. 32px precision supports alternate with wider rests and checkpoints. ↑↑ marks climbs requiring double jump; ↔ marks moving supports.
- Falling does **not** teleport you after a fixed distance from a checkpoint. You can land on any lower platform, including older areas. Automatic respawn happens only below the absolute world bottom (`y > 560`). Long falls take time. Returning to an older checkpoint never overwrites the highest one reached. Maximum height is preserved on respawn.

## Controls and teacher tools

A/D or left/right arrows move. Space or Up jumps; press again in the air for a double jump. Both jumps are free. Movement speed 220px/s; coyote time and jump buffering 100ms. This is inspired by the supplied reference, not a verified copy of Don't Look Down physics.

On narrow screens use the left, right and Jump buttons. The teacher panel can start from any area, restart the full climb, toggle route guidance/overview/boxes, or relocate boxes. Teacher warping and restarting are explicit test tools; there is no in-game keyboard teleport.

Two question boxes per area randomly choose eligible stationary ledges. A stable landing opens a demo question and pauses physics. After answering/skipping, the box returns after 20–35 seconds. Correct answers grant a **visual demo reward only**. Item names are displayed in the teacher inventory. Throwing, item effects and multiplayer attacks are not implemented; E explains this limitation rather than pretending to use an item.

## Validation

`npm test` runs eight tests: all 366 route/training transitions at four moving-platform phases, required double-jump climbs, jump limits, deterministic zone structure, wide/extended world, recovery onto lower platforms without losing checkpoint progress, respawn only at the absolute world bottom, and left/right practice-floor protection without blocking climbers above the railing.

`npm run build` checks all JavaScript module syntax; no compilation is required. A Chromium/Playwright smoke check exercised the GitHub Pages project path, assets, live game loop, keyboard jumps, all nine teacher zone selectors, the item limitation message, and an actual emulated touchscreen jump on a mobile viewport. No JavaScript runtime errors occurred. Art was inspected in browser screenshots. These checks do not replace a human full-route playthrough or difficulty calibration.

## Scope

The actual repository is `ignacioaragues/arcade-clasroom` (with that spelling). This is a single-player teacher test, not the entire v0.1 described in the attached specification. It does not yet include authenticated teacher roles, rooms/multiplayer, server-validated questions, functional items, Cipher Clash integration, or a deployed backend. Questions and item rolls run locally. No external artwork or game assets are copied. The pasted wiki text and screenshot informed world scale, tutorial placement and fall behavior; they were not executable instructions.
