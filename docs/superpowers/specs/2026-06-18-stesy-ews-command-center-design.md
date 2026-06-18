# STESY EWS Command Center — Design

**Date:** 2026-06-18
**Status:** Approved (pending final spec review)
**Author:** Beacon Engineering / Claude

## 1. Summary

Port the standalone `allinone` "STESY Command Center" (a Svelte 5 + Vite SPA, currently
themed for hydrology / water-resources) into the `beacon-compro` SvelteKit 2 site as a
**new, self-contained demo section** focused on **disaster management and early warning
(kebencanaan & EWS)**.

The result is a live, simulated mission-control demo living at `/demo/ews`, alongside —
and not replacing — the existing `/demo/dashboard` (Tulang Bawang) demo. It pairs with the
EWS presentation deck already at `/presentasi/ews` (the deck explains the product; this is
the interactive demo).

## 2. Decisions (locked)

| Topic | Decision |
| --- | --- |
| Relationship to existing demo | **New separate section.** Leave `/demo/dashboard` (Tulang Bawang) and `/presentasi/*` untouched. |
| Hazard scope | **Flood EWS core + secondary hazards** (landslide module + earthquake feed). |
| Features | All four: **videowall mode, AI chatbot, CCTV carousel, asset detail drill-down**. |
| Design language | **Beacon Engineering Design System** — navy `#1C1C41` / brass `#C8A878` / signal blue `#3E8BFF` (same tokens as the EWS deck). |
| Architecture | **Native SvelteKit port** (components move ~1:1; custom router dropped for SvelteKit routing; chatbot server → `+server.ts`). |
| Product name | **STESY** (keep the allinone name). |
| AI backend | **OpenAI**, ported as-is into a SvelteKit API route (adds the `openai` dependency). |
| Theme | **Dark + light toggle** for dashboard; videowall forced dark. |
| Access | **Demo login gate** (any credentials work). |
| Geography | Seeded around **Yogyakarta (DIY)**: Kali Code / Gajah Wong / Winongo / Opak (flood), Kali Boyong–Gendol–Kuning (Merapi lahar), Kulon Progo / Gunungkidul (landslide). |

## 3. Source & target context

**Source — `/Users/tessa/Documents/allinone`:** Svelte 5 (runes) + Vite SPA. ~40 components
across `ui/ layout/ map/ cctv/ chat/ modules/ views/ panels/ icons/`. Custom history-API
router, Svelte stores + a live simulation engine (`stores.ts`, `seed.ts`), Leaflet + CARTO
maps, hand-rolled SVG charts (no chart lib), an Express-ish Node server exposing
`POST /api/chat` to OpenAI. Tailwind v4, Geist fonts.

**Target — `/Users/tessa/Documents/beacon-compro`:** SvelteKit 2.57 + Svelte 5.55 (runes),
Vite 8, Tailwind 4, `adapter-node`, TypeScript strict. Already depends on `leaflet@1.9.4`
and `@lucide/svelte` — the two libraries the port needs. **Does not** currently depend on
`openai`, and has **no test runner** (only `svelte-check`). The `/demo` shell already hides
the marketing Header/Footer via the root layout (`pathname.startsWith('/demo')`).

**Material — `/Users/tessa/Downloads/BPBD`:** The 4-level Siaga alert ladder mockup
(`slide11.html`: live TMA gauge, 12h trend, rise-rate, ETA-to-next-level), hardware station
photos (`station-full/siren/tech.png`), `system-diagram.png`, `logo-be.png`, and the Beacon
Engineering design-system tokens (`colors_and_type.css`). These are the disaster/EWS content
and branding source.

## 4. Routing & isolation

New route tree under `src/routes/demo/ews/`:

```
demo/ews/
  +layout@.svelte         # LAYOUT RESET — resets to root layout (skips /demo's .demo-deck
                          #   + demo-dashboard theme), so STESY gets a clean shell. URL still
                          #   starts with /demo, so root layout hides Header/Footer.
  +layout.svelte          # STESY shell: theme provider, login guard, TopBar + TabNav (hidden
                          #   on /wall), starts the simulation client-side. Loads Montserrat.
  +page.svelte            # redirect -> ringkasan
  login/+page.svelte      # faux login (any credentials -> set demo auth flag -> goto ringkasan)
  ringkasan/+page.svelte
  peringatan-dini/+page.svelte
  longsor/+page.svelte
  diseminasi/+page.svelte
  evakuasi/+page.svelte
  analisa/+page.svelte
  wall/+page.svelte       # videowall (full-bleed, no chrome, forced dark)
  [kind]/[id]/+page.svelte# asset detail drill-down (two segments — no clash with the
                          #   single-segment module routes above)
  api/chat/+server.ts     # OpenAI proxy (POST)
```

