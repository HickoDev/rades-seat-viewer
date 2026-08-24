# Radès View

Radès View is an interactive procedural 3D representation of Stade Olympique Hammadi-Agrebi in Radès, Tunisia. The long-term product will let spectators explore the stadium, preview an approximate first-person seat view, and understand geometric sun exposure during a match.

This repository currently contains **Milestones 1–5**: the application foundation, procedural stadium geometry, instanced seat selection, and GSAP-powered overview, section, and fixed-eye seat camera modes. It is not a ticket-booking application, and it does not yet contain sunlight simulation, weather forecasts, or a heatmap.

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
- `src/test` and `e2e` contain Vitest/Testing Library setup and Playwright smoke coverage.

TanStack Query is installed at the provider boundary for later Open-Meteo integration. GSAP, SunCalc, Luxon, Zod, and `three-mesh-bvh` are installed for their planned milestones but are intentionally not wired into Milestone 1 behavior.

## Measurement status

The 105 × 68 metre pitch, 64 structural frames, and `Africa/Tunis` timezone are recorded from the project brief. Coordinates, scene north rotation, track, tier, bowl, and roof values are explicitly marked as configurable estimates requiring authoritative verification and calibration.

The result should be described as a recognisable procedural approximation, not an exact digital twin.

## Reference and implementation independence

The public `thebuggeddev/football-stadium` repository was designated as a conceptual reference. Its current public Git history contains a Vite starter rather than the described stadium implementation. Radès View therefore uses an independently written modular architecture and does not copy source, branding, interface, commerce flows, or decorative assets from that project.
