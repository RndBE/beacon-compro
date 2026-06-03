# Demo Executive Dashboard — Design Spec

**Date:** 2026-06-03
**Status:** Approved (design), pending implementation plan
**Owner:** Beacon / RndBE

## Goal

Realize the slide-14 "Command Center & Executive Dashboard" mockup from the
`infrastruktur-air` presentation deck into a navigable **dummy dashboard** inside
the beacon-compro SvelteKit site. The dashboard must look near-identical to slide
14 and add "real dashboard" features: a dummy login gate, a sidebar, and multiple
pages. All data stays dummy/animated — there is no backend.

## Source of truth (the mockup)

Slide 14 lives in `src/lib/presentasi/infrastruktur-air/index.html` as inlined
React/Babel. The relevant components and their dummy data:

- `CommandCenter` (index.html:6208) — top-level layout for slide 14.
- `CcTopBar` (index.html:5965) — SYSTEM ONLINE banner, sensor count (42/44),
  last sync, active alarms (1), 24h notifications (186), 30d uptime (99.6%), live
  clock (updates every second), date "16 Mei 2026".
- `CcKpis` (index.html:6009) — 5 KPI cards: Sites Online 42/44, Curah Hujan 24h
  421mm, Pompa Aktif 5/6, Alarm Aktif 1 (flickering), AI Confidence 94%.