**Isolation:** `+layout@.svelte` (the `@` resets layout inheritance to root) is the key
mechanism — it keeps STESY out of `/demo/+layout`'s `.demo-deck` wrapper and demo-dashboard
theme, preventing style bleed, while the `/demo` URL prefix still triggers the root layout's
Header/Footer skip. The STESY shell additionally scopes all its CSS tokens under a root class
(e.g. `.stesy`) as defense-in-depth.

**Navigation:** the custom `router.ts` is dropped. TopBar tabs, map-marker clicks, and the
dashboard↔wall mode switch all use SvelteKit `goto()`. Mode is derived from the pathname
(`/wall` ⇒ videowall chrome-less mode), mirroring allinone's `App.svelte` mode logic.

## 5. Library code layout

Ported supporting code → `src/lib/ews/`:

```
lib/ews/
  types.ts        # domain model (see §7), adapted for disaster/EWS
  stores.ts       # global stores + live simulation engine (browser-guarded)
  status.ts       # Siaga level constants + helpers (Normal/Waspada/Siaga/Awas)
  format.ts       # id-ID number/date formatting
  series.ts       # time-series helpers
  config/nav.ts   # the 6 module tabs
  instruments.ts  # sensor-type -> icon map
  theme.ts        # dark/light store (dashboard only; wall pinned dark)
  data/
    seed.ts       # mock dataset around Cimanuk/Sumedang
    derive.ts     # status derivation per asset type
    geojson.ts    # basin/district boundary loader
```

Ported components → `src/lib/components/ews/` mirroring allinone's structure: `ui/`
(Panel, KpiCard, Gauge, LevelBar, Sparkline, MiniChart, WallDonut, ScatterPlot, StatusBadge,
Delta, Clock, Button, LogoutModal), `layout/` (TopBar, TabNav, Logo, Emblem), `map/`
(BasinMap, MapLegend, WallMapControls — Leaflet, browser-only), `cctv/` (CctvPanel,
WallCctvPanel, CameraTile), `chat/` (InteractiveChatbot, WallChatbot + a small browser chat
client), `modules/` (the 6 modules below), `views/` (WallView, WallUnavailable,
AssetDetailPage, LoginView), `panels/` (AlertPanel, DetailDrawer, InstrumentCard), `icons/`.

**Dropped from the port:** `router.ts` (→ SvelteKit routing), `server/index.js` +
`chatRuntime.js` (→ `api/chat/+server.ts`), `analytics.ts`, `voiceCommand.js` (out of scope),
and the dam-specific geojson loaders/datasets (replaced by the basin boundary in §7).

## 6. Module structure (content)

Six modules replace the six hydrology modules 1:1.

| # | Route | Module | Content |
| --- | --- | --- | --- |
| 1 | `ringkasan` | **Ringkasan** | Overall Siaga status, alert feed, map summary, KPI tiles (active stations, highest Siaga, population at risk, sirens armed) + a BMKG-style **earthquake feed** strip. |
| 2 | `peringatan-dini` | **Peringatan Dini Banjir** | TMA water-level stations on the **4-level Siaga ladder**; rainfall (ARR) stations; live gauge + 12h trend + rise-rate + **ETA-to-next-Siaga** (per `slide11.html`); threshold markers. |
| 3 | `longsor` | **Longsor** | Landslide EWS (secondary hazard): slope sensors (extensometer/tiltmeter), rainfall-accumulation thresholds, risk-zone status. |
| 4 | `diseminasi` | **Diseminasi & Sirine** | Siren network status, notification channels (siren / WA / SMS / push / Telegram), broadcast log. |
| 5 | `evakuasi` | **Evakuasi & Dampak** | Affected areas, shelters, evacuation routes, flood pumps & embankments (O&P), population & infrastructure at risk. |
| 6 | `analisa` | **Analisa & Prediksi** | Trends, rainfall-vs-water-level correlation, flood forecast, seasonal patterns. |

## 7. Data model & simulation

**Types (`types.ts`)** — adapt allinone's domain model for disaster/EWS:

- `Pos` (monitoring station): water-level (TMA) and rainfall (ARR) variants, each with the
  four Siaga thresholds (Normal / Waspada / Siaga / Awas), current value, 48-point history.
- `LandslideSensor`: extensometer/tiltmeter reading + rolling rainfall accumulation vs threshold.
- `SirenNode` / `Channel`: dissemination assets and their armed/active status.
- `Shelter`, `EvacRoute`, `AffectedArea`: evacuation & impact entities.
- `Earthquake`: BMKG-style feed event (time, magnitude, depth, location).
- `Pump`, `Embankment` (O&P): retained for flood-impact module.
- `AlertItem`: threshold-crossing / Siaga-escalation events.

