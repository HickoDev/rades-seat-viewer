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
- a dark intermediate concourse articulated by repeated arched openings;
- radial light-concrete aisles, metal barriers, and framed vomitories;
- a long glazed honor/press frontage on one sideline;
- a cream tensile roof with a scalloped outer edge and a dense white inner space truss;
- tall external roof masts with cable stays and roof-edge floodlight arrays;
- red athletics surfacing, a warm concrete service apron, transparent team benches, white goal nets, and event-dependent pitch-side advertising hoardings;
- a cream ceremonial entrance with deep-blue arched glazing, blue trim, a yellow patterned band, and a taller central gateway.

Advertising artwork changes by competition and sponsor. The application therefore uses neutral Radès/Tunisia match-day graphics instead of claiming that one photographed sponsor layout is permanent.

## Configurable estimates

No public architectural plan or survey was located for the bowl section, honor suite envelope, roof opening, façade bays, or advertising-board offsets. Their dimensions live in `radesStadiumConfig.ts` and are explicitly classified as `estimate-requires-calibration`. Roof waves, truss depth, mast positions, window bay counts, and ceremonial entrance dimensions were calibrated visually against the sources below.

## Reference set

- [SBF supporting-structure project](https://sbf.com.tn/en/the-supporting-structure-of-the-olympic-stadium/)
- [Wikimedia Commons Radès stadium archive](https://commons.wikimedia.org/wiki/Category:Rad%C3%A8s_stadium)
- [2017 interior photograph](https://commons.wikimedia.org/wiki/File:Stade_de_Rad%C3%A9s_2017_1.jpg)
- [Europlan interior photographs](https://www.europlan-online.de/stade-olympique-de-rad%EF%BF%BDs/stadion-6370.html)
- [Mosaïque FM empty-bowl/virage photograph](https://www.mosaiquefm.net/fr/football/1138703/est-zamalek-les-virages-du-stade-de-rades-ouverts)
- [Mosaïque FM 2024 renovation gallery](https://www.mosaiquefm.net/fr/album/19094/le-stade-de-rades-fait-peau-neuve-a-l-occasion-du-clasico)
- [Hammadi Agrebi renovation photographs](https://realites.com.tn/fr/le-stade-hamadi-agrebi-a-rades-fait-peau-neuve-photos/)
- [Published facility summary for the official and press tribunes](https://www.africatopsports.com/2019/01/25/tunisie-le-stade-de-rades-operationnel-en-fevrier/)
