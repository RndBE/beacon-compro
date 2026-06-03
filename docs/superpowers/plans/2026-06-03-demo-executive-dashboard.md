# Demo Executive Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a navigable dummy "Executive Dashboard / Command Center" under `/demo` that visually replicates slide 14 of the `infrastruktur-air` deck, with a dummy login, a sidebar, a live topbar, and multiple pages — all native SvelteKit + Tailwind v4 + Svelte 5 runes.

**Architecture:** A self-contained `/demo` route tree isolated from the marketing chrome. `/demo/login` sets a cosmetic cookie via a form action; `/demo/dashboard/*` is guarded by a server load that redirects when the cookie is absent. The dashboard area disables SSR (`ssr = false`) so the animated, time/random-driven widgets need no hydration guards. All widgets are ported from the deck's React/Babel components into Svelte 5 components under `src/lib/components/demo-dashboard/`, sharing one dummy-data module, one animation-helpers module, and one global dark stylesheet.

**Tech Stack:** SvelteKit 2.57, Svelte 5 (runes), Tailwind v4, TypeScript, `@lucide/svelte` icons. Inline SVG for charts/map (no chart library). GeoJSON served from `static/demo/`.

**Testing approach:** This repo has **no test runner** (only `svelte-check` and `vite build`). This feature is a visual, animated dummy UI; unit-testing animated SVG would be low value and would require introducing test infrastructure the user did not request. Therefore each task's automated gate is **`npm run check`** (svelte-check: 0 errors) plus, for UI tasks, a **manual visual check** via `npm run dev`. A final task runs `npm run build` and a full visual walkthrough. Commit after every task.

**Reference source (read-only):** `src/lib/presentasi/infrastruktur-air/index.html` — slide 14 components: `CommandCenter` (index.html:6208), `CcTopBar` (5965), `CcKpis` (6009), `CcMap` (6043), `CcAIInsight` (6169); shared widgets `AWLRChart` (5492), `RainfallBars` (5603), `PumpGrid`/`PUMPS` (5683), `WQPanel`/`WQGauge` (5773), `AlertFeed`/`ALERTS_SEED` (5728). Dark palette + cc-* CSS at index.html:3863–4191.

---

## File Structure

**Created — components (`src/lib/components/demo-dashboard/`):**
- `theme.css` — complete global dark stylesheet scoped under `.demo-deck` (palette, base card/pill/status-dot, app shell, sidebar, topbar, KPIs, map, AI ribbon, login, page chrome, table, stub).
- `data.ts` — dummy data (`CC_SITES`, `PUMPS`, `ALERTS_SEED`, `WQ_GAUGES`, `KPIS`, `AI_MESSAGES`), `NAV` config, types, and geo helpers (`project`, `featureToPath`, `loadGeo`, `GEO_BOUNDS`, `GEO_URL`).
- `tick.ts` — pure animation helpers (`seedAwlr`, `driftAwlr`, `seedRainfall`, `nextRainfall`).
- `TopBar.svelte`, `Sidebar.svelte` — app shell chrome.
- `KpiRow.svelte`, `NationalMap.svelte`, `AwlrChart.svelte`, `RainfallBars.svelte`, `PumpGrid.svelte`, `WqGauge.svelte`, `WqPanel.svelte`, `AlertFeed.svelte`, `AiInsight.svelte` — widgets.
- `PageHead.svelte` — small reusable page-title header for secondary pages.

**Created — routes (`src/routes/demo/`):**
- `+layout.svelte` — theme wrapper + fonts (`.demo-deck`).
- `login/+page.svelte`, `login/+page.server.ts` — dummy login + action.
- `logout/+server.ts` — clears cookie, redirects.
- `dashboard/+layout.ts` — `ssr = false`.
- `dashboard/+layout.server.ts` — auth guard.
- `dashboard/+layout.svelte` — sidebar + topbar shell.
- `dashboard/+page.svelte` — Overview (command center).
- `dashboard/sites/+page.svelte`, `dashboard/hidrologi/+page.svelte`, `dashboard/perangkat/+page.svelte`, `dashboard/kualitas-air/+page.svelte`, `dashboard/notifikasi/+page.svelte`, `dashboard/argo/+page.svelte`, `dashboard/laporan/+page.svelte`, `dashboard/pengaturan/+page.svelte`.

**Created — static:**
- `static/demo/indonesia.geojson` — copy of the deck's geojson.

**Modified:**
- `src/routes/+layout.svelte` — hide marketing Header/Footer/WhatsApp/Chatbot on `/demo/*`.

---

## Task 1: Foundation — geojson asset, data, tick, theme, layout isolation

**Files:**
- Create: `static/demo/indonesia.geojson` (copy)
- Create: `src/lib/components/demo-dashboard/data.ts`
- Create: `src/lib/components/demo-dashboard/tick.ts`
- Create: `src/lib/components/demo-dashboard/theme.css`
- Modify: `src/routes/+layout.svelte`

- [ ] **Step 1: Copy the GeoJSON asset**

Run:
```bash
mkdir -p static/demo && cp static/presentasi/infrastruktur-air/indonesia.geojson static/demo/indonesia.geojson && ls -l static/demo/indonesia.geojson
```
Expected: file exists, ~290–300 KB.

- [ ] **Step 2: Create `src/lib/components/demo-dashboard/data.ts`**

```ts
// Dummy data + geo helpers for the demo executive dashboard.
// Ported verbatim from slide 14 of the infrastruktur-air deck.

export type SiteStatus = 'ok' | 'warn' | 'alarm';

export interface Site {
	id: string;
	name: string;
	lon: number;
	lat: number;
	s: SiteStatus;
}

export interface Pump {
	id: string;
	name: string;
	status: SiteStatus;
	flow: string;
}

export interface Alert {
	t: string;
	sev: SiteStatus;
	code: string;
	msg: string;
}

export interface WqGauge {
	label: string;
	value: string;
	unit: string;
	min: number;
	max: number;
	ok: [number, number];
}

export interface AiMessage {
	title: string;
	sub: string;
	bold: string;
}

export interface NavItem {
	href: string;
	label: string;
	icon: string;
	badge?: number;
}

export interface GeoPath {
	d: string;
	name: string;
}

export const CC_SITES: Site[] = [
	{ id: 'TBW-01', name: 'Tulang Bawang', lon: 105.5, lat: -4.4, s: 'alarm' },
	{ id: 'BKL-02', name: 'Bengkulu', lon: 102.3, lat: -3.8, s: 'ok' },
	{ id: 'JKT-04', name: 'DKI Jakarta', lon: 106.83, lat: -6.21, s: 'warn' },
	{ id: 'SMG-07', name: 'Semarang', lon: 110.42, lat: -6.99, s: 'ok' },
	{ id: 'SBY-09', name: 'Surabaya', lon: 112.75, lat: -7.25, s: 'ok' },
	{ id: 'DPS-12', name: 'Denpasar', lon: 115.22, lat: -8.67, s: 'ok' },
	{ id: 'PTK-03', name: 'Pontianak', lon: 109.33, lat: 0.03, s: 'ok' },
	{ id: 'BJM-05', name: 'Banjarmasin', lon: 114.59, lat: -3.32, s: 'warn' },
	{ id: 'BPN-08', name: 'Balikpapan', lon: 116.83, lat: -1.27, s: 'ok' },
	{ id: 'MKS-11', name: 'Makassar', lon: 119.43, lat: -5.13, s: 'ok' },
	{ id: 'MND-14', name: 'Manado', lon: 124.84, lat: 1.49, s: 'ok' },
	{ id: 'AMB-17', name: 'Ambon', lon: 128.18, lat: -3.7, s: 'ok' },
	{ id: 'JYP-21', name: 'Jayapura', lon: 140.72, lat: -2.53, s: 'ok' },
	{ id: 'PDG-22', name: 'Padang', lon: 100.36, lat: -0.95, s: 'ok' },
	{ id: 'MDN-23', name: 'Medan', lon: 98.67, lat: 3.59, s: 'ok' }
];

export const PUMPS: Pump[] = [
	{ id: 'P-01', name: 'Pompa Banjir Menggala', status: 'ok', flow: '240 L/s' },
	{ id: 'P-02', name: 'Pintu Air Banjar Margo', status: 'ok', flow: 'open 60%' },
	{ id: 'P-03', name: 'Pompa SPAM Tumijajar', status: 'ok', flow: '180 L/s' },
	{ id: 'P-04', name: 'Lift Pump Rawa Pitu', status: 'warn', flow: '95 L/s' },
	{ id: 'P-05', name: 'Pintu Air Penawar Aji', status: 'ok', flow: 'open 40%' },
	{ id: 'P-06', name: 'Pompa Industri UM-A', status: 'ok', flow: '320 L/s' }
];

export const ALERTS_SEED: Alert[] = [
	{ t: 'now', sev: 'alarm', code: 'WQ-03', msg: 'pH 5.1 di Rawajitu — di bawah ambang baku' },
	{ t: '2m', sev: 'warn', code: 'ARR-02', msg: 'Curah hujan 32 mm/h · Gedung Aji' },
	{ t: '8m', sev: 'warn', code: 'AWLR-02', msg: 'TMA naik 0.6 m dalam 30 menit' },
	{ t: '14m', sev: 'ok', code: 'P-04', msg: 'Lift pump Rawa Pitu normal kembali' }
];

export const WQ_GAUGES: WqGauge[] = [
	{ label: 'pH', value: '7.2', unit: '', min: 0, max: 14, ok: [6, 9] },
	{ label: 'DO', value: '6.8', unit: 'mg/L', min: 0, max: 12, ok: [4, 12] },
	{ label: 'TSS', value: '42', unit: 'mg/L', min: 0, max: 200, ok: [0, 100] },
	{ label: 'COND', value: '320', unit: 'µS', min: 0, max: 1000, ok: [0, 500] }
];

export const AI_MESSAGES: AiMessage[] = [
	{
		title: 'Lift Pump Rawa Pitu turun 21% — periksa mekanis dalam 24 jam',
		sub: 'Pola sama terjadi 3× sejak Februari · prediksi failure: 11–14 hari · ',
		bold: 'Prioritas Tinggi'
	},
	{
		title: 'Hujan ekstrem terprediksi Way Tulang Bawang (12–16 jam)',
		sub: 'Model ensemble 87% confidence · siapkan SOP banjir · ',
		bold: 'Siaga Banjir'
	},
	{
		title: 'Anomali pH di Rawajitu — kemungkinan kontaminasi industri',
		sub: 'Sampling otomatis dijadwalkan · investigasi lapangan disarankan · ',
		bold: 'Lapor BPBD'
	}
];

export const NAV: NavItem[] = [
	{ href: '/demo/dashboard', label: 'Overview', icon: 'LayoutDashboard' },
	{ href: '/demo/dashboard/sites', label: 'Jaringan Sites', icon: 'MapPin' },
	{ href: '/demo/dashboard/hidrologi', label: 'Hidrologi', icon: 'Waves' },
	{ href: '/demo/dashboard/perangkat', label: 'Perangkat', icon: 'Cpu' },
	{ href: '/demo/dashboard/kualitas-air', label: 'Kualitas Air', icon: 'FlaskConical' },
	{ href: '/demo/dashboard/notifikasi', label: 'Notifikasi', icon: 'Bell', badge: 1 },
	{ href: '/demo/dashboard/argo', label: 'ARGO AI', icon: 'Sparkles' },
	{ href: '/demo/dashboard/laporan', label: 'Laporan', icon: 'FileText' },
	{ href: '/demo/dashboard/pengaturan', label: 'Pengaturan', icon: 'Settings' }
];

/* ---- Geo projection (ported from CcMap) ---- */
export const GEO_BOUNDS = { lonMin: 94.5, lonMax: 141.5, latMin: -11.5, latMax: 7.0 };
export const GEO_URL = '/demo/indonesia.geojson';

export function project(lon: number, lat: number, vw: number, vh: number): [number, number] {
	const { lonMin, lonMax, latMin, latMax } = GEO_BOUNDS;
	const x = ((lon - lonMin) / (lonMax - lonMin)) * vw;
	const y = ((latMax - lat) / (latMax - latMin)) * vh;
	return [x, y];
}

interface GeoFeature {
	geometry?: { type: string; coordinates: number[][][] | number[][][][] };
	properties?: Record<string, unknown>;
}

export function featureToPath(feature: GeoFeature, vw: number, vh: number, minDist = 0.55): string {
	const g = feature.geometry;
	if (!g) return '';
	const polys =
		g.type === 'MultiPolygon'
			? (g.coordinates as number[][][][])
			: g.type === 'Polygon'
				? [g.coordinates as number[][][]]
				: [];
	let d = '';
	for (const poly of polys) {
		for (const ring of poly) {
			if (!ring.length) continue;
			let started = false;
			let px = 0;
			let py = 0;
			for (let i = 0; i < ring.length; i++) {
				const [lon, lat] = ring[i];
				const [x, y] = project(lon, lat, vw, vh);
				if (!started) {
					d += 'M' + x.toFixed(1) + ',' + y.toFixed(1);
					started = true;
					px = x;
					py = y;
					continue;
				}
				if (i === ring.length - 1 || Math.hypot(x - px, y - py) >= minDist) {
					d += 'L' + x.toFixed(1) + ',' + y.toFixed(1);
					px = x;
					py = y;
				}
			}
			d += 'Z';
		}
	}
	return d;
}

let _geoCache: { vw: number; vh: number; paths: GeoPath[] } | null = null;
let _geoPromise: Promise<{ features: GeoFeature[] } | null> | null = null;

export function loadGeo(vw: number, vh: number): Promise<GeoPath[] | null> {
	if (_geoCache && _geoCache.vw === vw && _geoCache.vh === vh) {
		return Promise.resolve(_geoCache.paths);
	}
	if (!_geoPromise) {
		_geoPromise = fetch(GEO_URL)
			.then((r) => (r.ok ? r.json() : Promise.reject(new Error('geo ' + r.status))))
			.catch((e) => {
				console.warn('[demo dashboard] geojson load failed:', e);
				_geoPromise = null;
				return null;
			});
	}
	return _geoPromise.then((geo) => {
		if (!geo) return null;
		const paths: GeoPath[] = geo.features.map((f) => ({
			d: featureToPath(f, vw, vh),
			name: (f.properties?.state as string) || (f.properties?.name as string) || ''
		}));
		_geoCache = { vw, vh, paths };
		return paths;
	});
}
```

