# Production notes

This document records the final production behavior and the operational choices that are easy to miss when changing Radès View.

## Live application and deployment

- Production URL: <https://rades-seat-viewer.vercel.app>
- Repository: <https://github.com/HickoDev/rades-seat-viewer>
- The app is a Vite single-page application. Vercel serves hashed assets with immutable caching and adds conservative content-type, referrer, and browser-permission headers from `vercel.json`.
- The GitHub Actions workflow uses Node.js 24, installs from `package-lock.json`, runs the complete static/unit/build check, and then runs the Playwright acceptance suite in Chromium.

## First-load behavior

The match-time dialog is the only product step loaded initially. The Three.js stadium, generated seat/crowd metadata, camera stack, and stadium controls are deferred until the user confirms kickoff and expected end. This keeps the first interaction responsive and avoids spending GPU and CPU time behind the blocking setup dialog.

The production bundle uses explicit vendor groups for React, Three.js, React Three Fiber/Drei, BVH acceleration, and simulation utilities. The large 3D dependencies are cached separately from application code.

## Exposure map contract

- Heatmap classifications never replace chair colors, spectator clothing, pitch materials, or stadium geometry.
- Pitch-side advertising is an explicit HickoDev creator campaign, not a reconstruction of permanent stadium sponsorship. Its accessible sidebar links follow the same priority order as the LED-style board rotation: itch.io, GitHub, then an Instagram/Facebook contact phase.
- The sidebar opens a separate accessible SVG top-view plan.
- Every section is a pointer- and keyboard-selectable zone with a text label and numerical detail; color is never the only carrier of meaning.
- Row-detail simulations are averaged into a section color for the overview. The selected section also lists its representative row samples.
- All 64 tier sections receive representative sunlight colors, including the chairless lower terraces and the physically modeled closed upper virages. Closed areas remain unavailable for visitor POV selection and are labelled “sunlight map only.”
- The plan follows the configured scene orientation and includes true north, but it remains a schematic plan rather than a surveyed seating chart.
- “Exposure” means representative geometric direct-sun duration. It is not measured air or surface temperature.

## Rendering and simulation performance

- Seats and people use shared geometries and instanced meshes; there is no React component per seat or person.
- Crowd section predicates run before person records are constructed, so closed and unrelated placements do not allocate unused crowd objects.
- Crowd clothing is permanent deterministic match-day styling. Heatmap changes no longer cause crowd components to subscribe or rewrite instance colors.
- Virage bounce uses a GPU vertex shader in high-motion mode. Reduced-motion users receive static transforms without animation shader attributes.
- Player and ball movement reuses stable objects and updates transforms in the render loop without writing frame state to Zustand.
- Sunlight heatmaps run in a Web Worker and cache by stadium configuration, time basis, resolution, and match window.
- Direct 3D clicks on an open lower virage enter a representative standing-terrace POV. Clicking the larger closed upper-virage surface redirects to the nearest valid lower terrace rather than offering a prohibited upper-virage viewpoint.
- BVH acceleration is initialized with the deferred 3D bundle and used only for the relevant static occluders.
- Automatic quality starts high on capable desktop devices and reduces pixel ratio, crowd occupancy, and geometry detail on compact touch devices. A manual quality selector remains available.
- High-detail rendering is the default on every device. A visitor can explicitly select Low, and that choice is remembered in browser storage. `?quality=low` and `?quality=high` remain diagnostic overrides; the browser suite uses the low override to avoid retaining high-detail GPU allocations across sequential headless cases.

## Demo-video preview

The README currently uses `docs/assets/demo-preview.svg` as a production-styled poster and links it to the live application. To publish the final recording:

1. Export a concise MP4 or WebM walkthrough showing match setup, section selection, seat/terrace POV, live sun/shade, weather, and the 2D exposure plan.
2. Prefer hosting the video on a streaming/CDN service and replace the poster link in `README.md` with that URL.
3. If repository hosting is intentional, add `docs/assets/rades-view-demo.mp4` and change the README poster destination to that relative path. Check the file size before committing; GitHub repositories should not become the primary home for large production video assets.
4. Keep the SVG as the poster/fallback and update its wording if the upload path changes.

## Data and calibration boundaries

`src/stadium/config/radesStadiumConfig.ts` remains the only source for stadium measurements and verification labels. The 105 × 68 m pitch, Africa/Tunis timezone, coordinates, and recorded 64 structural frames are separated from photo-calibrated estimates. The project-owner-requested 180-degree orientation reversal is applied consistently to visible sunlight, raycasts, top-view north, and cached heatmaps.

Public-facing stand names follow Radès ticket terminology rather than treating each complete geometric tier as one category: the main-stand side uses Enceinte inférieure or Enceinte supérieure, the opposite long side is Pelouse, the central official block remains Tribune d'honneur / Presse, and the two ends remain Virage. The configuration tier names are therefore neutral Niveau inférieur and Niveau supérieur.

Do not describe this model as an exact digital twin. Roof, bowl, access, shadow boundaries, and several internal/external dimensions still require architectural or survey data. Open-Meteo weather is requested only inside its reliable forecast window; long-range events retain astronomy without fabricated weather.

## Accessibility and failure behavior

- Keyboard controls, visible focus, text exposure labels, reduced motion, Escape from seat view, and a non-color heatmap explanation are release requirements.
- The top-view map supports Enter and Space on every section and closes with Escape.
- A root error boundary offers an explicit reload path if a rendering or lazy-load failure escapes component handling.
- The WebGL fallback explains when the browser cannot display the stadium.

## Release checklist

Run these commands from a clean Node.js 24 environment:

```bash
npm ci
npm run format:check
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

Before committing, also run `git status` and `git diff --cached --name-only`. Local `skills/`, prompt files, and `.codex` AI instruction files must never be staged or tracked.
