# Radès View

Radès View is an interactive procedural 3D representation of Stade Olympique Hammadi-Agrebi in Radès, Tunisia. The long-term product will let spectators explore the stadium, preview an approximate first-person seat view, and understand geometric sun exposure during a match.

This repository contains **Milestones 1–9**: the interactive procedural stadium, instanced seats, guided camera modes, structural occluders, astronomical sun direction, selected-seat shadow raycasts, five-minute exposure timelines, glare classification, validated short-range weather forecasts, and cached section/row sunlight heatmaps. It is not a ticket-booking application.

## Requirements

- Node.js 24 LTS
- npm
- A browser with WebGL support

## Setup

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Quality checks

```bash
npm run format:check
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

Install the Playwright Chromium binary first if the environment does not already have it:

```bash
npx playwright install chromium
```

## Foundation architecture

- `src/app` composes application-level providers and the responsive shell.
- `src/scene` owns React Three Fiber canvas concerns, lighting, environment, camera controls, and pixel-ratio adaptation.
- `src/stadium` is the stable composition boundary for future procedural geometry.
- `src/stadium/config/radesStadiumConfig.ts` is the single typed source of stadium measurements.
- `src/state` contains serializable interaction state only; Three.js objects stay in the scene layer.
- `src/ui` contains accessible DOM controls outside the WebGL canvas.
- `src/sunlight` separates astronomical direction, geometric occlusion, glare, timeline, cache, and heatmap classification concerns.
- `src/weather` contains the dedicated Open-Meteo client, Zod contract, Query hook, and radiation-based assessment helpers.
- `src/workers` runs representative heatmap raycasts away from the animation and interface thread.
- `src/test` and `e2e` contain Vitest/Testing Library setup and Playwright smoke coverage.

TanStack Query caches Open-Meteo requests, while Zod validates every response before it reaches the interface. Forecasts are only requested inside Open-Meteo's 16-day horizon; astronomical simulation remains available for long-range dates. GSAP handles reduced-motion-aware camera flights, SunCalc and Luxon handle astronomy and `Africa/Tunis` time, and `three-mesh-bvh` accelerates repeated rays against static complex occluders.

Heatmaps use one representative seat per section or per row, run in a Web Worker only when event time, resolution, or the central configuration version changes, and cache results in local storage. They are deliberately labelled as representative estimates. Auto rendering quality caps device pixel ratio and selects simpler shared seat geometry on compact touch devices.

## Measurement status

The 105 × 68 metre pitch, 64 structural frames, and `Africa/Tunis` timezone are recorded from the project brief. Coordinates, scene north rotation, track, tier, bowl, and roof values are explicitly marked as configurable estimates requiring authoritative verification and calibration.

The result should be described as a recognisable procedural approximation, not an exact digital twin.

## Reference and implementation independence

The public `thebuggeddev/football-stadium` repository was designated as a conceptual reference. Its current public Git history contains a Vite starter rather than the described stadium implementation. Radès View therefore uses an independently written modular architecture and does not copy source, branding, interface, commerce flows, or decorative assets from that project.