- [ ] **Step 3: Create `src/lib/components/demo-dashboard/tick.ts`**

```ts
// Pure animation/data-drift helpers for the live demo widgets.
// Seeds are deterministic-ish; randomness only grows after mount (dashboard is ssr=false).

/** AWLR initial 60-point series (mirrors AWLRChart seed). */
export function seedAwlr(n: number): number[] {
	const base = 2.0;
	return Array.from({ length: n }, (_, i) => {
		const t = i / n;
		return base + 0.6 * Math.sin(t * 6) + 0.3 * Math.sin(t * 13) + 0.1 * Math.random();
	});
}

/** Next AWLR sample given the last one. */
export function driftAwlr(last: number): number {
	return Math.max(1.2, Math.min(4.2, last + (Math.random() - 0.45) * 0.12));
}

/** Rainfall initial 24-bar series (mirrors RainfallBars seed). */
export function seedRainfall(n: number): number[] {
	return Array.from({ length: n }, (_, i) => Math.max(0, 8 + 14 * Math.sin(i / 3) + 12 * Math.random() - 4));
}

/** Next rainfall bar value. */
export function nextRainfall(): number {
	return Math.max(0, 15 + 8 * Math.sin(Date.now() / 7000) + (Math.random() - 0.3) * 20);
}
```

- [ ] **Step 4: Create `src/lib/components/demo-dashboard/theme.css`**