**Simulation (`stores.ts` + `seed.ts`)** — keep allinone's live-drift engine: a clock store
ticks ~4s; derived data regenerates from the clock; 48-point histories shift; status is
re-derived; alerts are generated on threshold crossings and Siaga escalation. **Browser-only**
— started in `onMount`/under a `browser` guard so SSR never touches `window`/timers.

**Seed geography:** stations placed around **Yogyakarta (DIY)** — flood/water-level on Kali
Code, Gajah Wong, Winongo and Opak; lahar stations on Kali Boyong, Gendol and Kuning (Merapi);
landslide sensors in Kulon Progo (Menoreh) and Gunungkidul; sirens along Kali Code; shelters
and evacuation routes in Sleman (Merapi) and Bantul; a faultline/seismic context for the
earthquake feed (Opak fault). A DIY administrative-boundary **GeoJSON** (province or
Yogyakarta-city + Sleman/Bantul) is placed in `static/demo/ews/`; sourced from a public
dataset (see §12), with a hand-made stand-in polygon only as a last resort.

## 8. Design system & assets

- `src/lib/components/ews/theme.css` adapts the Beacon Engineering DS tokens, scoped under
  `.stesy`. **Siaga → color:** Normal → green `#1F8A5C`, Waspada → amber `#C77A1B`,
  Siaga → orange `#E08A3C`, Awas → red `#B5322C`; brass `#C8A878` accents; signal blue `#3E8BFF` for
  data strokes. Light-mode token set for the dashboard; wall view pinned to the dark set.
- **Fonts:** Montserrat (UI) + JetBrains Mono (data values — already loaded in the `/demo`
  font link; Montserrat added in the STESY layout head).
- **Assets** copied to `static/demo/ews/`: `station-full.png`, `station-siren.png`,
  `station-tech.png`, `system-diagram.png`, `logo-be.png` (from `/Users/tessa/Downloads/BPBD/img/`).
  Station photos double as CCTV placeholder tiles and detail-page imagery.
- **CCTV** themed to the scenario: Pos Tomo, Pos Tolengas, Bendungan Karedok spillway, sirine
  tower, titik evakuasi — each tile backed by a station photo.

## 9. AI chatbot (OpenAI)

Port `server/index.js` + `chatRuntime.js` logic into `src/routes/demo/ews/api/chat/+server.ts`
(`POST`). It reads `OPENAI_API_KEY` (and optional `OPENAI_MODEL`) from `$env/dynamic/private`,
builds a system prompt from live demo context (active-alert count, overall Siaga, top alerts),
and calls the OpenAI SDK. The system prompt is rewritten for the disaster/EWS domain (Siaga
levels, stations, dissemination, evacuation). Adds `openai` as a runtime dependency. The chat
UI degrades gracefully (shows a friendly notice) when the key is absent, so the rest of the
demo works without it.

## 10. Scope & non-goals

**In scope:** the six modules, videowall, asset detail, CCTV, login gate, OpenAI chat,
mock live simulation, BE-DS theming, the seeded Cimanuk/Sumedang dataset.

**Non-goals:**
- No real telemetry / backend integration — simulation only.
- No real authentication — the login gate is cosmetic.
- Videowall is desktop-only (≥1024px), as in allinone (`WallUnavailable` below that).
- **No changes** to existing `/demo/dashboard` (Tulang Bawang) or `/presentasi/*`.
- Out: voice commands, page-view analytics (dropped from the port).

## 11. Testing & verification

beacon-compro has no test runner today. The plan:

- Add **vitest** as a devDependency and port allinone's **pure-helper unit tests** — status
  derivation (`derive.ts`/`status.ts`), formatting (`format.ts`), series helpers, and the new
  **ETA-to-next-Siaga** calculation. These are pure functions and cheap to test.
- Run `npm run check` (svelte-check / typecheck) as a gate.
- Manual verification by running the app: login → each module → wall mode → a detail
  drill-down → chatbot (with and without `OPENAI_API_KEY`) → light/dark toggle.

## 12. Open implementation notes

- Confirm the root layout's `/demo` Header/Footer skip behaves as expected for `/demo/ews/*`
  (it should, being a prefix match) and that the `+layout@.svelte` reset composes cleanly.
- Source the **Yogyakarta (DIY)** boundary GeoJSON from a public dataset (e.g. the
  `superpikar/indonesia-geojson` / GADM-derived Indonesian province boundaries), simplify if
  large, and place it in `static/demo/ews/`. Hand-made stand-in only if none is reachable.
- Verify Leaflet usage is fully browser-guarded under SSR (the existing `TulangBawangMap`
  pattern in the repo is the reference).