- `CcMap` (index.html:6043) — Indonesia GeoJSON map with 15 live site nodes
  (`CC_SITES`), status colors normal/siaga/awas (#46D78F / #FFB454 / #FF7A66),
  pulsing rings on non-OK sites, dashed connection web, graticule, corner
  crosshairs, legend. Projection bounds `CC_GEO_BOUNDS`, helpers `ccProject` /
  `ccFeatureToPath` / `ccLoadGeo`.
- `AWLRChart` (index.html:5492) — water-level time series (60 pts, drifts every
  1.5s), siaga 3.0 / awas 3.8 threshold lines, current value dot with pulse.
- `RainfallBars` (index.html:5603) — 24-bar hourly rainfall, color by intensity,
  drifts every 2s, Σ24h sum.
- `PumpGrid` (index.html:5691) — 6 pumps/gates (`PUMPS`), status dots, flow,
  blink "live" dot every 2.2s.
- `WQPanel` / `WQGauge` (index.html:5799 / 5773) — 4 circular gauges: pH 7.2,
  DO 6.8, TSS 42, COND 320, 70% arc, ok-range coloring.
- `AlertFeed` (index.html:5734) — alert stream (`ALERTS_SEED`), severity dots,
  WhatsApp/SMS/Telegram label, LIVE badge.
- `CcAIInsight` (index.html:6169) — ARGO AI ticker, 3 rotating messages (every
  5.2s), 94% confidence.

Dark palette + card styling: `.cmdctr-deck` scope (index.html:3863) overrides the
otherwise-light `:root` (index.html:23). Key dark values to port:

```
--surface: rgba(255,255,255,0.04);  --surface-2: rgba(255,255,255,0.025);
--surface-3: rgba(255,255,255,0.06);
--line: rgba(120,160,220,0.16);     --line-soft: rgba(120,160,220,0.10);
--ink: #EAF1FB;  --ink-2: #C9D5EC;  --ink-soft: #93A5C7;  --ink-mute: #7388AC;
--brand: #0B3A82; --brand-2: #2876E8; --water: #1FA5C7;
--green: #46D78F; --amber: #FFB454; --danger: #FF7A66;
deck bg: radial glows over linear-gradient(180deg,#0B1B3A,#07112A);
card: linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.015)),
      border rgba(120,160,220,.18), backdrop-filter blur(8px);
fonts: --font-sans "Plus Jakarta Sans"; --font-mono "JetBrains Mono".
```

The deck is served raw at `/presentasi/infrastruktur-air` by
`src/routes/presentasi/[slug]/+server.ts`; the GeoJSON asset is at
`static/presentasi/infrastruktur-air/indonesia.geojson`.

## Decisions (from brainstorming)

- **Tech approach:** Native SvelteKit + Tailwind rebuild (NOT reuse of the React
  mockup, NOT iframe). Consistent with the site, extensible.
- **Route base:** custom `/demo/dashboard` (and `/demo/login`).
- **Extra features:** sidebar + multi-page navigation, dummy login. (Per-site
  drill-down and time-range filters were NOT selected — out of scope for v1.)

## Route structure

```
/demo/login                   → dummy login (dark, Beacon-branded)
/demo/dashboard               → Overview / Command Center (slide-14 replica)
/demo/dashboard/sites         → Jaringan Sites (table of all sites + search + map)
/demo/dashboard/hidrologi     → AWLR water level + rainfall (full charts)
/demo/dashboard/perangkat     → pumps & gates grid + device status
/demo/dashboard/kualitas-air  → water quality gauges + trend
/demo/dashboard/notifikasi    → alert feed (full)
/demo/dashboard/argo          → ARGO AI insight / recommendations
/demo/dashboard/laporan       → styled "coming soon" stub
/demo/dashboard/pengaturan    → styled "coming soon" stub
```

## Layout isolation

All `/demo/*` routes must NOT render the marketing chrome. In
`src/routes/+layout.svelte`, wrap `<Header>`, `<Footer>`, `<WhatsAppFloat>`,
`<Chatbot>` (and the skip-link) in a condition `!$page.url.pathname.startsWith('/demo')`.
This is a small, low-risk change; no route restructuring. The existing
`+layout.server.ts` data (solutions, latestArticle) still loads but is unused on
`/demo` — acceptable.

`/demo` gets its own dark full-screen shell via `src/routes/demo/+layout.svelte`
(theme + reset), and the authenticated area via
`src/routes/demo/dashboard/+layout.svelte` (sidebar + topbar wrapping the page).

## Dummy authentication (cosmetic only)

- `src/routes/demo/login/+page.svelte`: dark form, email + password prefilled with
  demo credentials, helper text "Demo — masuk dengan kredensial apa pun".
- Login uses a **SvelteKit form action** (`+page.server.ts`, default action) so it
  works without JS: it sets cookie `demo_auth=1` (path `/`, not HttpOnly) and
  `redirect(303, '/demo/dashboard')`. No password validation.
- `src/routes/demo/dashboard/+layout.server.ts`: if `demo_auth` cookie absent →
  `redirect(303, '/demo/login')`.
- "Keluar" is a form action (in the dashboard layout's `+layout.server.ts` or a
  small `/demo/logout` action) that deletes the cookie and redirects to
  `/demo/login`.
- Explicitly NOT real auth — no password check, no user store.

## App shell

- **Sidebar** (`Sidebar.svelte`): dark, Beacon logo, menu items (icon + label) for
  the routes above, active-route highlight, alarm-count badge, "Keluar" at bottom,
  collapsible on small screens.
- **Topbar** (`TopBar.svelte`): port of `CcTopBar` — SYSTEM ONLINE pulse, sensor
  active, last sync, alarm (danger tone), 24h notifications, 30d uptime (ok tone),
  live clock updating every second.

## Component architecture

New folder `src/lib/components/demo-dashboard/`:

| File | Purpose |
|------|---------|
| `Sidebar.svelte` | left nav |
| `TopBar.svelte` | top status bar + live clock |
| `KpiRow.svelte` | 5 KPI cards (`CcKpis`) |
| `NationalMap.svelte` | Indonesia SVG map + live nodes (`CcMap`) |
| `AwlrChart.svelte` | water-level time series (`AWLRChart`) |
| `RainfallBars.svelte` | rainfall bars (`RainfallBars`) |
| `PumpGrid.svelte` | pump/gate grid (`PumpGrid`) |
| `WqPanel.svelte` + `WqGauge.svelte` | water-quality gauges |
| `AlertFeed.svelte` | alert stream (`AlertFeed`) |
| `AiInsight.svelte` | ARGO ticker (`CcAIInsight`) |
| `Card.svelte` | shared dark card wrapper + header/pill primitives |
| `data.ts` | single source of dummy data (CC_SITES, PUMPS, ALERTS, WQ, KPIs) + geo projection helpers (`project`, `featureToPath`, `loadGeo`, bounds) |
| `tick.ts` | shared interval store(s) replacing React `useTick`/`setInterval`; data-drift helpers |
| `theme.css` | dark palette CSS variables scoped to `.demo-deck` |

Each widget is self-contained: takes optional props (e.g. `compact`), reads dummy
data from `data.ts`, animates via `tick.ts`. Charts/map use inline SVG (no chart
lib), matching the mockup exactly.

## Map rendering

Port the mockup's SVG projection (`ccProject`/`ccFeatureToPath`/`ccLoadGeo`) into
`data.ts`, fetching `indonesia.geojson`. To keep the demo self-contained, copy the
GeoJSON to `static/demo/indonesia.geojson` and fetch from `/demo/indonesia.geojson`.
Leaflet (already a dependency) is rejected: tiled map ≠ the dark glow aesthetic.

## Live animation

A small set of Svelte stores in `tick.ts` driven by `setInterval` (started in
`onMount`, cleared on destroy): a 1s clock tick, and data-drift ticks (~1.5s AWLR,
~2s rainfall, ~2.2s pumps, ~5.2s AI ticker) mirroring the mockup intervals. SSR
renders the seeded initial state; animation begins on the client.

## Per-page content (v1)

- **Overview** — full slide-14 replica (TopBar via shell + KpiRow + NationalMap +
  AwlrChart + RainfallBars + PumpGrid + WqPanel + AiInsight).
- **Sites** — searchable table of all `CC_SITES` (id, name, status, last value) +
  the NationalMap. (No per-site drill-down page in v1.)
- **Hidrologi** — larger AwlrChart + RainfallBars (full, non-compact).
- **Perangkat** — full PumpGrid + device status list.
- **Kualitas Air** — WqPanel gauges (full) + a simple trend.
- **Notifikasi** — full AlertFeed.
- **ARGO** — AI insight list/recommendations (expanded `CcAIInsight` content).
- **Laporan**, **Pengaturan** — styled "coming soon" stubs.

## Out of scope (v1)

- Real authentication / user accounts.
- Per-site drill-down pages.
- Time-range / region filters that recompute data.
- Real data sources, websockets, or persistence.
- i18n strings (dashboard ships Indonesian-only, matching the mockup).

## Success criteria

1. Visiting `/demo/dashboard` without the cookie redirects to `/demo/login`.
2. Submitting the login form lands on `/demo/dashboard` showing a dark Command
   Center visually matching slide 14 (KPIs, live map, charts, panels, AI ticker).
3. Clock and widgets animate live; alarm site pulses on the map.
4. Sidebar navigates between all listed pages; active item highlighted.
5. Marketing Header/Footer never appear on `/demo/*`; the rest of the site is
   unaffected.
6. "Keluar" returns to the login screen.