```css
/* ============================================================
   Demo Executive Dashboard — dark theme (ported from slide 14)
   All rules scoped under .demo-deck so the marketing site is untouched.
   ============================================================ */
.demo-deck {
	/* palette (dark) */
	--surface: rgba(255, 255, 255, 0.04);
	--surface-2: rgba(255, 255, 255, 0.025);
	--surface-3: rgba(255, 255, 255, 0.06);
	--line: rgba(120, 160, 220, 0.16);
	--line-soft: rgba(120, 160, 220, 0.1);
	--ink: #eaf1fb;
	--ink-2: #c9d5ec;
	--ink-soft: #93a5c7;
	--ink-mute: #7388ac;
	--brand: #0b3a82;
	--brand-2: #2876e8;
	--water: #1fa5c7;
	--water-soft: rgba(52, 190, 220, 0.18);
	--green: #46d78f;
	--green-soft: rgba(40, 200, 130, 0.16);
	--amber: #ffb454;
	--amber-soft: rgba(232, 160, 50, 0.18);
	--danger: #ff7a66;
	--danger-soft: rgba(232, 86, 58, 0.2);
	--font-sans: 'Plus Jakarta Sans', 'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif;
	--font-mono: 'JetBrains Mono', 'IBM Plex Mono', ui-monospace, monospace;

	min-height: 100vh;
	color: var(--ink);
	font-family: var(--font-sans);
	background:
		radial-gradient(1100px 600px at 10% -10%, rgba(60, 130, 232, 0.22), transparent 60%),
		radial-gradient(900px 600px at 110% 110%, rgba(31, 165, 199, 0.18), transparent 60%),
		linear-gradient(180deg, #0b1b3a 0%, #07112a 100%);
	background-attachment: fixed;
}
.demo-deck *,
.demo-deck *::before,
.demo-deck *::after {
	box-sizing: border-box;
}

/* ---- base card / pill / status dot ---- */
.demo-deck .card {
	border-radius: 16px;
	padding: 22px;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.015) 100%);
	border: 1px solid rgba(120, 160, 220, 0.18);
	box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
	backdrop-filter: blur(8px);
}
.demo-deck .card-h {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 14px;
}
.demo-deck .label {
	font-family: var(--font-mono);
	font-size: 11px;
	font-weight: 700;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	color: var(--ink-mute);
}
.demo-deck .pill {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 5px 10px;
	border-radius: 999px;
	border: 1px solid rgba(120, 160, 220, 0.22);
	background: rgba(255, 255, 255, 0.05);
	color: var(--ink-2);
	font-family: var(--font-sans);
	font-size: 12px;
	font-weight: 600;
	white-space: nowrap;
}
.demo-deck .pill--green {
	color: #5ce0a0;
	background: rgba(40, 200, 130, 0.14);
	border-color: rgba(40, 200, 130, 0.32);
}
.demo-deck .pill--amber {
	color: #ffb454;
	background: rgba(232, 160, 50, 0.14);
	border-color: rgba(232, 160, 50, 0.34);
}
.demo-deck .pill--danger {
	color: #ff7a66;
	background: rgba(232, 86, 58, 0.16);
	border-color: rgba(232, 86, 58, 0.38);
}
.demo-deck .pill--water {
	color: #4fd4e8;
	background: rgba(52, 190, 220, 0.14);
	border-color: rgba(52, 190, 220, 0.34);
}
.demo-deck .status-dot {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	position: relative;
	flex: 0 0 auto;
	display: inline-block;
}
.demo-deck .status-dot::after {
	content: '';
	position: absolute;
	inset: -6px;
	border-radius: 50%;
	background: currentColor;
	opacity: 0.2;
	animation: demoStatusPulse 2.4s ease-out infinite;
}
.demo-deck .status-dot.ok {
	background: #46d78f;
	color: #46d78f;
}
.demo-deck .status-dot.warn {
	background: #ffb454;
	color: #ffb454;
}
.demo-deck .status-dot.alarm {
	background: #ff7a66;
	color: #ff7a66;
	animation: demoStatusBlink 1s ease infinite;
}
@keyframes demoStatusPulse {
	0% {
		transform: scale(0.6);
		opacity: 0.35;
	}
	100% {
		transform: scale(1.6);
		opacity: 0;
	}
}
@keyframes demoStatusBlink {
	50% {
		opacity: 0.4;
	}
}
.demo-deck .cmdctr-pulse {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: var(--danger);
	animation: demoPulse 1.8s ease-out infinite;
}
@keyframes demoPulse {
	0% {
		box-shadow: 0 0 0 0 rgba(193, 67, 43, 0.55);
	}
	70% {
		box-shadow: 0 0 0 10px rgba(193, 67, 43, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(193, 67, 43, 0);
	}
}

/* ---- app shell ---- */
.demo-app {
	display: flex;
	min-height: 100vh;
}
.demo-app__main {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	height: 100vh;
}
.demo-app__content {
	flex: 1;
	min-height: 0;
	overflow: auto;
	padding: 18px;
}

/* ---- sidebar ---- */
.demo-side {
	width: 248px;
	flex: 0 0 248px;
	display: flex;
	flex-direction: column;
	gap: 6px;
	padding: 18px 14px;
	border-right: 1px solid rgba(120, 160, 220, 0.16);
	background: rgba(7, 17, 42, 0.6);
	backdrop-filter: blur(8px);
	height: 100vh;
	position: sticky;
	top: 0;
}
.demo-side__brand {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 6px 10px 16px;
	font-family: var(--font-sans);
	font-weight: 800;
	font-size: 18px;
	letter-spacing: -0.01em;
	color: var(--ink);
}
.demo-side__brand img {
	height: 26px;
	width: auto;
}
.demo-side__nav {
	display: flex;
	flex-direction: column;
	gap: 2px;
	flex: 1;
	min-height: 0;
	overflow: auto;
}
.demo-side__item {
	display: flex;
	align-items: center;
	gap: 11px;
	padding: 10px 12px;
	border-radius: 10px;
	color: var(--ink-soft);
	font-size: 14px;
	font-weight: 600;
	text-decoration: none;
	border: 1px solid transparent;
	transition: background 0.15s, color 0.15s;
}
.demo-side__item:hover {
	background: rgba(255, 255, 255, 0.04);
	color: var(--ink);
}
.demo-side__item--active {
	background: linear-gradient(90deg, rgba(40, 118, 232, 0.22), rgba(40, 118, 232, 0.06));
	border-color: rgba(120, 160, 220, 0.28);
	color: #eaf1fb;
}
.demo-side__badge {
	margin-left: auto;
	min-width: 20px;
	height: 20px;
	padding: 0 6px;
	border-radius: 999px;
	background: var(--danger);
	color: #1a0b08;
	font-family: var(--font-mono);
	font-size: 11px;
	font-weight: 700;
	display: inline-flex;
	align-items: center;
	justify-content: center;
}
.demo-side__logout {
	margin-top: 6px;
}
.demo-side__logout button {
	width: 100%;
	display: flex;
	align-items: center;
	gap: 11px;
	padding: 10px 12px;
	border-radius: 10px;
	border: 1px solid rgba(120, 160, 220, 0.2);
	background: rgba(255, 255, 255, 0.03);
	color: var(--ink-soft);
	font-family: var(--font-sans);
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
}
.demo-side__logout button:hover {
	color: var(--danger);
	border-color: rgba(232, 86, 58, 0.4);
}

/* ---- topbar (ported cc-topbar) ---- */
.cc-topbar {
	display: flex;
	align-items: center;
	gap: 22px;
	padding: 12px 18px;
	margin: 18px 18px 0;
	border-radius: 14px;
	background: rgba(255, 255, 255, 0.035);
	border: 1px solid rgba(120, 160, 220, 0.18);
}
.cc-topbar__brand {
	display: inline-flex;
	align-items: center;
	gap: 10px;
	font-family: var(--font-mono);
	font-size: 13px;
	font-weight: 700;
	color: #eaf1fb;
	letter-spacing: 0.16em;
	text-transform: uppercase;
}
.cc-topbar__brand .cmdctr-pulse {
	background: #46d78f;
	animation-name: demoPulseGreen;
}
@keyframes demoPulseGreen {
	0% {
		box-shadow: 0 0 0 0 rgba(70, 215, 143, 0.55);
	}
	70% {
		box-shadow: 0 0 0 10px rgba(70, 215, 143, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(70, 215, 143, 0);
	}
}
.cc-topbar__div {
	width: 1px;
	height: 24px;
	background: rgba(120, 160, 220, 0.22);
}
.cc-topbar__kv {
	display: flex;
	flex-direction: column;
	gap: 1px;
}
.cc-topbar__kv-k {
	font-family: var(--font-mono);
	font-size: 10px;
	font-weight: 600;
	letter-spacing: 0.14em;
	text-transform: uppercase;
	color: #7388ac;
}
.cc-topbar__kv-v {
	font-family: var(--font-mono);
	font-size: 15px;
	font-weight: 600;
	color: #eaf1fb;
}
.cc-topbar__kv--danger .cc-topbar__kv-v {
	color: #ff7a66;
}
.cc-topbar__kv--ok .cc-topbar__kv-v {
	color: #46d78f;
}
.cc-topbar__clock {
	margin-left: auto;
	font-family: var(--font-mono);
	font-size: 13px;
	color: #93a5c7;
	letter-spacing: 0.06em;
}
.cc-topbar__clock b {
	color: #eaf1fb;
	font-weight: 700;
	margin-right: 8px;
}

/* ---- KPI strip ---- */
.cc-kpis {
	display: grid;
	grid-template-columns: repeat(5, minmax(0, 1fr));
	gap: 12px;
}
.cc-kpi {
	position: relative;
	padding: 14px 16px;
	border-radius: 14px;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.015) 100%);
	border: 1px solid rgba(120, 160, 220, 0.18);
	display: flex;
	flex-direction: column;
	gap: 6px;
	overflow: hidden;
}
.cc-kpi::after {
	content: '';
	position: absolute;
	inset: -1px auto -1px -1px;
	width: 3px;
	background: var(--cc-kpi-accent, #3cc3f2);
	opacity: 0.85;
	border-radius: 6px 0 0 6px;
}
.cc-kpi--danger {
	--cc-kpi-accent: #ff7a66;
}
.cc-kpi--ok {
	--cc-kpi-accent: #46d78f;
}
.cc-kpi--warn {
	--cc-kpi-accent: #ffb454;
}
.cc-kpi--ai {
	--cc-kpi-accent: #8b7cff;
}
.cc-kpi__label {
	font-family: var(--font-mono);
	font-size: 10px;
	font-weight: 700;
	letter-spacing: 0.16em;
	text-transform: uppercase;
	color: #93a5c7;
}
.cc-kpi__value {
	display: flex;
	align-items: baseline;
	gap: 6px;
	font-family: var(--font-mono);
	font-size: 28px;
	font-weight: 700;
	color: #eaf1fb;
	letter-spacing: -0.02em;
	line-height: 1;
}
.cc-kpi__value small {
	font-size: 14px;
	font-weight: 500;
	color: #7388ac;
}
.cc-kpi__delta {
	font-family: var(--font-mono);
	font-size: 11px;
	font-weight: 600;
	color: #93a5c7;
}
.cc-kpi__delta--up {
	color: #46d78f;
}
.cc-kpi__delta--down {
	color: #ff7a66;
}

/* ---- overview main grid ---- */
.cc-main {
	display: grid;
	grid-template-columns: 1.05fr 1.15fr 1fr;
	gap: 14px;
	min-height: 0;
}
.cc-col {
	display: flex;
	flex-direction: column;
	gap: 12px;
	min-height: 0;
}

/* ---- map ---- */
.cc-map {
	height: 100%;
	border-radius: 16px;
	border: 1px solid rgba(120, 160, 220, 0.18);
	background:
		radial-gradient(800px 400px at 30% 30%, rgba(60, 130, 232, 0.15), transparent 60%),
		linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%);
	padding: 16px 18px 14px;
	display: flex;
	flex-direction: column;
	gap: 10px;
	overflow: hidden;
}
.cc-map__head {
	display: flex;
	align-items: center;
	justify-content: space-between;
}
.cc-map__title {
	font-family: var(--font-mono);
	font-size: 11px;
	font-weight: 700;
	letter-spacing: 0.14em;
	text-transform: uppercase;
	color: #93a5c7;
}
.cc-map__sub {
	font-family: var(--font-mono);
	font-size: 12px;
	color: #7388ac;
}
.cc-map__viz {
	position: relative;
	flex: 1;
	min-height: 0;
}
.cc-map__legend {
	display: flex;
	gap: 14px;
	font-family: var(--font-mono);
	font-size: 10px;
	color: #93a5c7;
	letter-spacing: 0.08em;
	text-transform: uppercase;
}
.cc-map__legend span {
	display: inline-flex;
	align-items: center;
	gap: 6px;
}
.cc-map__legend i {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	display: inline-block;
}

/* ---- AI ribbon ---- */
.cc-ai {
	position: relative;
	display: flex;
	align-items: center;
	gap: 18px;
	padding: 14px 18px;
	border-radius: 16px;
	background:
		linear-gradient(90deg, rgba(140, 110, 255, 0.2) 0%, rgba(50, 130, 232, 0.12) 60%, transparent 100%),
		rgba(255, 255, 255, 0.035);
	border: 1px solid rgba(140, 110, 255, 0.28);
	overflow: hidden;
}
.cc-ai__badge {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 6px 12px;
	border-radius: 999px;
	font-family: var(--font-mono);
	font-size: 11px;
	font-weight: 700;
	letter-spacing: 0.16em;
	text-transform: uppercase;
	color: #c5b8ff;
	background: rgba(140, 110, 255, 0.18);
	border: 1px solid rgba(140, 110, 255, 0.42);
	flex: 0 0 auto;
}
.cc-ai__icon {
	width: 14px;
	height: 14px;
	border-radius: 3px;
	background: linear-gradient(135deg, #b7a6ff 0%, #7c68ff 100%);
	box-shadow: 0 0 12px rgba(140, 110, 255, 0.6);
}
.cc-ai__body {
	display: flex;
	flex-direction: column;
	gap: 2px;
	flex: 1;
	min-width: 0;
}
.cc-ai__title {
	font-family: var(--font-sans);
	font-size: 17px;
	font-weight: 700;
	color: #eaf1fb;
}
.cc-ai__sub {
	font-family: var(--font-mono);
	font-size: 12px;
	color: #93a5c7;
}
.cc-ai__sub b {
	color: #ffb454;
	font-weight: 700;
}
.cc-ai__conf {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 2px;
	flex: 0 0 auto;
	padding-left: 18px;
	border-left: 1px solid rgba(120, 160, 220, 0.22);
}
.cc-ai__conf-v {
	font-family: var(--font-mono);
	font-size: 24px;
	font-weight: 700;
	color: #eaf1fb;
}
.cc-ai__conf-l {
	font-family: var(--font-mono);
	font-size: 10px;
	font-weight: 600;
	letter-spacing: 0.14em;
	text-transform: uppercase;
	color: #93a5c7;
}

/* ---- login ---- */
.demo-login {
	min-height: 100vh;
	display: grid;
	place-items: center;
	padding: 24px;
}
.demo-login__card {
	width: 100%;
	max-width: 400px;
	padding: 32px;
	border-radius: 18px;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
	border: 1px solid rgba(120, 160, 220, 0.2);
	box-shadow: 0 30px 80px rgba(6, 15, 35, 0.4);
}
.demo-login__brand {
	display: flex;
	align-items: center;
	gap: 10px;
	font-weight: 800;
	font-size: 20px;
	margin-bottom: 4px;
}
.demo-login__brand img {
	height: 28px;
}
.demo-login__sub {
	color: var(--ink-soft);
	font-size: 13px;
	margin-bottom: 22px;
}
.demo-login__field {
	display: flex;
	flex-direction: column;
	gap: 6px;
	margin-bottom: 14px;
}
.demo-login__field label {
	font-family: var(--font-mono);
	font-size: 11px;
	font-weight: 600;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	color: var(--ink-mute);
}
.demo-login__field input {
	padding: 11px 13px;
	border-radius: 10px;
	border: 1px solid rgba(120, 160, 220, 0.25);
	background: rgba(7, 17, 42, 0.5);
	color: var(--ink);
	font-family: var(--font-mono);
	font-size: 14px;
}
.demo-login__field input:focus {
	outline: none;
	border-color: var(--brand-2);
}
.demo-login__btn {
	width: 100%;
	margin-top: 8px;
	padding: 12px;
	border-radius: 10px;
	border: none;
	background: linear-gradient(135deg, #2876e8, #1fa5c7);
	color: #fff;
	font-family: var(--font-sans);
	font-size: 15px;
	font-weight: 700;
	cursor: pointer;
}
.demo-login__btn:hover {
	filter: brightness(1.08);
}
.demo-login__hint {
	margin-top: 14px;
	text-align: center;
	font-family: var(--font-mono);
	font-size: 11px;
	color: var(--ink-mute);
}

/* ---- page chrome (secondary pages) ---- */
.demo-page {
	display: flex;
	flex-direction: column;
	gap: 14px;
}
.demo-page__head {
	display: flex;
	flex-direction: column;
	gap: 4px;
	margin-bottom: 2px;
}
.demo-page__title {
	font-size: 24px;
	font-weight: 800;
	letter-spacing: -0.02em;
	color: var(--ink);
	margin: 0;
}
.demo-page__sub {
	font-family: var(--font-mono);
	font-size: 13px;
	color: var(--ink-soft);
}
.demo-grid-2 {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 14px;
}

/* ---- table ---- */
.demo-table {
	width: 100%;
	border-collapse: collapse;
	font-size: 14px;
}
.demo-table th,
.demo-table td {
	text-align: left;
	padding: 10px 12px;
	border-bottom: 1px solid var(--line);
}
.demo-table th {
	font-family: var(--font-mono);
	font-size: 11px;
	font-weight: 700;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: var(--ink-mute);
}
.demo-table td {
	color: var(--ink-2);
}
.demo-table tr:hover td {
	background: rgba(255, 255, 255, 0.03);
}

/* ---- stub ---- */
.demo-stub {
	display: grid;
	place-items: center;
	gap: 10px;
	min-height: 60vh;
	text-align: center;
	color: var(--ink-soft);
}
.demo-stub h2 {
	font-size: 22px;
	font-weight: 800;
	color: var(--ink);
}

/* ---- responsive ---- */
@media (max-width: 1100px) {
	.cc-kpis {
		grid-template-columns: repeat(2, 1fr);
	}
	.cc-main {
		grid-template-columns: 1fr;
	}
	.demo-grid-2 {
		grid-template-columns: 1fr;
	}
}
@media (max-width: 760px) {
	.demo-side {
		display: none;
	}
}
```

