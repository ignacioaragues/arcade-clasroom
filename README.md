# Arcade Classroom — teacher physics test

Play the static teacher test: https://ignacioaragues.github.io/arcade-clasroom/

GitHub Pages: publish branch `main`, folder `/ (root)`. The root entry redirects to `public/`; all game assets use relative URLs so project-site paths work. This static test needs no Node server online. The Node server below is for local development; `/health` is available only there.

Requires Node.js 20+. No dependencies or secrets required.

```sh
npm run dev
```

Open the app on port 3000. `PORT` overrides the port. Health check: `GET /health`.

This is a local, single-player teacher test built from the user's request, using the attached specification as product context. The repository supplied to this session is `ignacioaragues/arcade-clasroom` (with that spelling).

## Teacher controls

Choose any of nine zones and click **Try this zone**. Restart, return to checkpoints with R, toggle route guides or boxes, and move boxes among eligible ledges. A/D or arrows move; Space jumps twice. Touch controls are included. The route is fixed: 108 jumps with progressive difficulty: the first two zones use wide single-jump landings; later zones add 32px single-tile ledges, marked climbs requiring double jump, and horizontally moving supports in the last three zones. Wide checkpoints provide rests at zone boundaries. Gold ↑↑ ledges mark double-jump climbs and purple ↔ ledges move. Jump buffering and coyote time are 100ms. This is inspired by the requested reference, not a verified reproduction of Don't Look Down physics.

Boxes are randomly placed only on eligible wide ledges, one per zone, and trigger only on stable landing. After answering/skipping they return after 20–35 seconds at another eligible location (possibly the same ledge). Physics pauses during questions. Demo answers and reward rolls run locally; rewards are displayed, not functional items. Double jump is free, regardless of question performance.

## Validation

`npm test` checks all 108 route transitions at four moving-platform phases through the actual physics integrator, verifies that marked climbs require double jump, checks the jump limit, and validates zone structure. `npm run build` checks JavaScript syntax; no compilation is needed.

## Scope

This is not the full v0.1 in the attached document. It has no authenticated teacher account, rooms, multiplayer, server-validated questions, functional items, Cipher Clash integration, or backend deployment. The teacher test is the default view for local evaluation and must not be treated as a production role-protected screen. No external game assets or services are used. Desktop and mobile controls require user playtesting for feel and difficulty.

Current validation: 4 automated tests passed, JavaScript syntax checks passed, and HTTP health/static module requests passed. A Playwright smoke check using system Chromium passed: live game loop, keyboard jumps, teacher zone selection, restart, mobile control visibility, and no JavaScript runtime errors. Touch interaction and subjective difficulty still need user playtesting.
