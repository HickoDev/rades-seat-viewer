# Radès visual calibration record

This document separates source-backed stadium facts from visual calibration estimates used by the procedural model. The goal is a recognisable Radès approximation, not a surveyed digital twin.

## Source-backed facts

- SBF reports 64 reinforced-concrete portal frames reaching 33 metres, plus 22,000 m³ of concrete and 2,800 tonnes of steel in the supporting structure.
- Published stadium summaries consistently report 60,000 covered places, with 32,000 in the lower tribune and 28,000 in the upper tribune. This is a spectator-capacity statement, not a plastic-chair instance count.
- The same summaries report a 7,000-place honor/official tribune and a press tribune equipped with 300 desks.
- The project owner has confirmed that the two virages must be represented as chairless terraces. Their exact angular boundaries remain unverified.
- Two large end scoreboards are visible in interior photographs.

## Repeated visual features

The implementation uses the following features because they recur across photographs from different dates and viewpoints:

- a two-level pale-blue seating bowl;
- a pale intermediate concourse articulated by repeated dark rectangular openings, light frames, and a blue accent strip;
- radial light-concrete aisles, metal barriers, and framed vomitories;
- a long glazed honor/press frontage on one sideline;
- a white tensile roof with visibly sagged radial membrane bays, a scalloped outer edge, and a dense white inner space truss;
- tall external roof masts with cable stays and roof-edge floodlight arrays;
- four detached circular spiral-ramp towers grouped as two pairs on the ceremonial long side and connected to the concourse, plus an open dark upper façade with repeated pale X-braces;
- red athletics surfacing, warm field-event aprons inside both bends with parallel runway markings, a continuous inner safety rail, paired segmented translucent-blue team shelters on the main-stand side, white goal nets, and event-dependent pitch-side advertising hoardings;
- a central main-stand player entrance aligned between the two shelters, with the retractable white covered route reported as approximately 30 metres long in January 2023;
- a cream ceremonial entrance with deep-blue arched glazing, blue trim, a yellow patterned band, a taller central gateway, flagpoles, palms, and a broad processional plaza.

Advertising artwork changes by competition and sponsor. The application therefore uses neutral Radès/Tunisia match-day graphics instead of claiming that one photographed sponsor layout is permanent.

## Authorized visual reference

The project owner reports that 3D artist Hassene Alaya granted permission to use the publicly displayed model as a visual reference, provided its original model file is not used. This project therefore independently recreates observed forms with procedural TypeScript geometry. It does not download, import, extract, trace, redistribute, or include any mesh or texture from the reference model.

The owner-supplied interior and aerial renders used in the August 2026 calibration pass remain outside the repository. They were used to compare proportions and recurring structural relationships only: tier separation, rectangular concourse rhythm, seating color blocks, track-bend aprons, honor/press frontage, scoreboard placement, and roof-lattice depth.

## Configurable estimates

No public architectural plan or survey was located for the bowl section, honor suite envelope, roof opening, façade bays, advertising-board offsets, spiral ramps, entrance landscaping, field-event apron, safety rail, tunnel width, or technical-area shelters. Their dimensions live in `radesStadiumConfig.ts` and are explicitly classified as estimates or authorized-reference calibrations. Roof waves and seams, underside color, truss depth, mast positions, concourse bays, window counts, ramp turns, cross-brace spacing, ceremonial entrance dimensions, player-route endpoints, and dugout position were calibrated visually against the sources below. Crowd and player motion is illustrative rather than a reconstruction of a particular match.

## Repeatable interior validation views

The interface exposes named comparison cameras for the lower and upper main stand, honor balcony, both virages, a corner junction, the opposite upper stand, a behind-goal pitch-level view, and the player entrance. These viewpoints are fixed procedural inspection positions rather than spectator seats. They make successive visual comparisons repeatable without claiming surveyed camera coordinates.

## Reference set

- [SBF supporting-structure project](https://sbf.com.tn/en/the-supporting-structure-of-the-olympic-stadium/)
- [Hassene Alaya public visual reference](https://sketchfab.com/3d-models/stade-olympique-de-rades-tunisie-b6284acc3aab43059cf3f9d2dd8e3794)
- [Wikimedia Commons Radès stadium archive](https://commons.wikimedia.org/wiki/Category:Rad%C3%A8s_stadium)
- [2017 interior photograph](https://commons.wikimedia.org/wiki/File:Stade_de_Rad%C3%A9s_2017_1.jpg)
- [Europlan interior photographs](https://www.europlan-online.de/stade-olympique-de-rad%EF%BF%BDs/stadion-6370.html)
- [Mosaïque FM empty-bowl/virage photograph](https://www.mosaiquefm.net/fr/football/1138703/est-zamalek-les-virages-du-stade-de-rades-ouverts)
- [Webdo 2023 report and photograph of the approximately 30 m extended player tunnel](https://www.webdo.tn/fr/actualite/sport/stade-hamadi-agrebi-de-rades-le-tunnel-menant-aux-vestiaires-rallonge/202187/)
- [Mosaïque FM 2024 renovation gallery](https://www.mosaiquefm.net/fr/album/19094/le-stade-de-rades-fait-peau-neuve-a-l-occasion-du-clasico)
- [Hammadi Agrebi renovation photographs](https://realites.com.tn/fr/le-stade-hamadi-agrebi-a-rades-fait-peau-neuve-photos/)
- [Published facility summary for the official and press tribunes](https://www.africatopsports.com/2019/01/25/tunisie-le-stade-de-rades-operationnel-en-fevrier/)