- [ ] **Step 5: Modify `src/routes/+layout.svelte` to hide marketing chrome on `/demo/*`**

Replace the entire file with:

```svelte
<script lang="ts">
	import './layout.css';
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import WhatsAppFloat from '$lib/components/WhatsAppFloat.svelte';
	import Chatbot from '$lib/components/Chatbot.svelte';
	import { locale, translations as tr } from '$lib/i18n';

	let { children, data } = $props();

	let isDemo = $derived($page.url.pathname.startsWith('/demo'));
</script>

<svelte:head>
	<title>{tr['meta.home.title'][$locale]}</title>
</svelte:head>

{#if isDemo}
	{@render children()}
{:else}
	<div class="min-h-screen flex flex-col">
		<a href="#main-content" class="skip-link"
			>{$locale === 'EN' ? 'Skip to main content' : 'Lompat ke konten utama'}</a
		>
		<Header solutions={data.solutions} latestArticle={data.latestArticle} />
		<main id="main-content" tabindex="-1" class="flex-1">
			{@render children()}
		</main>
		<Footer solutions={data.solutions} />
		<WhatsAppFloat />
		<Chatbot />
	</div>
{/if}
```

- [ ] **Step 6: Verify types/build**

Run: `npm run check`
Expected: completes with **0 errors** (warnings about unrelated existing files are acceptable; no new errors referencing `demo-dashboard` or `+layout.svelte`).

- [ ] **Step 7: Commit**

```bash
git add static/demo/indonesia.geojson src/lib/components/demo-dashboard/data.ts src/lib/components/demo-dashboard/tick.ts src/lib/components/demo-dashboard/theme.css src/routes/+layout.svelte
git commit -m "feat(demo-dashboard): foundation — data, tick, theme, layout isolation"
```

---

## Task 2: Dummy auth + demo route skeleton

**Files:**
- Create: `src/routes/demo/+layout.svelte`
- Create: `src/routes/demo/login/+page.svelte`
- Create: `src/routes/demo/login/+page.server.ts`
- Create: `src/routes/demo/logout/+server.ts`
- Create: `src/routes/demo/dashboard/+layout.ts`
- Create: `src/routes/demo/dashboard/+layout.server.ts`
- Create: `src/routes/demo/dashboard/+layout.svelte` (temporary minimal shell)
- Create: `src/routes/demo/dashboard/+page.svelte` (temporary placeholder)

- [ ] **Step 1: Create `src/routes/demo/+layout.svelte`** (theme + fonts wrapper)

```svelte
<script lang="ts">
	import '$lib/components/demo-dashboard/theme.css';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="demo-deck">
	{@render children()}
</div>
```

- [ ] **Step 2: Create `src/routes/demo/login/+page.server.ts`** (form action sets cookie)

```ts
import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
	default: ({ cookies }) => {
		// Cosmetic only — no credential validation.
		cookies.set('demo_auth', '1', {
			path: '/',
			httpOnly: false,
			sameSite: 'lax',
			maxAge: 60 * 60 * 8
		});
		throw redirect(303, '/demo/dashboard');
	}
};
```

- [ ] **Step 3: Create `src/routes/demo/login/+page.svelte`**

```svelte
<script lang="ts">
	import logoBeacon from '$lib/assets/logo_be.png';
</script>

<svelte:head>
	<title>Masuk · Beacon Command Center</title>
</svelte:head>

<div class="demo-login">
	<form class="demo-login__card" method="POST">
		<div class="demo-login__brand">
			<img src={logoBeacon} alt="Beacon" />
			<span>Command Center</span>
		</div>
		<p class="demo-login__sub">Executive Dashboard · Infrastruktur Air Nasional</p>

		<div class="demo-login__field">
			<label for="email">Email</label>
			<input id="email" name="email" type="email" value="operator@beacon.id" autocomplete="username" />
		</div>
		<div class="demo-login__field">
			<label for="password">Password</label>
			<input
				id="password"
				name="password"
				type="password"
				value="demo1234"
				autocomplete="current-password"
			/>
		</div>

		<button class="demo-login__btn" type="submit">Masuk</button>
		<p class="demo-login__hint">Demo — masuk dengan kredensial apa pun</p>
	</form>
</div>
```

- [ ] **Step 4: Create `src/routes/demo/logout/+server.ts`**

```ts
import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const POST: RequestHandler = ({ cookies }) => {
	cookies.delete('demo_auth', { path: '/' });
	throw redirect(303, '/demo/login');
};
```

- [ ] **Step 5: Create `src/routes/demo/dashboard/+layout.ts`** (disable SSR for the app area)

```ts
// Animated, client-only dashboard — no SSR avoids hydration mismatch from
// time/random-driven widgets. Server load functions (auth guard) still run.
export const ssr = false;
```

- [ ] **Step 6: Create `src/routes/demo/dashboard/+layout.server.ts`** (auth guard)

```ts
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = ({ cookies }) => {
	if (!cookies.get('demo_auth')) {
		throw redirect(303, '/demo/login');
	}
	return {};
};
```

- [ ] **Step 7: Create `src/routes/demo/dashboard/+layout.svelte`** (temporary minimal shell)

```svelte
<script lang="ts">
	let { children } = $props();
</script>

<div class="demo-app">
	<aside class="demo-side">
		<div class="demo-side__brand"><span>Command Center</span></div>
		<form class="demo-side__logout" method="POST" action="/demo/logout">
			<button type="submit">Keluar</button>
		</form>
	</aside>
	<div class="demo-app__main">
		<div class="demo-app__content">
			{@render children()}
		</div>
	</div>
</div>
```

- [ ] **Step 8: Create `src/routes/demo/dashboard/+page.svelte`** (temporary placeholder)

```svelte
<h1 style="font-size:28px;font-weight:800">Overview — placeholder</h1>
<p style="color:var(--ink-soft)">Widgets dipasang di task berikutnya.</p>
```

- [ ] **Step 9: Verify types**

Run: `npm run check`
Expected: 0 errors.

- [ ] **Step 10: Verify auth flow visually**

Run: `npm run dev` (note the printed URL, default `http://localhost:5173`).
Check, in order:
1. Open `http://localhost:5173/demo/dashboard` → you are redirected to `/demo/login`.
2. The login card renders on the dark background with prefilled credentials.
3. Click **Masuk** → lands on `/demo/dashboard` showing the placeholder + sidebar with **Keluar**.
4. Click **Keluar** → returns to `/demo/login`.
5. Open `http://localhost:5173/` → the normal marketing site still has its Header/Footer (chrome unaffected).

Stop the dev server when done (Ctrl+C).

- [ ] **Step 11: Commit**

```bash
git add src/routes/demo
git commit -m "feat(demo-dashboard): dummy auth + demo route skeleton"
```

---

## Task 3: App shell — Sidebar + TopBar

**Files:**
- Create: `src/lib/components/demo-dashboard/TopBar.svelte`
- Create: `src/lib/components/demo-dashboard/Sidebar.svelte`
- Modify: `src/routes/demo/dashboard/+layout.svelte`

- [ ] **Step 1: Create `src/lib/components/demo-dashboard/TopBar.svelte`**

```svelte
<script lang="ts">
	import { onMount } from 'svelte';

	let now = $state(new Date());
	onMount(() => {
		const id = setInterval(() => (now = new Date()), 1000);
		return () => clearInterval(id);
	});

	const pad = (n: number) => String(n).padStart(2, '0');
	let hh = $derived(pad(now.getHours()));
	let mm = $derived(pad(now.getMinutes()));
	let ss = $derived(pad(now.getSeconds()));
</script>

<div class="cc-topbar">
	<span class="cc-topbar__brand"><span class="cmdctr-pulse"></span> SYSTEM ONLINE · NATIONAL</span>
	<span class="cc-topbar__div"></span>
	<div class="cc-topbar__kv">
		<span class="cc-topbar__kv-k">Sensor aktif</span><span class="cc-topbar__kv-v">42 / 44</span>
	</div>
	<div class="cc-topbar__kv">
		<span class="cc-topbar__kv-k">Last sync</span><span class="cc-topbar__kv-v">2s ago</span>
	</div>
	<div class="cc-topbar__kv cc-topbar__kv--danger">
		<span class="cc-topbar__kv-k">Alarm aktif</span><span class="cc-topbar__kv-v">1</span>
	</div>
	<div class="cc-topbar__kv">
		<span class="cc-topbar__kv-k">Notifikasi 24h</span><span class="cc-topbar__kv-v">186</span>
	</div>
	<div class="cc-topbar__kv cc-topbar__kv--ok">
		<span class="cc-topbar__kv-k">Uptime 30d</span><span class="cc-topbar__kv-v">99.6%</span>
	</div>
	<span class="cc-topbar__clock">
		<b>{hh}:{mm}<span style="opacity:.5">:{ss}</span> WIB</b>16 Mei 2026
	</span>
</div>
```

- [ ] **Step 2: Create `src/lib/components/demo-dashboard/Sidebar.svelte`**

```svelte
<script lang="ts">
	import { page } from '$app/stores';
	import { NAV } from './data';
	import logoBeacon from '$lib/assets/logo_be.png';
	import {
		LayoutDashboard,
		MapPin,
		Waves,
		Cpu,
		FlaskConical,
		Bell,
		Sparkles,
		FileText,
		Settings,
		LogOut
	} from '@lucide/svelte';

	const icons: Record<string, typeof LayoutDashboard> = {
		LayoutDashboard,
		MapPin,
		Waves,
		Cpu,
		FlaskConical,
		Bell,
		Sparkles,
		FileText,
		Settings
	};

	let path = $derived($page.url.pathname);
</script>

<aside class="demo-side">
	<div class="demo-side__brand">
		<img src={logoBeacon} alt="Beacon" />
		<span>Command Center</span>
	</div>
	<nav class="demo-side__nav">
		{#each NAV as item (item.href)}
			{@const Icon = icons[item.icon]}
			<a
				href={item.href}
				class="demo-side__item"
				class:demo-side__item--active={path === item.href}
			>
				<Icon size={18} />
				<span>{item.label}</span>
				{#if item.badge}<span class="demo-side__badge">{item.badge}</span>{/if}
			</a>
		{/each}
	</nav>
	<form class="demo-side__logout" method="POST" action="/demo/logout">
		<button type="submit"><LogOut size={18} /> Keluar</button>
	</form>
</aside>
```

- [ ] **Step 3: Replace `src/routes/demo/dashboard/+layout.svelte` with the full shell**

```svelte
<script lang="ts">
	import Sidebar from '$lib/components/demo-dashboard/Sidebar.svelte';
	import TopBar from '$lib/components/demo-dashboard/TopBar.svelte';
	let { children } = $props();
</script>

<div class="demo-app">
	<Sidebar />
	<div class="demo-app__main">
		<TopBar />
		<div class="demo-app__content">
			{@render children()}
		</div>
	</div>
</div>
```

- [ ] **Step 4: Verify types**

Run: `npm run check`
Expected: 0 errors.

- [ ] **Step 5: Verify shell visually**

Run: `npm run dev`. Log in, then on `/demo/dashboard` confirm:
1. Left sidebar shows logo + 9 nav items; **Overview** is highlighted; **Notifikasi** shows a red `1` badge.
2. Topbar shows SYSTEM ONLINE with a green pulsing dot and a **clock whose seconds tick every second**.
3. Clicking nav items navigates (sub-pages 404 until Task 13 — that's expected); the active highlight follows the route for `/demo/dashboard`.
Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add src/lib/components/demo-dashboard/TopBar.svelte src/lib/components/demo-dashboard/Sidebar.svelte src/routes/demo/dashboard/+layout.svelte
git commit -m "feat(demo-dashboard): app shell (sidebar + live topbar)"
```

---

## Task 4: KpiRow widget

**Files:**
- Create: `src/lib/components/demo-dashboard/KpiRow.svelte`

- [ ] **Step 1: Create `src/lib/components/demo-dashboard/KpiRow.svelte`**

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	let flickerOn = $state(true);
	onMount(() => {
		const id = setInterval(() => (flickerOn = !flickerOn), 1800);
		return () => clearInterval(id);
	});
</script>

<div class="cc-kpis">
	<div class="cc-kpi cc-kpi--ok">
		<span class="cc-kpi__label">Sites Online</span>
		<span class="cc-kpi__value">42<small>/44</small></span>
		<span class="cc-kpi__delta cc-kpi__delta--up">▲ 2 sites · 6 jam</span>
	</div>
	<div class="cc-kpi">
		<span class="cc-kpi__label">Curah Hujan · 24h</span>
		<span class="cc-kpi__value">421<small>mm</small></span>
		<span class="cc-kpi__delta">3 stasiun &gt; 30 mm/h</span>
	</div>
	<div class="cc-kpi cc-kpi--warn">
		<span class="cc-kpi__label">Pompa Aktif</span>
		<span class="cc-kpi__value">5<small>/6</small></span>
		<span class="cc-kpi__delta cc-kpi__delta--down">▼ 1 lift pump siaga</span>
	</div>
	<div class="cc-kpi cc-kpi--danger">
		<span class="cc-kpi__label">Alarm Aktif</span>
		<span class="cc-kpi__value" style="opacity:{flickerOn ? 1 : 0.55};transition:opacity .2s">1</span>
		<span class="cc-kpi__delta cc-kpi__delta--down">WQ-03 · pH 5.1 Rawajitu</span>
	</div>
	<div class="cc-kpi cc-kpi--ai">
		<span class="cc-kpi__label">AI Confidence</span>
		<span class="cc-kpi__value">94<small>%</small></span>
		<span class="cc-kpi__delta">7 rekomendasi siap</span>
	</div>
</div>
```

- [ ] **Step 2: Temporarily render it on the Overview page to verify**

Replace `src/routes/demo/dashboard/+page.svelte` with:

```svelte
<script lang="ts">
	import KpiRow from '$lib/components/demo-dashboard/KpiRow.svelte';
</script>

<KpiRow />
```

- [ ] **Step 3: Verify**

Run: `npm run check` → 0 errors. Then `npm run dev`, log in, confirm 5 KPI cards render with colored left accents (green/blue/amber/red/purple) and the red "Alarm Aktif" value gently flickers. Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/lib/components/demo-dashboard/KpiRow.svelte src/routes/demo/dashboard/+page.svelte
git commit -m "feat(demo-dashboard): KPI row widget"
```

---

## Task 5: NationalMap widget

**Files:**
- Create: `src/lib/components/demo-dashboard/NationalMap.svelte`

- [ ] **Step 1: Create `src/lib/components/demo-dashboard/NationalMap.svelte`**

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { CC_SITES, loadGeo, project, type GeoPath } from './data';

	const VW = 1000;
	const VH = 520;
	let tick = $state(0);
	let geoPaths = $state<GeoPath[] | null>(null);

	onMount(() => {
		loadGeo(VW, VH).then((p) => (geoPaths = p));
		const id = setInterval(() => (tick += 1), 1600);
		return () => clearInterval(id);
	});

	const counts = CC_SITES.reduce(
		(acc, s) => ((acc[s.s] = (acc[s.s] || 0) + 1), acc),
		{} as Record<string, number>
	);
	const colorFor = (s: string) => (s === 'alarm' ? '#FF7A66' : s === 'warn' ? '#FFB454' : '#46D78F');
	const meridians = [100, 110, 120, 130, 140];
	const parallels = [-10, -5, 0, 5];
</script>

<div class="cc-map">
	<div class="cc-map__head">
		<span class="cc-map__title">JARINGAN NASIONAL · LIVE</span>
		<span class="cc-map__sub">{CC_SITES.length} sites · 34 provinsi</span>
	</div>
	<div class="cc-map__viz">
		<svg
			width="100%"
			height="100%"
			viewBox={`0 0 ${VW} ${VH}`}
			preserveAspectRatio="xMidYMid meet"
			style="display:block"
		>
			<defs>
				<radialGradient id="ccGlow" cx="50%" cy="50%" r="50%">
					<stop offset="0%" stop-color="rgba(60,195,242,0.55)" />
					<stop offset="100%" stop-color="rgba(60,195,242,0)" />
				</radialGradient>
				<pattern id="ccDots" width="20" height="20" patternUnits="userSpaceOnUse">
					<circle cx="2" cy="2" r="1.0" fill="rgba(120,160,220,0.18)" />
				</pattern>
				<linearGradient id="ccLand" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="rgba(60,130,232,0.22)" />
					<stop offset="100%" stop-color="rgba(31,165,199,0.12)" />
				</linearGradient>
				<filter id="ccLandShadow" x="-5%" y="-5%" width="110%" height="110%">
					<feGaussianBlur stdDeviation="2.5" />
				</filter>
			</defs>

			<rect x="0" y="0" width={VW} height={VH} fill="url(#ccDots)" />

			<g stroke="rgba(120,160,220,0.10)" stroke-width="0.6" fill="none">
				{#each meridians as lon (lon)}
					{@const x = project(lon, 0, VW, VH)[0]}
					<line x1={x} y1={0} x2={x} y2={VH} />
				{/each}
				{#each parallels as lat (lat)}
					{@const y = project(0, lat, VW, VH)[1]}
					<line x1={0} y1={y} x2={VW} y2={y} />
				{/each}
			</g>

			{#if geoPaths}
				<g filter="url(#ccLandShadow)" opacity="0.55">
					{#each geoPaths as p, i (i)}
						<path d={p.d} fill="rgba(60,195,242,0.18)" />
					{/each}
				</g>
				<g
					fill="url(#ccLand)"
					stroke="rgba(140,190,240,0.45)"
					stroke-width="0.7"
					stroke-linejoin="round"
				>
					{#each geoPaths as p, i (i)}
						<path d={p.d} />
					{/each}
				</g>
			{/if}

			<g stroke="rgba(60,195,242,0.20)" stroke-width="1" stroke-dasharray="3 4" fill="none">
				{#each CC_SITES.slice(0, -1) as s, i (s.id)}
					{@const a = project(s.lon, s.lat, VW, VH)}
					{@const b = project(CC_SITES[i + 1].lon, CC_SITES[i + 1].lat, VW, VH)}
					<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
				{/each}
			</g>

			{#each CC_SITES as s, i (s.id)}
				{@const c = project(s.lon, s.lat, VW, VH)}
				{@const isHot = s.s !== 'ok'}
				{@const pulseR = 12 + ((tick + i) % 6) * 4}
				{@const pulseO = 0.55 - ((tick + i) % 6) * 0.09}
				<g>
					{#if isHot}
						<circle
							cx={c[0]}
							cy={c[1]}
							r={pulseR}
							fill="none"
							stroke={colorFor(s.s)}
							stroke-opacity={pulseO}
							stroke-width="1.5"
						/>
					{/if}
					<circle cx={c[0]} cy={c[1]} r="14" fill="url(#ccGlow)" opacity={isHot ? 0.95 : 0.55} />
					<circle cx={c[0]} cy={c[1]} r="4.5" fill={colorFor(s.s)} />
					<circle cx={c[0]} cy={c[1]} r="4.5" fill="none" stroke="#07112A" stroke-width="1.5" />
					<text
						x={c[0] + 9}
						y={c[1] - 5}
						font-family="var(--font-mono)"
						font-size="9.5"
						font-weight="700"
						fill="#EAF1FB"
						letter-spacing="0.04em">{s.id}</text
					>
					<text x={c[0] + 9} y={c[1] + 7} font-family="var(--font-mono)" font-size="8.5" fill="#93A5C7"
						>{s.name}</text
					>
				</g>
			{/each}

			<g stroke="rgba(120,160,220,0.45)" stroke-width="1.4" fill="none">
				<path d={`M10,10 L10,40 M10,10 L40,10`} />
				<path d={`M${VW - 10},10 L${VW - 10},40 M${VW - 10},10 L${VW - 40},10`} />
				<path d={`M10,${VH - 10} L10,${VH - 40} M10,${VH - 10} L40,${VH - 10}`} />
				<path d={`M${VW - 10},${VH - 10} L${VW - 10},${VH - 40} M${VW - 10},${VH - 10} L${VW - 40},${VH - 10}`} />
			</g>

			{#if !geoPaths}
				<text
					x={VW / 2}
					y={VH / 2}
					text-anchor="middle"
					font-family="var(--font-mono)"
					font-size="11"
					fill="rgba(147,165,199,0.6)"
					letter-spacing="0.14em">LOADING GEO LAYER…</text
				>
			{/if}
		</svg>
	</div>
	<div class="cc-map__legend">
		<span><i style="background:#46D78F"></i>Normal · {counts.ok || 0}</span>
		<span><i style="background:#FFB454"></i>Siaga · {counts.warn || 0}</span>
		<span><i style="background:#FF7A66"></i>Awas · {counts.alarm || 0}</span>
	</div>
</div>
```

- [ ] **Step 2: Temporarily render it to verify**

Replace `src/routes/demo/dashboard/+page.svelte` with:

```svelte
<script lang="ts">
	import KpiRow from '$lib/components/demo-dashboard/KpiRow.svelte';
	import NationalMap from '$lib/components/demo-dashboard/NationalMap.svelte';
</script>

<KpiRow />
<div style="height:520px;margin-top:14px"><NationalMap /></div>
```

- [ ] **Step 3: Verify**

Run: `npm run check` → 0 errors. Then `npm run dev`, log in, confirm: the Indonesia landmass renders in cyan over a dotted ocean; 15 labeled site nodes appear; Tulang Bawang (TBW-01, red) and the warn sites (JKT-04, BJM-05, amber) show expanding pulse rings; the legend shows Normal 12 / Siaga 2 / Awas 1. Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/lib/components/demo-dashboard/NationalMap.svelte src/routes/demo/dashboard/+page.svelte
git commit -m "feat(demo-dashboard): national live map widget"
```

---

## Task 6: AwlrChart widget

**Files:**
- Create: `src/lib/components/demo-dashboard/AwlrChart.svelte`

- [ ] **Step 1: Create `src/lib/components/demo-dashboard/AwlrChart.svelte`**

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { seedAwlr, driftAwlr } from './tick';

	let { compact = false, threshold = 3.0 }: { compact?: boolean; threshold?: number } = $props();

	const N = 60;
	let data = $state<number[]>(seedAwlr(N));

	let W = $state(0);
	let H = $state(0);

	onMount(() => {
		const id = setInterval(() => {
			data = [...data.slice(1), driftAwlr(data[data.length - 1])];
		}, 1500);
		return () => clearInterval(id);
	});

	let pad = $derived(
		compact ? { l: 34, r: 14, t: 12, b: 18 } : { l: 36, r: 16, t: 18, b: 24 }
	);
	let innerW = $derived(Math.max(0, W - pad.l - pad.r));
	let innerH = $derived(Math.max(0, H - pad.t - pad.b));
	let ready = $derived(W > 0 && H > 0);
	const min = 0.5;
	const max = 4.5;
	let xs = $derived((i: number) => pad.l + (i / (N - 1)) * innerW);
	let ys = $derived((v: number) => pad.t + (1 - (v - min) / (max - min)) * innerH);

	let path = $derived(data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xs(i)} ${ys(v)}`).join(' '));
	let area = $derived(`${path} L ${xs(N - 1)} ${pad.t + innerH} L ${xs(0)} ${pad.t + innerH} Z`);
	let current = $derived(data[data.length - 1]);
	let status = $derived(current > 3.5 ? 'alarm' : current > 2.8 ? 'warn' : 'ok');
	let statusLabel = $derived(status === 'alarm' ? 'AWAS' : status === 'warn' ? 'SIAGA' : 'NORMAL');
	let pillClass = $derived(status === 'alarm' ? 'danger' : status === 'warn' ? 'amber' : 'green');
</script>

<div class="card" style="height:100%;display:flex;flex-direction:column;min-height:0;overflow:hidden;padding:{compact ? 12 : 22}px">
	<div class="card-h" style="margin-bottom:{compact ? 5 : 18}px">
		<div style="display:flex;flex-direction:column;gap:4px;min-width:0">
			<span class="label" style="font-size:{compact ? 10 : 11}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"
				>AWLR-02 · Way Tulang Bawang · Banjar Margo</span
			>
			<span style="font-family:var(--font-mono);font-size:{compact ? 11 : 14}px;color:var(--ink-mute)"
				>Tinggi Muka Air · 60 min</span
			>
		</div>
		<span class="pill pill--{pillClass}" style="font-size:11px">
			<span class="status-dot {status}" style="width:7px;height:7px"></span>{statusLabel}
		</span>
	</div>
	<div style="display:flex;align-items:baseline;gap:8px;margin-bottom:{compact ? 0 : 8}px">
		<span
			style="font-family:var(--font-mono);font-size:{compact ? 30 : 44}px;font-weight:600;color:var(--ink);letter-spacing:-0.02em;line-height:1"
			>{current.toFixed(2)}</span
		>
		<span style="font-size:{compact ? 13 : 18}px;color:var(--ink-soft)">meter</span>
		<span
			style="margin-left:auto;font-family:var(--font-mono);font-size:{compact ? 11 : 13}px;color:var(--ink-mute)"
			>ambang siaga: {threshold.toFixed(1)} m</span
		>
	</div>
	<div bind:clientWidth={W} bind:clientHeight={H} style="flex:1 1 auto;min-height:0;position:relative">
		{#if ready}
			<svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style="display:block;position:absolute;inset:0">
				<defs>
					<linearGradient id="awlrFill" x1="0" x2="0" y1="0" y2="1">
						<stop offset="0%" stop-color="var(--brand-2)" stop-opacity="0.45" />
						<stop offset="100%" stop-color="var(--brand-2)" stop-opacity="0" />
					</linearGradient>
				</defs>
				{#each [1, 2, 3, 4] as v (v)}
					<line x1={pad.l} x2={W - pad.r} y1={ys(v)} y2={ys(v)} stroke="var(--line-soft)" stroke-dasharray="2 4" />
					<text x={pad.l - 8} y={ys(v) + 4} font-family="var(--font-mono)" font-size="11" fill="var(--ink-mute)" text-anchor="end">{v}.0</text>
				{/each}
				<line x1={pad.l} x2={W - pad.r} y1={ys(threshold)} y2={ys(threshold)} stroke="var(--amber)" stroke-dasharray="6 4" stroke-width="1.5" />
				<text x={W - pad.r - 4} y={ys(threshold) - 6} font-size="10" font-family="var(--font-mono)" fill="var(--amber)" text-anchor="end" font-weight="600">SIAGA 3.0</text>
				<line x1={pad.l} x2={W - pad.r} y1={ys(3.8)} y2={ys(3.8)} stroke="var(--danger)" stroke-dasharray="6 4" stroke-width="1.5" />
				<text x={W - pad.r - 4} y={ys(3.8) - 6} font-size="10" font-family="var(--font-mono)" fill="var(--danger)" text-anchor="end" font-weight="600">AWAS 3.8</text>
				<path d={area} fill="url(#awlrFill)" />
				<path d={path} fill="none" stroke="var(--brand-2)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" />
				<circle cx={xs(N - 1)} cy={ys(current)} r="5" fill="#0B1B3A" stroke="var(--brand-2)" stroke-width="2.5" />
				<circle cx={xs(N - 1)} cy={ys(current)} r="11" fill="none" stroke="var(--brand-2)" stroke-opacity="0.35">
					<animate attributeName="r" values="6;18;6" dur="2s" repeatCount="indefinite" />
					<animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
				</circle>
				<text x={pad.l} y={H - 6} font-family="var(--font-mono)" font-size="11" fill="var(--ink-mute)">-60m</text>
				<text x={W / 2} y={H - 6} font-family="var(--font-mono)" font-size="11" fill="var(--ink-mute)" text-anchor="middle">-30m</text>
				<text x={W - pad.r} y={H - 6} font-family="var(--font-mono)" font-size="11" fill="var(--ink-mute)" text-anchor="end">live</text>
			</svg>
		{/if}
	</div>
</div>
```

- [ ] **Step 2: Verify**

Run: `npm run check` → 0 errors. (Visual verification happens together with the composed Overview in Task 12; no temporary wiring needed here.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/components/demo-dashboard/AwlrChart.svelte
git commit -m "feat(demo-dashboard): AWLR water-level chart widget"
```

---

## Task 7: RainfallBars widget

**Files:**
- Create: `src/lib/components/demo-dashboard/RainfallBars.svelte`

- [ ] **Step 1: Create `src/lib/components/demo-dashboard/RainfallBars.svelte`**

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { seedRainfall, nextRainfall } from './tick';

	let { compact = false }: { compact?: boolean } = $props();

	const N = 24;
	let data = $state<number[]>(seedRainfall(N));

	let W = $state(0);
	let H = $state(0);

	onMount(() => {
		const id = setInterval(() => {
			data = [...data.slice(1), nextRainfall()];
		}, 2000);
		return () => clearInterval(id);
	});

	let pad = $derived(compact ? { l: 34, r: 12, t: 10, b: 18 } : { l: 36, r: 12, t: 18, b: 26 });
	let innerW = $derived(Math.max(0, W - pad.l - pad.r));
	let innerH = $derived(Math.max(0, H - pad.t - pad.b));
	let ready = $derived(W > 0 && H > 0);
	const max = 50;
	let bw = $derived(Math.max(0, innerW / N - 4));
	let sum = $derived(data.reduce((a, b) => a + b, 0).toFixed(1));
	const colorFor = (v: number) => (v > 30 ? 'var(--danger)' : v > 18 ? 'var(--amber)' : 'var(--water)');
</script>

<div class="card" style="height:100%;display:flex;flex-direction:column;min-height:0;overflow:hidden;padding:{compact ? 12 : 22}px">
	<div class="card-h" style="margin-bottom:{compact ? 5 : 18}px">
		<div style="display:flex;flex-direction:column;gap:4px">
			<span class="label" style="font-size:{compact ? 10 : 11}px">ARR-02 · Curah Hujan · Gedung Aji</span>
			<span style="font-family:var(--font-mono);font-size:{compact ? 11 : 14}px;color:var(--ink-mute)">Hourly · 24h</span>
		</div>
		<span class="pill pill--water" style="font-size:11px"><span style="font-family:var(--font-mono)">Σ 24h · {sum} mm</span></span>
	</div>
	<div bind:clientWidth={W} bind:clientHeight={H} style="flex:1 1 auto;min-height:0;position:relative">
		{#if ready}
			<svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style="display:block;position:absolute;inset:0">
				{#each [10, 20, 30, 40] as v (v)}
					{@const y = pad.t + (1 - v / max) * innerH}
					<line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="var(--line-soft)" stroke-dasharray="2 4" />
					<text x={pad.l - 8} y={y + 4} font-family="var(--font-mono)" font-size="11" fill="var(--ink-mute)" text-anchor="end">{v}</text>
				{/each}
				{#each data as v, i (i)}
					{@const h = (v / max) * innerH}
					{@const x = pad.l + i * (innerW / N) + 2}
					{@const y = pad.t + innerH - h}
					<rect {x} {y} width={bw} height={h} rx="2" fill={colorFor(v)} opacity={0.85 + (i / N) * 0.15} />
				{/each}
				<text x={pad.l} y={H - 6} font-family="var(--font-mono)" font-size="11" fill="var(--ink-mute)">00:00</text>
				<text x={pad.l + innerW / 2} y={H - 6} font-family="var(--font-mono)" font-size="11" fill="var(--ink-mute)" text-anchor="middle">12:00</text>
				<text x={W - pad.r} y={H - 6} font-family="var(--font-mono)" font-size="11" fill="var(--ink-mute)" text-anchor="end">now</text>
				<text x={pad.l - 18} y={pad.t - 4} font-family="var(--font-mono)" font-size="10" fill="var(--ink-mute)">mm/h</text>
			</svg>
		{/if}
	</div>
</div>
```

- [ ] **Step 2: Verify**

Run: `npm run check` → 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/components/demo-dashboard/RainfallBars.svelte
git commit -m "feat(demo-dashboard): rainfall bars widget"
```

---

## Task 8: PumpGrid widget

**Files:**
- Create: `src/lib/components/demo-dashboard/PumpGrid.svelte`

- [ ] **Step 1: Create `src/lib/components/demo-dashboard/PumpGrid.svelte`**

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { PUMPS } from './data';

	let { compact = false }: { compact?: boolean } = $props();

	let blinkOn = $state(true);
	onMount(() => {
		const id = setInterval(() => (blinkOn = !blinkOn), 2200);
		return () => clearInterval(id);
	});
</script>

<div class="card" style="height:100%;overflow:hidden;padding:{compact ? 14 : 22}px">
	<div class="card-h" style="margin-bottom:{compact ? 10 : 14}px">
		<div style="display:flex;flex-direction:column;gap:4px">
			<span class="label" style="font-size:{compact ? 10 : 11}px">STATUS PERANGKAT · POMPA & PINTU AIR</span>
			<span style="font-family:var(--font-mono);font-size:{compact ? 11 : 14}px;color:var(--ink-mute)">6 unit · refresh 2s</span>
		</div>
		<span class="pill pill--green" style="font-size:11px">5/6 OPERATIONAL</span>
	</div>
	<div style="display:grid;grid-template-columns:1fr 1fr;gap:{compact ? 6 : 10}px">
		{#each PUMPS as p (p.id)}
			<div
				style="display:flex;align-items:center;gap:{compact ? 8 : 12}px;padding:{compact ? '6px 9px' : '10px 14px'};border:1px solid var(--line);border-radius:8px;background:var(--surface-2)"
			>
				<span class="status-dot {p.status}" style="width:8px;height:8px"></span>
				<div style="display:flex;flex-direction:column;min-width:0;flex:1">
					<span style="font-family:var(--font-mono);font-size:{compact ? 9 : 11}px;font-weight:700;color:var(--ink-mute);letter-spacing:.08em">{p.id}</span>
					<span style="font-size:{compact ? 12 : 14}px;font-weight:600;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{p.name}</span>
				</div>
				<span style="font-family:var(--font-mono);font-size:{compact ? 11 : 13}px;font-weight:600;color:var(--ink-2);white-space:nowrap">
					{p.flow}<span style="display:inline-block;margin-left:6px;color:var(--green);opacity:{blinkOn ? 1 : 0.4}">•</span>
				</span>
			</div>
		{/each}
	</div>
</div>
```

- [ ] **Step 2: Verify**

Run: `npm run check` → 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/components/demo-dashboard/PumpGrid.svelte
git commit -m "feat(demo-dashboard): pump/gate status grid widget"
```

---

## Task 9: WqGauge + WqPanel widgets

**Files:**
- Create: `src/lib/components/demo-dashboard/WqGauge.svelte`
- Create: `src/lib/components/demo-dashboard/WqPanel.svelte`

- [ ] **Step 1: Create `src/lib/components/demo-dashboard/WqGauge.svelte`**

```svelte
<script lang="ts">
	let {
		label,
		value,
		unit,
		min,
		max,
		ok = [0, 100],
		compact = false
	}: {
		label: string;
		value: string;
		unit: string;
		min: number;
		max: number;
		ok?: [number, number];
		compact?: boolean;
	} = $props();

	const num = Number(value);
	let pct = $derived(Math.max(0, Math.min(1, (num - min) / (max - min))));
	let inOk = $derived(num >= ok[0] && num <= ok[1]);
	let color = $derived(inOk ? 'var(--green)' : 'var(--amber)');
	let R = $derived(compact ? 44 : 56);
	let C = $derived(2 * Math.PI * R);
	const arc = 0.7;
	let offsetRot = $derived(180 + (1 - arc) * 180);
</script>

<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:{compact ? 3 : 8}px;min-width:0;min-height:0;flex:1">
	<svg width="100%" height="100%" viewBox="-72 -72 144 144" preserveAspectRatio="xMidYMid meet" style="display:block;flex:1 1 auto;min-height:0">
		<circle r={R} fill="none" stroke="var(--line)" stroke-width={compact ? 8 : 10} stroke-dasharray={`${C * arc} ${C}`} transform={`rotate(${offsetRot})`} stroke-linecap="round" />
		<circle r={R} fill="none" stroke={color} stroke-width={compact ? 8 : 10} stroke-dasharray={`${C * arc * pct} ${C}`} transform={`rotate(${offsetRot})`} stroke-linecap="round" />
		<text x="0" y="0" text-anchor="middle" font-family="var(--font-mono)" font-size={compact ? 19 : 22} font-weight="600" fill="var(--ink)">{value}</text>
		<text x="0" y="18" text-anchor="middle" font-family="var(--font-mono)" font-size={compact ? 9 : 11} fill="var(--ink-mute)">{unit}</text>
	</svg>
	<span style="font-family:var(--font-mono);font-size:{compact ? 10 : 12}px;font-weight:600;color:var(--ink-mute);letter-spacing:.06em;text-transform:uppercase">{label}</span>
</div>
```

- [ ] **Step 2: Create `src/lib/components/demo-dashboard/WqPanel.svelte`**

```svelte
<script lang="ts">
	import WqGauge from './WqGauge.svelte';
	import { WQ_GAUGES } from './data';
	let { compact = false }: { compact?: boolean } = $props();
</script>

<div class="card" style="height:100%;overflow:hidden;display:flex;flex-direction:column;min-height:0;padding:{compact ? 14 : 22}px">
	<div class="card-h" style="margin-bottom:{compact ? 8 : 14}px">
		<span class="label" style="font-size:{compact ? 10 : 11}px">KUALITAS AIR · WQ-03 RAWAJITU</span>
		<span class="pill pill--amber" style="font-size:11px">1 parameter siaga</span>
	</div>
	<div style="display:grid;grid-template-columns:repeat(4, minmax(0, 1fr));gap:{compact ? 4 : 6}px;flex:1;min-height:0;align-items:stretch">
		{#each WQ_GAUGES as g (g.label)}
			<WqGauge label={g.label} value={g.value} unit={g.unit} min={g.min} max={g.max} ok={g.ok} {compact} />
		{/each}
	</div>
</div>
```

- [ ] **Step 3: Verify**

Run: `npm run check` → 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/components/demo-dashboard/WqGauge.svelte src/lib/components/demo-dashboard/WqPanel.svelte
git commit -m "feat(demo-dashboard): water-quality gauges + panel"
```

---

## Task 10: AlertFeed widget

**Files:**
- Create: `src/lib/components/demo-dashboard/AlertFeed.svelte`

- [ ] **Step 1: Create `src/lib/components/demo-dashboard/AlertFeed.svelte`**

```svelte
<script lang="ts">
	import { ALERTS_SEED } from './data';
	let { compact = false }: { compact?: boolean } = $props();
	let visible = $derived(compact ? ALERTS_SEED.slice(0, 3) : ALERTS_SEED);
	const bgFor = (sev: string, first: boolean) =>
		first ? (sev === 'alarm' ? 'var(--danger-soft)' : 'var(--amber-soft)') : 'var(--surface-2)';
</script>

<div class="card" style="height:100%;overflow:hidden;padding:{compact ? 14 : 22}px">
	<div class="card-h" style="margin-bottom:{compact ? 10 : 14}px">
		<div style="display:flex;flex-direction:column;gap:4px">
			<span class="label" style="font-size:{compact ? 10 : 11}px">ALERT FEED · 30 MIN</span>
			<span style="font-family:var(--font-mono);font-size:{compact ? 11 : 14}px;color:var(--ink-mute)">WhatsApp · SMS · Telegram</span>
		</div>
		<span style="font-family:var(--font-mono);font-size:{compact ? 10 : 12}px;color:var(--green);font-weight:700">● LIVE</span>
	</div>
	<div style="display:flex;flex-direction:column;gap:{compact ? 7 : 10}px">
		{#each visible as a, i (a.code + a.t)}
			<div style="display:flex;gap:{compact ? 9 : 12}px;padding:{compact ? '8px 10px' : '10px 14px'};border:1px solid var(--line);border-radius:8px;background:{bgFor(a.sev, i === 0)}">
				<span class="status-dot {a.sev}" style="margin-top:5px;width:8px;height:8px"></span>
				<div style="flex:1;min-width:0">
					<div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
						<span style="font-family:var(--font-mono);font-size:{compact ? 10 : 11}px;font-weight:700;color:var(--ink-mute);letter-spacing:.08em">{a.code}</span>
						<span style="margin-left:auto;font-family:var(--font-mono);font-size:{compact ? 10 : 11}px;color:var(--ink-mute)">{a.t}</span>
					</div>
					<div style="font-size:{compact ? 12 : 14}px;color:var(--ink-2);line-height:{compact ? 1.25 : 1.35}">{a.msg}</div>
				</div>
			</div>
		{/each}
	</div>
</div>
```

- [ ] **Step 2: Verify**

Run: `npm run check` → 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/components/demo-dashboard/AlertFeed.svelte
git commit -m "feat(demo-dashboard): alert feed widget"
```

---

## Task 11: AiInsight widget

**Files:**
- Create: `src/lib/components/demo-dashboard/AiInsight.svelte`

- [ ] **Step 1: Create `src/lib/components/demo-dashboard/AiInsight.svelte`**

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { AI_MESSAGES } from './data';

	let idx = $state(0);
	onMount(() => {
		const id = setInterval(() => (idx = (idx + 1) % AI_MESSAGES.length), 5200);
		return () => clearInterval(id);
	});
	let m = $derived(AI_MESSAGES[idx]);
</script>

<div class="cc-ai">
	<span class="cc-ai__badge"><span class="cc-ai__icon"></span> ARGO · AI INSIGHT</span>
	<div class="cc-ai__body">
		<span class="cc-ai__title">{m.title}</span>
		<span class="cc-ai__sub">{m.sub}<b>{m.bold}</b></span>
	</div>
	<div class="cc-ai__conf">
		<span class="cc-ai__conf-v">94%</span>
		<span class="cc-ai__conf-l">Confidence</span>
	</div>
</div>
```

- [ ] **Step 2: Verify**

Run: `npm run check` → 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/components/demo-dashboard/AiInsight.svelte
git commit -m "feat(demo-dashboard): ARGO AI insight ticker widget"
```

---

## Task 12: Overview page composition (command center)

**Files:**
- Modify: `src/routes/demo/dashboard/+page.svelte`

- [ ] **Step 1: Replace `src/routes/demo/dashboard/+page.svelte` with the full command center**

```svelte
<script lang="ts">
	import KpiRow from '$lib/components/demo-dashboard/KpiRow.svelte';
	import NationalMap from '$lib/components/demo-dashboard/NationalMap.svelte';
	import AwlrChart from '$lib/components/demo-dashboard/AwlrChart.svelte';
	import RainfallBars from '$lib/components/demo-dashboard/RainfallBars.svelte';
	import PumpGrid from '$lib/components/demo-dashboard/PumpGrid.svelte';
	import WqPanel from '$lib/components/demo-dashboard/WqPanel.svelte';
	import AiInsight from '$lib/components/demo-dashboard/AiInsight.svelte';
</script>

<svelte:head>
	<title>Overview · Command Center</title>
</svelte:head>

<div style="display:flex;flex-direction:column;gap:14px;min-height:calc(100vh - 120px)">
	<KpiRow />
	<div class="cc-main" style="flex:1">
		<NationalMap />
		<div class="cc-col">
			<div style="flex:1;min-height:260px"><AwlrChart compact /></div>
			<div style="flex:1;min-height:260px"><RainfallBars compact /></div>
		</div>
		<div class="cc-col">
			<div style="flex:1.15;min-height:260px"><PumpGrid compact /></div>
			<div style="flex:1;min-height:240px"><WqPanel compact /></div>
		</div>
	</div>
	<AiInsight />
</div>
```

- [ ] **Step 2: Verify**

Run: `npm run check` → 0 errors. Then `npm run dev`, log in, and confirm `/demo/dashboard` shows the full slide-14 layout: KPI row on top; three columns (live map | AWLR + rainfall | pumps + water-quality); ARGO ribbon at the bottom rotating through 3 messages (~every 5s). The AWLR line and rainfall bars drift over time. Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/routes/demo/dashboard/+page.svelte
git commit -m "feat(demo-dashboard): compose Overview command center page"
```

---

## Task 13: Secondary pages + PageHead

**Files:**
- Create: `src/lib/components/demo-dashboard/PageHead.svelte`
- Create: `src/routes/demo/dashboard/sites/+page.svelte`
- Create: `src/routes/demo/dashboard/hidrologi/+page.svelte`
- Create: `src/routes/demo/dashboard/perangkat/+page.svelte`
- Create: `src/routes/demo/dashboard/kualitas-air/+page.svelte`
- Create: `src/routes/demo/dashboard/notifikasi/+page.svelte`
- Create: `src/routes/demo/dashboard/argo/+page.svelte`
- Create: `src/routes/demo/dashboard/laporan/+page.svelte`
- Create: `src/routes/demo/dashboard/pengaturan/+page.svelte`

- [ ] **Step 1: Create `src/lib/components/demo-dashboard/PageHead.svelte`**

```svelte
<script lang="ts">
	let { title, sub }: { title: string; sub: string } = $props();
</script>

<div class="demo-page__head">
	<h1 class="demo-page__title">{title}</h1>
	<span class="demo-page__sub">{sub}</span>
</div>
```

- [ ] **Step 2: Create `src/routes/demo/dashboard/sites/+page.svelte`**

```svelte
<script lang="ts">
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import NationalMap from '$lib/components/demo-dashboard/NationalMap.svelte';
	import { CC_SITES } from '$lib/components/demo-dashboard/data';

	let q = $state('');
	let rows = $derived(
		CC_SITES.filter(
			(s) =>
				s.name.toLowerCase().includes(q.toLowerCase()) ||
				s.id.toLowerCase().includes(q.toLowerCase())
		)
	);
	const labelFor = (s: string) => (s === 'alarm' ? 'AWAS' : s === 'warn' ? 'SIAGA' : 'NORMAL');
</script>

<svelte:head><title>Jaringan Sites · Command Center</title></svelte:head>

<div class="demo-page">
	<PageHead title="Jaringan Sites" sub="{CC_SITES.length} stasiun terpantau · 34 provinsi" />
	<div class="demo-grid-2">
		<div style="height:480px"><NationalMap /></div>
		<div class="card" style="overflow:auto">
			<input
				placeholder="Cari site / kode…"
				bind:value={q}
				style="width:100%;margin-bottom:12px;padding:9px 12px;border-radius:9px;border:1px solid var(--line);background:var(--surface-2);color:var(--ink);font-family:var(--font-mono);font-size:13px"
			/>
			<table class="demo-table">
				<thead>
					<tr><th>Kode</th><th>Lokasi</th><th>Status</th></tr>
				</thead>
				<tbody>
					{#each rows as s (s.id)}
						<tr>
							<td style="font-family:var(--font-mono);font-weight:700">{s.id}</td>
							<td>{s.name}</td>
							<td>
								<span style="display:inline-flex;align-items:center;gap:7px">
									<span class="status-dot {s.s}" style="width:8px;height:8px"></span>{labelFor(s.s)}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
```

- [ ] **Step 3: Create `src/routes/demo/dashboard/hidrologi/+page.svelte`**

```svelte
<script lang="ts">
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import AwlrChart from '$lib/components/demo-dashboard/AwlrChart.svelte';
	import RainfallBars from '$lib/components/demo-dashboard/RainfallBars.svelte';
</script>

<svelte:head><title>Hidrologi · Command Center</title></svelte:head>

<div class="demo-page">
	<PageHead title="Hidrologi" sub="Tinggi muka air & curah hujan · realtime" />
	<div style="height:360px"><AwlrChart /></div>
	<div style="height:360px"><RainfallBars /></div>
</div>
```

- [ ] **Step 4: Create `src/routes/demo/dashboard/perangkat/+page.svelte`**

```svelte
<script lang="ts">
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import PumpGrid from '$lib/components/demo-dashboard/PumpGrid.svelte';
	import AlertFeed from '$lib/components/demo-dashboard/AlertFeed.svelte';
</script>

<svelte:head><title>Perangkat · Command Center</title></svelte:head>

<div class="demo-page">
	<PageHead title="Perangkat" sub="Pompa, pintu air & status telemetri" />
	<div class="demo-grid-2" style="align-items:start">
		<PumpGrid />
		<AlertFeed />
	</div>
</div>
```

- [ ] **Step 5: Create `src/routes/demo/dashboard/kualitas-air/+page.svelte`**

```svelte
<script lang="ts">
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import WqPanel from '$lib/components/demo-dashboard/WqPanel.svelte';
</script>

<svelte:head><title>Kualitas Air · Command Center</title></svelte:head>

<div class="demo-page">
	<PageHead title="Kualitas Air" sub="Parameter mutu air · WQ-03 Rawajitu" />
	<div style="height:420px"><WqPanel /></div>
</div>
```

- [ ] **Step 6: Create `src/routes/demo/dashboard/notifikasi/+page.svelte`**

```svelte
<script lang="ts">
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import AlertFeed from '$lib/components/demo-dashboard/AlertFeed.svelte';
</script>

<svelte:head><title>Notifikasi · Command Center</title></svelte:head>

<div class="demo-page">
	<PageHead title="Notifikasi" sub="Riwayat alert · WhatsApp · SMS · Telegram" />
	<AlertFeed />
</div>
```

- [ ] **Step 7: Create `src/routes/demo/dashboard/argo/+page.svelte`**

```svelte
<script lang="ts">
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import AiInsight from '$lib/components/demo-dashboard/AiInsight.svelte';
	import { AI_MESSAGES } from '$lib/components/demo-dashboard/data';
</script>

<svelte:head><title>ARGO AI · Command Center</title></svelte:head>

<div class="demo-page">
	<PageHead title="ARGO · AI Insight" sub="Rekomendasi prediktif · confidence 94%" />
	<AiInsight />
	<div style="display:flex;flex-direction:column;gap:12px;margin-top:4px">
		{#each AI_MESSAGES as m (m.title)}
			<div class="card">
				<div style="font-family:var(--font-sans);font-size:16px;font-weight:700;color:var(--ink);margin-bottom:4px">{m.title}</div>
				<div style="font-family:var(--font-mono);font-size:12px;color:var(--ink-soft)">{m.sub}<b style="color:var(--amber)">{m.bold}</b></div>
			</div>
		{/each}
	</div>
</div>
```

- [ ] **Step 8: Create `src/routes/demo/dashboard/laporan/+page.svelte`**

```svelte
<script lang="ts">
	import { FileText } from '@lucide/svelte';
</script>

<svelte:head><title>Laporan · Command Center</title></svelte:head>

<div class="demo-stub">
	<FileText size={40} />
	<h2>Laporan</h2>
	<p>Modul laporan mingguan & ekspor PDF — segera hadir.</p>
</div>
```

- [ ] **Step 9: Create `src/routes/demo/dashboard/pengaturan/+page.svelte`**

```svelte
<script lang="ts">
	import { Settings } from '@lucide/svelte';
</script>

<svelte:head><title>Pengaturan · Command Center</title></svelte:head>

<div class="demo-stub">
	<Settings size={40} />
	<h2>Pengaturan</h2>
	<p>Konfigurasi ambang batas, pengguna & notifikasi — segera hadir.</p>
</div>
```

- [ ] **Step 10: Verify**

Run: `npm run check` → 0 errors. Then `npm run dev`, log in, and click through every sidebar item:
- **Jaringan Sites**: map + searchable table; typing in the search filters rows.
- **Hidrologi**: full-width AWLR + rainfall charts.
- **Perangkat**: pump grid + alert feed.
- **Kualitas Air**: 4 gauges (TSS shows amber/out-of-range).
- **Notifikasi**: full alert list.
- **ARGO AI**: ribbon + 3 recommendation cards.
- **Laporan / Pengaturan**: centered "segera hadir" stubs.
- Each item highlights in the sidebar when active.
Stop the dev server.

- [ ] **Step 11: Commit**

```bash
git add src/lib/components/demo-dashboard/PageHead.svelte src/routes/demo/dashboard/sites src/routes/demo/dashboard/hidrologi src/routes/demo/dashboard/perangkat src/routes/demo/dashboard/kualitas-air src/routes/demo/dashboard/notifikasi src/routes/demo/dashboard/argo src/routes/demo/dashboard/laporan src/routes/demo/dashboard/pengaturan
git commit -m "feat(demo-dashboard): secondary pages (sites, hidrologi, perangkat, kualitas-air, notifikasi, argo, stubs)"
```

---

## Task 14: Final verification — build + full walkthrough

**Files:** none (verification only)

- [ ] **Step 1: Type check**

Run: `npm run check`
Expected: 0 errors.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: build completes with no errors. (Note: with `ssr = false` the dashboard pages are client-rendered; the build should still succeed and prerender nothing under `/demo/dashboard`.)

- [ ] **Step 3: Preview the production build**

Run: `npm run preview`. Open the printed URL and verify the full flow end-to-end against the success criteria:
1. `/demo/dashboard` (no cookie) → redirects to `/demo/login`.
2. **Masuk** → Overview command center matching slide 14 (KPIs, live map with pulsing alarm, AWLR + rainfall drifting, pumps, WQ gauges, ARGO ticker), live clock ticking.
3. Sidebar navigates all pages; active highlight correct.
4. Marketing `/` still has Header/Footer; no demo chrome leaks.
5. **Keluar** → returns to `/demo/login`; revisiting `/demo/dashboard` redirects to login again.
Stop the preview server.

- [ ] **Step 4: Confirm the URL to share**

The dashboard lives at **`/demo/dashboard`** (login at `/demo/login`). No marketing nav link is added (per the design decision to keep it a custom route). Report this URL to the user.

- [ ] **Step 5: Final commit (if any uncommitted verification tweaks)**

```bash
git status
# If clean, nothing to do. Otherwise:
git add -A && git commit -m "chore(demo-dashboard): final verification fixes"
```

---

## Self-Review Notes (author)

- **Spec coverage:** route structure (Task 2, 13), layout isolation (Task 1 step 5), dummy auth login/guard/logout (Task 2), sidebar+topbar shell (Task 3), Overview replica (Task 12), all widgets (Tasks 4–11), secondary pages incl. stubs (Task 13), map via copied geojson + SVG port (Tasks 1, 5), live animation (each widget's `onMount` interval), success criteria (Task 14). All spec sections map to a task.
- **Out-of-scope items** (per spec) intentionally absent: per-site drill-down, time-range filters, real auth, i18n.
- **Type consistency:** `SiteStatus` reused across `Site`/`Pump`/`Alert`; `GeoPath` from `data.ts` used by `NationalMap`; `project`/`loadGeo` signatures `(lon,lat,vw,vh)`/`(vw,vh)` consistent between `data.ts` and `NationalMap`; `compact` prop optional-boolean on every widget; `NAV[].icon` strings exactly match the keys in `Sidebar.svelte`'s `icons` map (`LayoutDashboard, MapPin, Waves, Cpu, FlaskConical, Bell, Sparkles, FileText, Settings`).
- **Note on `throw redirect`:** SvelteKit 2 also allows `redirect(...)` without `throw`; `throw redirect(...)` is used for clarity and is fully supported.
