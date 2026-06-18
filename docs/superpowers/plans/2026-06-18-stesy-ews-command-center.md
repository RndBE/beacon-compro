# STESY EWS Command Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the `allinone` "STESY Command Center" into `beacon-compro` as a new, self-contained disaster-management & early-warning demo at `/demo/ews`, re-themed to the Beacon Engineering design system and seeded around Yogyakarta (DIY).

**Architecture:** Native SvelteKit port. Components move ~1:1 from `allinone` (Svelte 5 runes → Svelte 5 runes); the custom history-router is dropped for SvelteKit file routing + `goto()`; the Node chat server becomes a `+server.ts`; a layout reset (`+layout@.svelte`) isolates STESY from the existing `/demo` shell while keeping the `/demo` URL prefix that hides the marketing Header/Footer. Pure-domain logic (status/format/series/derive/seed) is TDD'd; visual components are ported and verified by typecheck + manual run.

**Tech Stack:** SvelteKit 2.57, Svelte 5.55 (runes), Vite 8, Tailwind 4, TypeScript (strict), `leaflet@1.9.4` (already present), `@lucide/svelte` (already present), `openai` (new dep), `vitest` (new devDep), `adapter-node`.

## Global Constraints

- **Source app:** `/Users/tessa/Documents/allinone` (read-only reference to port from). **Material:** `/Users/tessa/Downloads/BPBD`. **Target:** `/Users/tessa/Documents/beacon-compro` (current repo).
- **Svelte 5 runes only** (`$state`, `$derived`, `$props`, `$effect`); no Svelte 4 syntax. TypeScript strict mode.
- **Do NOT modify** `src/routes/demo/dashboard/**`, `src/lib/components/demo-dashboard/**`, or `src/routes/presentasi/**` / `src/lib/presentasi/**`. STESY is additive.
- **All STESY library code** lives under `src/lib/ews/`; **all STESY components** under `src/lib/components/ews/`; **all STESY routes** under `src/routes/demo/ews/`; **all STESY static assets** under `static/demo/ews/`.
- **All STESY CSS tokens** are scoped under a root `.stesy` class to prevent bleed; videowall is pinned dark, dashboard supports a dark+light toggle.
- **Product name:** "STESY". **Language:** Bahasa Indonesia for UI copy. **Siaga colors:** Normal `#1F8A5C`, Waspada `#C77A1B`, Siaga `#E08A3C`, Awas `#B5322C`; brass accent `#C8A878`, signal blue `#3E8BFF`, base navy `#1C1C41`.
- **Fonts:** Montserrat (UI) + JetBrains Mono (data values).
- **SSR safety:** Leaflet and the simulation clock are browser-only — never touch `window`/timers during SSR (`import { browser } from '$app/environment'`, work in `onMount`).
- **Commit** after each task with a `feat:`/`test:`/`chore:` message scoped `ews:`.

---

## File Structure

```
src/lib/ews/
  types.ts                # domain model
  status.ts               # Siaga levels + ordering helpers
  format.ts               # id-ID number/date formatting
  series.ts               # time-series helpers (history windows, deltas)
  derive.ts               # per-asset status derivation + ETA-to-next-Siaga
  stores.ts               # global stores + live simulation (browser-guarded)
  theme.ts                # dark/light store (dashboard only)
  instruments.ts          # sensor-type -> lucide icon map
  config/nav.ts           # 6 module tab definitions
  data/seed.ts            # Yogyakarta mock dataset
  data/geojson.ts         # DIY boundary loader
  *.test.ts               # vitest unit tests (pure helpers)

src/lib/components/ews/
  ui/        Panel KpiCard Gauge LevelBar Sparkline MiniChart WallDonut ScatterPlot
             StatusBadge Delta Clock Button LogoutModal
  layout/    TopBar TabNav Logo Emblem
  map/       BasinMap MapLegend WallMapControls
  cctv/      CctvPanel WallCctvPanel CameraTile
  chat/      InteractiveChatbot WallChatbot chatClient.ts
  panels/    AlertPanel DetailDrawer InstrumentCard
  modules/   RingkasanModule PeringatanDiniModule LongsorModule
             DiseminasiModule EvakuasiModule AnalisaModule
  views/     WallView WallUnavailable AssetDetailPage LoginView
  icons/     StationIcon
  theme.css  # BE-DS tokens scoped under .stesy (dark + light)

src/routes/demo/ews/
  +layout@.svelte         # layout reset to root + STESY shell (SINGLE file; SvelteKit
                          #   forbids both +layout.svelte and +layout@.svelte in one dir)
  +page.svelte            # redirect -> ringkasan
  login/+page.svelte
  ringkasan/+page.svelte
  peringatan-dini/+page.svelte
  longsor/+page.svelte
  diseminasi/+page.svelte
  evakuasi/+page.svelte
  analisa/+page.svelte
  wall/+page.svelte
  [kind]/[id]/+page.svelte
  api/chat/+server.ts

static/demo/ews/
  diy.geojson
  img/ (station-full.png station-siren.png station-tech.png system-diagram.png logo-be.png)
  cctv/ (placeholder camera stills)
```

**Port-recipe convention (used by component tasks):** "Port `<src>` → `<dst>`" means: copy the file, then apply the **standard port transforms** unless the task says otherwise:
1. Rewrite imports: `$lib/...` is NOT used by allinone (it uses relative `../`); convert all cross-module imports to `$lib/ews/...` or `$lib/components/ews/...`.
2. Remove any `router.ts` import; replace `navigate(path)` / history calls with SvelteKit `import { goto } from '$app/navigation'` and `goto(path)`.
3. Replace hardcoded allinone color/token classes with the `.stesy` token equivalents (Task 11 defines them).
4. Apply domain renames per the **Domain rename map** (Task 3) where the component references water-resources concepts that change.
5. Guard any `window`/`document`/Leaflet/`setInterval` access with `browser` / `onMount`.
6. After porting a group, run `npm run check` and fix type errors before committing.

---

## Phase 0 — Scaffolding & dependencies

### Task 1: Add dependencies and the vitest harness

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/lib/ews/smoke.test.ts`

**Interfaces:**
- Produces: an `npm test` script running vitest over `src/**/*.test.ts`.

- [ ] **Step 1: Add deps**

Run:
```bash
cd /Users/tessa/Documents/beacon-compro
npm install openai
npm install -D vitest
```
Expected: `openai` appears under `dependencies`, `vitest` under `devDependencies` in `package.json`.

- [ ] **Step 2: Add the test script**

In `package.json` `scripts`, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
});
```

- [ ] **Step 4: Write a smoke test**

`src/lib/ews/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest';

describe('vitest harness', () => {
	it('runs', () => {
		expect(1 + 1).toBe(2);
	});
});
```

- [ ] **Step 5: Run it**

Run: `npm test`
Expected: PASS, 1 test passed.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/ews/smoke.test.ts
git commit -m "chore(ews): add openai dep and vitest harness"
```

---

### Task 2: Route skeleton + layout isolation + login gate

**Files:**
- Create: `src/routes/demo/ews/+layout@.svelte` (layout reset)
- Create: `src/routes/demo/ews/+layout.svelte` (shell placeholder)
- Create: `src/routes/demo/ews/+page.svelte` (redirect)
- Create: `src/routes/demo/ews/login/+page.svelte`
- Create: `src/lib/ews/auth.ts`

**Interfaces:**
- Produces: `auth.ts` exports `isAuthed: Writable<boolean>`, `login(): void`, `logout(): void` (sessionStorage-backed). Route `/demo/ews` redirects to `/demo/ews/login` when not authed, else `/demo/ews/ringkasan`.

- [ ] **Step 1: Layout reset**

`src/routes/demo/ews/+layout@.svelte` (the `@` resets inheritance to the root layout, skipping `/demo/+layout.svelte`):
```svelte
<script lang="ts">
	let { children } = $props();
</script>

{@render children()}
```

- [ ] **Step 2: Auth store**

`src/lib/ews/auth.ts`:
```ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const KEY = 'stesy-demo-auth';
const initial = browser && sessionStorage.getItem(KEY) === '1';

export const isAuthed = writable<boolean>(initial);

export function login(): void {
	if (browser) sessionStorage.setItem(KEY, '1');
	isAuthed.set(true);
}

export function logout(): void {
	if (browser) sessionStorage.removeItem(KEY);
	isAuthed.set(false);
}
```

- [ ] **Step 3: Shell placeholder**

`src/routes/demo/ews/+layout.svelte` (chrome added in Task 12; placeholder proves isolation now):
```svelte
<script lang="ts">
	let { children } = $props();
</script>

<div class="stesy min-h-screen bg-[#1C1C41] text-white">
	{@render children()}
</div>
```

- [ ] **Step 4: Redirect index**

`src/routes/demo/ews/+page.svelte`:
```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthed } from '$lib/ews/auth';
	import { get } from 'svelte/store';

	onMount(() => {
		goto(get(isAuthed) ? '/demo/ews/ringkasan' : '/demo/ews/login', { replaceState: true });
	});
</script>
```

- [ ] **Step 5: Login page**

`src/routes/demo/ews/login/+page.svelte`:
```svelte
<script lang="ts">
	import { goto } from '$app/navigation';
	import { login } from '$lib/ews/auth';

	let user = $state('');
	let pass = $state('');

	function submit(e: Event) {
		e.preventDefault();
		login();
		goto('/demo/ews/ringkasan');
	}
</script>

<form onsubmit={submit} class="mx-auto mt-40 flex max-w-sm flex-col gap-3 p-6">
	<h1 class="text-xl font-semibold">STESY — Login</h1>
	<input bind:value={user} placeholder="Operator" class="rounded bg-white/10 p-2" />
	<input bind:value={pass} type="password" placeholder="Sandi" class="rounded bg-white/10 p-2" />
	<button class="rounded bg-[#C8A878] p-2 font-medium text-[#1C1C41]">Masuk</button>
</form>
```

- [ ] **Step 6: Verify isolation manually**

Run: `npm run dev` then open `/demo/ews/login`.
Expected: login screen renders on a navy background, **no** marketing Header/Footer, **no** `.demo-deck` wrapper styles (inspect: the `.stesy` div is a direct child of the root layout `{@render children()}`, not inside `.demo-deck`). Submitting redirects to `/demo/ews/ringkasan` (404 page body is fine for now — route added later).

- [ ] **Step 7: Typecheck & commit**

Run: `npm run check`
Expected: no new errors.
```bash
git add src/routes/demo/ews src/lib/ews/auth.ts
git commit -m "feat(ews): route skeleton, layout reset isolation, demo login gate"
```

---

## Phase 1 — Domain core (TDD)

### Task 3: Domain types + domain rename map

**Files:**
- Create: `src/lib/ews/types.ts`
- Reference: `/Users/tessa/Documents/allinone/src/lib/types.ts`

**Interfaces:**
- Produces the domain model consumed by every later task. Key exported types below.

**Domain rename map** (apply throughout the port wherever water-resources concepts appear):

| allinone concept | STESY EWS concept |
| --- | --- |
| `Bendungan` (dam) module/data | `Longsor` (landslide) sensors + risk zones |
| `Irigasi` / `Sumur` (irrigation/wells) | `Diseminasi` (siren nodes + channels) |
| `DI` (daerah irigasi) | dropped |
| `Pos` (kept) | `Pos` water-level (TMA) + rainfall (ARR) stations |
| dam geojson loaders | DIY boundary loader |

- [ ] **Step 1: Write the types**

`src/lib/ews/types.ts`:
```ts
export type Siaga = 'normal' | 'waspada' | 'siaga' | 'awas';

export type PosKind = 'tma' | 'arr'; // water level | rainfall

export interface Thresholds {
	waspada: number;
	siaga: number;
	awas: number;
}

export interface HistPoint {
	t: number; // unix ms
	v: number;
}

export interface Pos {
	id: string;
	nama: string;
	kind: PosKind;
	sungai: string; // e.g. "Kali Code"
	lat: number;
	lng: number;
	unit: string; // "m" | "mm"
	value: number;
	thresholds: Thresholds;
	status: Siaga;
	history: HistPoint[];
}

export interface LandslideSensor {
	id: string;
	nama: string;
	lokasi: string; // "Kulon Progo - Menoreh"
	lat: number;
	lng: number;
	movementMm: number; // extensometer
	movementThreshold: number;
	rainAccumMm: number;
	rainThreshold: number;
	status: Siaga;
	history: HistPoint[];
}

export type ChannelKind = 'sirine' | 'wa' | 'sms' | 'push' | 'telegram';

export interface SirenNode {
	id: string;
	nama: string;
	sungai: string;
	lat: number;
	lng: number;
	armed: boolean;
	lastTest: number; // unix ms
	status: Siaga;
}

export interface Channel {
	kind: ChannelKind;
	label: string;
	online: boolean;
	reach: number; // recipients
}

export interface Shelter {
	id: string;
	nama: string;
	lokasi: string;
	lat: number;
	lng: number;
	kapasitas: number;
	terisi: number;
}

export interface AffectedArea {
	id: string;
	nama: string;
	terdampakKK: number; // households
	jiwa: number; // people
	status: Siaga;
}

export interface OpAsset {
	id: string;
	nama: string;
	jenis: 'pompa' | 'tanggul';
	lat: number;
	lng: number;
	kondisi: number; // 0..100
	operasional: boolean;
}

export interface Earthquake {
	id: string;
	t: number;
	mag: number;
	depthKm: number;
	lokasi: string;
	lat: number;
	lng: number;
}

export interface AlertItem {
	id: string;
	t: number;
	kind: 'tma' | 'arr' | 'longsor' | 'gempa' | 'sirine';
	refId: string;
	nama: string;
	from: Siaga;
	to: Siaga;
	pesan: string;
}

export type AssetKind = 'pos' | 'longsor' | 'sirine' | 'shelter' | 'op';

export interface MapMarker {
	id: string;
	kind: AssetKind;
	nama: string;
	lat: number;
	lng: number;
	status: Siaga;
}

export interface DemoData {
	pos: Pos[];
	longsor: LandslideSensor[];
	sirens: SirenNode[];
	channels: Channel[];
	shelters: Shelter[];
	areas: AffectedArea[];
	op: OpAsset[];
	quakes: Earthquake[];
	alerts: AlertItem[];
}
```

- [ ] **Step 2: Typecheck & commit**

Run: `npm run check`
Expected: no errors (types only).
```bash
git add src/lib/ews/types.ts
git commit -m "feat(ews): disaster/EWS domain types"
```

---

### Task 4: Siaga status helpers (TDD)

**Files:**
- Create: `src/lib/ews/status.ts`
- Test: `src/lib/ews/status.test.ts`

**Interfaces:**
- Produces: `SIAGA_ORDER: Siaga[]`, `siagaRank(s: Siaga): number`, `worst(a: Siaga, b: Siaga): Siaga`, `worstOf(list: Siaga[]): Siaga`, `siagaLabel(s: Siaga): string`, `SIAGA_COLOR: Record<Siaga,string>`.

- [ ] **Step 1: Write failing tests**

`src/lib/ews/status.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { siagaRank, worst, worstOf, siagaLabel, SIAGA_COLOR } from './status';

describe('siaga status', () => {
	it('ranks normal < waspada < siaga < awas', () => {
		expect(siagaRank('normal')).toBeLessThan(siagaRank('waspada'));
		expect(siagaRank('waspada')).toBeLessThan(siagaRank('siaga'));
		expect(siagaRank('siaga')).toBeLessThan(siagaRank('awas'));
	});
	it('worst returns the higher-rank status', () => {
		expect(worst('normal', 'siaga')).toBe('siaga');
		expect(worst('awas', 'waspada')).toBe('awas');
	});
	it('worstOf returns the max over a list, normal for empty', () => {
		expect(worstOf(['normal', 'waspada', 'awas', 'siaga'])).toBe('awas');
		expect(worstOf([])).toBe('normal');
	});
	it('labels are Indonesian', () => {
		expect(siagaLabel('awas')).toBe('Awas');
		expect(siagaLabel('normal')).toBe('Normal');
	});
	it('maps every level to a hex color', () => {
		expect(SIAGA_COLOR.awas).toBe('#B5322C');
		expect(SIAGA_COLOR.siaga).toBe('#E08A3C');
		expect(SIAGA_COLOR.waspada).toBe('#C77A1B');
		expect(SIAGA_COLOR.normal).toBe('#1F8A5C');
	});
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm test`
Expected: FAIL (`status` module not found / exports undefined).

- [ ] **Step 3: Implement**

`src/lib/ews/status.ts`:
```ts
import type { Siaga } from './types';

export const SIAGA_ORDER: Siaga[] = ['normal', 'waspada', 'siaga', 'awas'];

export function siagaRank(s: Siaga): number {
	return SIAGA_ORDER.indexOf(s);
}

export function worst(a: Siaga, b: Siaga): Siaga {
	return siagaRank(a) >= siagaRank(b) ? a : b;
}

export function worstOf(list: Siaga[]): Siaga {
	return list.reduce<Siaga>((acc, s) => worst(acc, s), 'normal');
}

const LABELS: Record<Siaga, string> = {
	normal: 'Normal',
	waspada: 'Waspada',
	siaga: 'Siaga',
	awas: 'Awas'
};

export function siagaLabel(s: Siaga): string {
	return LABELS[s];
}

export const SIAGA_COLOR: Record<Siaga, string> = {
	normal: '#1F8A5C',
	waspada: '#C77A1B',
	siaga: '#E08A3C',
	awas: '#B5322C'
};
```

- [ ] **Step 4: Run to confirm pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ews/status.ts src/lib/ews/status.test.ts
git commit -m "feat(ews): siaga status helpers with tests"
```

---

### Task 5: id-ID formatting helpers (TDD)

**Files:**
- Create: `src/lib/ews/format.ts`
- Test: `src/lib/ews/format.test.ts`
- Reference: `/Users/tessa/Documents/allinone/src/lib/format.ts`

**Interfaces:**
- Produces: `num(v, digits=1): string`, `fmtUnit(v, unit, digits=1): string`, `timeHM(t: number): string`, `dateShort(t: number): string`.

- [ ] **Step 1: Failing tests**

`src/lib/ews/format.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { num, fmtUnit, timeHM } from './format';

describe('format', () => {
	it('formats numbers id-ID with given digits', () => {
		expect(num(1234.5, 1)).toBe('1.234,5');
		expect(num(2, 0)).toBe('2');
	});
	it('appends unit', () => {
		expect(fmtUnit(2.6, 'm', 1)).toBe('2,6 m');
	});
	it('formats time as HH.MM (id-ID 24h)', () => {
		// 2026-06-18T02:05:00Z -> use a fixed local-independent check on shape
		expect(timeHM(Date.UTC(2026, 5, 18, 2, 5))).toMatch(/\d{2}[.:]\d{2}/);
	});
});
```

- [ ] **Step 2: Confirm failure** — Run: `npm test` → FAIL.

- [ ] **Step 3: Implement**

`src/lib/ews/format.ts`:
```ts
const ID = 'id-ID';

export function num(v: number, digits = 1): string {
	return new Intl.NumberFormat(ID, {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	}).format(v);
}

export function fmtUnit(v: number, unit: string, digits = 1): string {
	return `${num(v, digits)} ${unit}`;
}

export function timeHM(t: number): string {
	return new Intl.DateTimeFormat(ID, {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	}).format(new Date(t));
}

export function dateShort(t: number): string {
	return new Intl.DateTimeFormat(ID, {
		day: '2-digit',
		month: 'short'
	}).format(new Date(t));
}
```

- [ ] **Step 4: Confirm pass** — Run: `npm test` → PASS.

- [ ] **Step 5: Commit**
```bash
git add src/lib/ews/format.ts src/lib/ews/format.test.ts
git commit -m "feat(ews): id-ID formatting helpers with tests"
```

---

### Task 6: Time-series helpers (TDD)

**Files:**
- Create: `src/lib/ews/series.ts`
- Test: `src/lib/ews/series.test.ts`
- Reference: `/Users/tessa/Documents/allinone/src/lib/series.ts`

**Interfaces:**
- Produces: `lastN(h: HistPoint[], n: number): HistPoint[]`, `delta(h: HistPoint[], n: number): number` (value change over last n points), `riseRatePerHour(h: HistPoint[]): number`, `minMax(h: HistPoint[]): {min:number;max:number}`.

- [ ] **Step 1: Failing tests**

`src/lib/ews/series.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { lastN, delta, riseRatePerHour, minMax } from './series';
import type { HistPoint } from './types';

const H: HistPoint[] = [
	{ t: 0, v: 2.0 },
	{ t: 3_600_000, v: 2.2 },
	{ t: 7_200_000, v: 2.6 }
];

describe('series', () => {
	it('lastN slices the tail', () => {
		expect(lastN(H, 2)).toEqual([H[1], H[2]]);
		expect(lastN(H, 10)).toEqual(H);
	});
	it('delta over last n points', () => {
		expect(delta(H, 2)).toBeCloseTo(0.4, 5); // 2.6 - 2.2
	});
	it('riseRatePerHour uses first/last over elapsed hours', () => {
		expect(riseRatePerHour(H)).toBeCloseTo(0.3, 5); // (2.6-2.0)/2h
	});
	it('minMax', () => {
		expect(minMax(H)).toEqual({ min: 2.0, max: 2.6 });
	});
});
```

- [ ] **Step 2: Confirm failure** — Run: `npm test` → FAIL.

- [ ] **Step 3: Implement**

`src/lib/ews/series.ts`:
```ts
import type { HistPoint } from './types';

export function lastN(h: HistPoint[], n: number): HistPoint[] {
	return n >= h.length ? h.slice() : h.slice(h.length - n);
}

export function delta(h: HistPoint[], n: number): number {
	const w = lastN(h, n);
	if (w.length < 2) return 0;
	return w[w.length - 1].v - w[0].v;
}

export function riseRatePerHour(h: HistPoint[]): number {
	if (h.length < 2) return 0;
	const a = h[0];
	const b = h[h.length - 1];
	const hours = (b.t - a.t) / 3_600_000;
	return hours === 0 ? 0 : (b.v - a.v) / hours;
}

export function minMax(h: HistPoint[]): { min: number; max: number } {
	if (h.length === 0) return { min: 0, max: 0 };
	let min = h[0].v;
	let max = h[0].v;
	for (const p of h) {
		if (p.v < min) min = p.v;
		if (p.v > max) max = p.v;
	}
	return { min, max };
}
```

- [ ] **Step 4: Confirm pass** — Run: `npm test` → PASS.

- [ ] **Step 5: Commit**
```bash
git add src/lib/ews/series.ts src/lib/ews/series.test.ts
git commit -m "feat(ews): time-series helpers with tests"
```

---

### Task 7: Status derivation + ETA-to-next-Siaga (TDD)

**Files:**
- Create: `src/lib/ews/derive.ts`
- Test: `src/lib/ews/derive.test.ts`
- Reference: `/Users/tessa/Documents/allinone/src/lib/data/derive.ts`

**Interfaces:**
- Consumes: `Thresholds`, `Siaga`, `HistPoint` from `types.ts`; `riseRatePerHour` from `series.ts`.
- Produces: `deriveTmaStatus(value: number, t: Thresholds): Siaga`, `deriveLandslideStatus(movementMm, movementThreshold, rainAccumMm, rainThreshold): Siaga`, `etaToNextSiagaHours(value: number, t: Thresholds, history: HistPoint[]): number | null` (hours until the next higher threshold at current rise rate; `null` if not rising or already at awas).

- [ ] **Step 1: Failing tests**

`src/lib/ews/derive.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { deriveTmaStatus, deriveLandslideStatus, etaToNextSiagaHours } from './derive';
import type { Thresholds, HistPoint } from './types';

const T: Thresholds = { waspada: 2.5, siaga: 3.0, awas: 4.0 };

describe('deriveTmaStatus', () => {
	it('classifies by threshold (>= boundary escalates)', () => {
		expect(deriveTmaStatus(2.0, T)).toBe('normal');
		expect(deriveTmaStatus(2.5, T)).toBe('waspada');
		expect(deriveTmaStatus(3.0, T)).toBe('siaga');
		expect(deriveTmaStatus(4.1, T)).toBe('awas');
	});
});

describe('deriveLandslideStatus', () => {
	it('escalates when movement or rain crosses threshold', () => {
		expect(deriveLandslideStatus(1, 10, 10, 100)).toBe('normal');
		expect(deriveLandslideStatus(11, 10, 10, 100)).toBe('awas');
		expect(deriveLandslideStatus(1, 10, 80, 100)).toBe('waspada'); // 80% rain
	});
});

describe('etaToNextSiagaHours', () => {
	it('estimates hours to next threshold from rise rate', () => {
		// value 2.6 (waspada), next = siaga 3.0, rising 0.2 m/h over history
		const hist: HistPoint[] = [
			{ t: 0, v: 2.2 },
			{ t: 7_200_000, v: 2.6 } // 0.4 m rise over 2h = 0.2 m/h
		];
		const eta = etaToNextSiagaHours(2.6, T, hist);
		expect(eta).toBeCloseTo(2.0, 1); // (3.0-2.6)/0.2 = 2h
	});
	it('returns null when not rising', () => {
		const flat: HistPoint[] = [
			{ t: 0, v: 2.6 },
			{ t: 3_600_000, v: 2.6 }
		];
		expect(etaToNextSiagaHours(2.6, T, flat)).toBeNull();
	});
	it('returns null at awas (no next level)', () => {
		const hist: HistPoint[] = [
			{ t: 0, v: 4.0 },
			{ t: 3_600_000, v: 4.5 }
		];
		expect(etaToNextSiagaHours(4.5, T, hist)).toBeNull();
	});
});
```

- [ ] **Step 2: Confirm failure** — Run: `npm test` → FAIL.

- [ ] **Step 3: Implement**

`src/lib/ews/derive.ts`:
```ts
import type { Siaga, Thresholds, HistPoint } from './types';
import { riseRatePerHour } from './series';

export function deriveTmaStatus(value: number, t: Thresholds): Siaga {
	if (value >= t.awas) return 'awas';
	if (value >= t.siaga) return 'siaga';
	if (value >= t.waspada) return 'waspada';
	return 'normal';
}

export function deriveLandslideStatus(
	movementMm: number,
	movementThreshold: number,
	rainAccumMm: number,
	rainThreshold: number
): Siaga {
	const m = movementMm / movementThreshold;
	const r = rainAccumMm / rainThreshold;
	const ratio = Math.max(m, r);
	if (ratio >= 1) return 'awas';
	if (ratio >= 0.85) return 'siaga';
	if (ratio >= 0.7) return 'waspada';
	return 'normal';
}

export function etaToNextSiagaHours(
	value: number,
	t: Thresholds,
	history: HistPoint[]
): number | null {
	const next = value < t.waspada ? t.waspada : value < t.siaga ? t.siaga : value < t.awas ? t.awas : null;
	if (next === null) return null;
	const rate = riseRatePerHour(history);
	if (rate <= 0) return null;
	return (next - value) / rate;
}
```

- [ ] **Step 4: Confirm pass** — Run: `npm test` → PASS.

- [ ] **Step 5: Commit**
```bash
git add src/lib/ews/derive.ts src/lib/ews/derive.test.ts
git commit -m "feat(ews): status derivation + ETA-to-next-siaga with tests"
```

---

### Task 8: Seed data + simulation store

**Files:**
- Create: `src/lib/ews/data/seed.ts`
- Create: `src/lib/ews/stores.ts`
- Test: `src/lib/ews/data/seed.test.ts`
- Reference: `/Users/tessa/Documents/allinone/src/lib/data/seed.ts`, `/Users/tessa/Documents/allinone/src/lib/stores.ts`

**Interfaces:**
- Consumes: types, `deriveTmaStatus`, `deriveLandslideStatus`, `worstOf`.
- Produces:
  - `seed.ts`: `buildData(clock: number): DemoData` — deterministic given `clock`; stations are Yogyakarta locations; histories are 48 points hourly ending at `clock`; statuses derived; alerts generated for any non-normal asset.
  - `stores.ts`: `clock: Readable<number>`, `data: Readable<DemoData>`, `markers: Readable<MapMarker[]>`, `activeAlerts: Readable<AlertItem[]>`, `overallStatus: Readable<Siaga>`, `statusCounts: Readable<Record<Siaga, number>>`, `startSimulation(): () => void` (browser-only; returns stop fn).

- [ ] **Step 1: Failing tests for seed shape**

`src/lib/ews/data/seed.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { buildData } from './seed';

describe('buildData', () => {
	const d = buildData(1_750_000_000_000);
	it('produces Yogyakarta stations with 48-pt histories', () => {
		expect(d.pos.length).toBeGreaterThanOrEqual(6);
		expect(d.pos[0].history).toHaveLength(48);
		expect(d.pos.some((p) => /Code|Gajah Wong|Winongo|Opak|Boyong/.test(p.sungai))).toBe(true);
	});
	it('includes landslide, sirens, shelters, quakes', () => {
		expect(d.longsor.length).toBeGreaterThan(0);
		expect(d.sirens.length).toBeGreaterThan(0);
		expect(d.shelters.length).toBeGreaterThan(0);
		expect(d.quakes.length).toBeGreaterThan(0);
	});
	it('is deterministic for a given clock', () => {
		const a = buildData(1_750_000_000_000);
		const b = buildData(1_750_000_000_000);
		expect(a.pos[0].value).toBe(b.pos[0].value);
	});
	it('generates alerts for non-normal assets only', () => {
		for (const al of d.alerts) {
			expect(al.to).not.toBe('normal');
		}
	});
});
```

- [ ] **Step 2: Confirm failure** — Run: `npm test` → FAIL.

- [ ] **Step 3: Implement `seed.ts`**

Port allinone's `seed.ts` structure (seeded pseudo-random via a hash of `clock`+id, 48-point hourly history, smooth drift). Replace the dam/irrigation/well datasets with: ~8 `Pos` on Kali Code/Gajah Wong/Winongo/Opak + Boyong-Gendol-Kuning (mix of `tma`/`arr`), ~4 `LandslideSensor` (Kulon Progo Menoreh, Gunungkidul), ~5 `SirenNode` along Kali Code, a fixed `Channel[]` (sirine/wa/sms/push/telegram), ~4 `Shelter` (Sleman/Bantul), ~4 `AffectedArea`, ~4 `OpAsset` (pompa/tanggul), ~5 `Earthquake` (Opak-fault area, small mags). Coordinates within DIY bbox lat −8.2..−7.5, lng 110.0..110.9. Derive statuses with `deriveTmaStatus`/`deriveLandslideStatus`; build `alerts` from any non-normal asset (`to = asset.status`, `from = 'normal'`, Indonesian `pesan`). Use a deterministic PRNG (e.g. mulberry32 seeded from `clock`) — **no `Math.random()`** so tests are stable.

- [ ] **Step 4: Implement `stores.ts`**

```ts
import { readable, derived, type Readable } from 'svelte/store';
import { browser } from '$app/environment';
import { buildData } from './data/seed';
import { worstOf } from './status';
import type { DemoData, MapMarker, AlertItem, Siaga } from './types';

const TICK_MS = 4000;
const HOUR = 3_600_000;
// Fixed demo epoch so SSR and first client render agree; advances client-side.
const EPOCH = 1_750_000_000_000;

export const clock: Readable<number> = readable(EPOCH, (set) => {
	if (!browser) return; // SSR: stay at EPOCH
	let i = 0;
	const id = setInterval(() => {
		i += 1;
		set(EPOCH + i * HOUR); // advance one "hour" of sim per tick
	}, TICK_MS);
	return () => clearInterval(id);
});

export const data: Readable<DemoData> = derived(clock, ($c) => buildData($c));

export const markers: Readable<MapMarker[]> = derived(data, ($d) => {
	const out: MapMarker[] = [];
	for (const p of $d.pos) out.push({ id: p.id, kind: 'pos', nama: p.nama, lat: p.lat, lng: p.lng, status: p.status });
	for (const l of $d.longsor) out.push({ id: l.id, kind: 'longsor', nama: l.nama, lat: l.lat, lng: l.lng, status: l.status });
	for (const s of $d.sirens) out.push({ id: s.id, kind: 'sirine', nama: s.nama, lat: s.lat, lng: s.lng, status: s.status });
	for (const sh of $d.shelters) out.push({ id: sh.id, kind: 'shelter', nama: sh.nama, lat: sh.lat, lng: sh.lng, status: 'normal' });
	for (const o of $d.op) out.push({ id: o.id, kind: 'op', nama: o.nama, lat: o.lat, lng: o.lng, status: o.operasional ? 'normal' : 'waspada' });
	return out;
});

export const activeAlerts: Readable<AlertItem[]> = derived(data, ($d) =>
	[...$d.alerts].sort((a, b) => b.t - a.t)
);

export const overallStatus: Readable<Siaga> = derived(markers, ($m) => worstOf($m.map((x) => x.status)));

export const statusCounts: Readable<Record<Siaga, number>> = derived(markers, ($m) => {
	const c: Record<Siaga, number> = { normal: 0, waspada: 0, siaga: 0, awas: 0 };
	for (const m of $m) c[m.status] += 1;
	return c;
});

export function startSimulation(): () => void {
	// clock is a lazy readable: subscribing starts the interval, unsub stops it.
	const unsub = clock.subscribe(() => {});
	return unsub;
}
```

- [ ] **Step 5: Confirm seed tests pass** — Run: `npm test` → PASS.

- [ ] **Step 6: Typecheck & commit**

Run: `npm run check` → no errors.
```bash
git add src/lib/ews/data/seed.ts src/lib/ews/data/seed.test.ts src/lib/ews/stores.ts
git commit -m "feat(ews): Yogyakarta seed data + live simulation stores"
```

---

## Phase 2 — Data assets

### Task 9: DIY GeoJSON + BPBD images + CCTV stills

**Files:**
- Create: `static/demo/ews/diy.geojson`
- Create: `static/demo/ews/img/*` (copied from BPBD)
- Create: `static/demo/ews/cctv/*` (placeholder stills)
- Create: `src/lib/ews/data/geojson.ts`

**Interfaces:**
- Produces: `geojson.ts` exports `DIY_GEOJSON_URL = '/demo/ews/diy.geojson'` and `loadDiyBoundary(): Promise<GeoJSON.FeatureCollection>` (browser fetch).

- [ ] **Step 1: Copy BPBD images**

Run:
```bash
mkdir -p static/demo/ews/img static/demo/ews/cctv
cp "/Users/tessa/Downloads/BPBD/img/station-full.png" static/demo/ews/img/
cp "/Users/tessa/Downloads/BPBD/img/station-siren.png" static/demo/ews/img/
cp "/Users/tessa/Downloads/BPBD/img/station-tech.png" static/demo/ews/img/
cp "/Users/tessa/Downloads/BPBD/img/system-diagram.png" static/demo/ews/img/
cp "/Users/tessa/Downloads/BPBD/img/logo-be.png" static/demo/ews/img/
```
Expected: 5 PNGs present in `static/demo/ews/img/`.

- [ ] **Step 2: Provide CCTV placeholder stills**

Use the station photos as stand-in camera feeds:
```bash
cp static/demo/ews/img/station-full.png static/demo/ews/cctv/cam-code-hulu.jpg
cp static/demo/ews/img/station-siren.png static/demo/ews/cctv/cam-sirine-code.jpg
cp static/demo/ews/img/station-tech.png static/demo/ews/cctv/cam-boyong.jpg
cp static/demo/ews/img/station-full.png static/demo/ews/cctv/cam-evakuasi.jpg
```
Expected: 4 stills present. (Renaming to `.jpg` is fine for `<img>` since the browser sniffs content; if strictness matters, keep `.png` and update references.)

- [ ] **Step 3: Source the DIY boundary GeoJSON**

Fetch a public Indonesian province boundary and extract DIY. Try, in order, until one yields a valid FeatureCollection covering DIY (bbox lat −8.2..−7.5, lng 110.0..110.9):
```bash
# Candidate: per-province file set
curl -fsSL -o static/demo/ews/diy.geojson \
  "https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.json"
```
If that file is all-provinces, filter to DIY with a one-off node/jq step (match `properties` name containing "Yogyakarta"/"DI YOGYAKARTA") and write only that feature to `static/demo/ews/diy.geojson`. Verify:
```bash
node -e "const g=require('./static/demo/ews/diy.geojson'); console.log(g.type, (g.features?.length ?? 1));"
```
Expected: prints `FeatureCollection` (or `Feature`) and a small feature count.

- [ ] **Step 4: Fallback stand-in (only if no source reachable)**

If fetching fails, write a hand-made simplified DIY polygon (rough rectangle/quad around Yogyakarta) as a `FeatureCollection` with one polygon feature so the map has a boundary. Keep coordinates within the DIY bbox above.

- [ ] **Step 5: Loader module**

`src/lib/ews/data/geojson.ts`:
```ts
export const DIY_GEOJSON_URL = '/demo/ews/diy.geojson';

export async function loadDiyBoundary(): Promise<GeoJSON.FeatureCollection> {
	const res = await fetch(DIY_GEOJSON_URL);
	if (!res.ok) throw new Error(`gagal memuat batas DIY: ${res.status}`);
	return (await res.json()) as GeoJSON.FeatureCollection;
}
```
(If `GeoJSON` namespace types are unavailable, add `@types/geojson` as a devDep or type the return as `unknown` and cast at the Leaflet call site.)

- [ ] **Step 6: Commit**
```bash
git add static/demo/ews src/lib/ews/data/geojson.ts
git commit -m "feat(ews): DIY boundary geojson, BPBD imagery, cctv stills, loader"
```

---

## Phase 3 — Theme & UI primitives

### Task 10: STESY theme.css (BE-DS tokens, dark + light, scoped)

**Files:**
- Create: `src/lib/components/ews/theme.css`
- Reference: `/Users/tessa/Downloads/BPBD/_ds/.../colors_and_type.css`, `/Users/tessa/Documents/allinone/src/app.css`

**Interfaces:**
- Produces: CSS custom properties under `.stesy` (dark default) and `.stesy.theme-light` (light overrides). Tokens: `--bg, --surface, --panel, --panel-2, --line, --line-soft, --ink, --ink-strong, --ink-muted, --ink-dim, --accent (#C8A878 brass), --signal (#3E8BFF), --normal, --waspada, --siaga, --awas`. Plus `.stesy` sets `font-family: Montserrat`.

- [ ] **Step 1: Author tokens**

Adapt allinone's `@theme`/CSS variables into a `.stesy`-scoped block. Dark base on navy `#1C1C41` family; map status vars to the Siaga colors from `status.ts`. Add a `.theme-light` variant (light surfaces, dark ink) for dashboard. Include the `.stesy` utility helpers allinone relied on (`glass`, `hud-bracket`, `grid-texture`) re-scoped under `.stesy`.

- [ ] **Step 2: Verify it imports**

Temporarily import in `+layout.svelte` and confirm `npm run check` and `npm run dev` show no CSS errors and the navy background renders.

- [ ] **Step 3: Commit**
```bash
git add src/lib/components/ews/theme.css
git commit -m "feat(ews): Beacon-DS theme.css scoped under .stesy (dark+light)"
```

---

### Task 11: UI primitive components (port group)

**Files (Create, all under `src/lib/components/ews/ui/`):** `Panel.svelte`, `KpiCard.svelte`, `Gauge.svelte`, `LevelBar.svelte`, `Sparkline.svelte`, `MiniChart.svelte`, `WallDonut.svelte`, `ScatterPlot.svelte`, `StatusBadge.svelte`, `Delta.svelte`, `Clock.svelte`, `Button.svelte`, `LogoutModal.svelte`
- Reference: `/Users/tessa/Documents/allinone/src/lib/components/ui/*`

**Interfaces:**
- Produces reusable primitives consumed by every module/view. Preserve allinone's prop names so downstream ports compile (e.g. `Gauge` props `value, max, label`; `LevelBar` props `value, thresholds`; `StatusBadge` prop `status: Siaga`; `Sparkline` prop `points: HistPoint[]`). `LevelBar`/`StatusBadge`/`Gauge` use `SIAGA_COLOR` from `$lib/ews/status`.

- [ ] **Step 1: Port the group**

Apply the standard port transforms (top of plan) to each file. Specifically: import `SIAGA_COLOR`, `siagaLabel` from `$lib/ews/status`; import `num`, `fmtUnit` from `$lib/ews/format`; types from `$lib/ews/types`. These are presentational SVG/markup components — no router, minimal logic. Replace allinone color literals with `var(--…)` theme tokens where practical, but keep `SIAGA_COLOR` hexes for status fills.

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: no errors. Fix prop/type mismatches against `types.ts`.

- [ ] **Step 3: Commit**
```bash
git add src/lib/components/ews/ui
git commit -m "feat(ews): port UI primitive components"
```

---

## Phase 4 — Shell, navigation & module routes

### Task 12: Layout shell (TopBar, TabNav, theme toggle, sim start)

**Files:**
- Create: `src/lib/components/ews/layout/TopBar.svelte`, `TabNav.svelte`, `Logo.svelte`, `Emblem.svelte`
- Create: `src/lib/ews/config/nav.ts`
- Create: `src/lib/ews/theme.ts`
- Modify: `src/routes/demo/ews/+layout@.svelte` (the single merged reset+shell layout created in Task 2 — add the shell markup to it; do NOT create a separate `+layout.svelte`)
- Reference: `/Users/tessa/Documents/allinone/src/lib/components/layout/*`, `config/nav.ts`, `theme.ts`, `App.svelte`

**Interfaces:**
- Consumes: stores (`overallStatus`, `startSimulation`), `isAuthed`/`logout` from auth.
- Produces: `nav.ts` exports `NAV_ITEMS: {key,label,href,icon}[]` for the 6 modules; `theme.ts` exports `theme: Writable<'dark'|'light'>` + `toggleTheme()`. TabNav highlights active route via `$page.url.pathname`.

- [ ] **Step 1: nav + theme stores**

`src/lib/ews/config/nav.ts`:
```ts
export interface NavItem { key: string; label: string; href: string; }
export const NAV_ITEMS: NavItem[] = [
	{ key: 'ringkasan', label: 'Ringkasan', href: '/demo/ews/ringkasan' },
	{ key: 'peringatan-dini', label: 'Peringatan Dini', href: '/demo/ews/peringatan-dini' },
	{ key: 'longsor', label: 'Longsor', href: '/demo/ews/longsor' },
	{ key: 'diseminasi', label: 'Diseminasi', href: '/demo/ews/diseminasi' },
	{ key: 'evakuasi', label: 'Evakuasi & Dampak', href: '/demo/ews/evakuasi' },
	{ key: 'analisa', label: 'Analisa', href: '/demo/ews/analisa' }
];
```
`src/lib/ews/theme.ts`:
```ts
import { writable } from 'svelte/store';
export const theme = writable<'dark' | 'light'>('dark');
export function toggleTheme() {
	theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
}
```

- [ ] **Step 2: Port layout components** (standard transforms). TopBar uses `goto` for the wall-mode button (`/demo/ews/wall`) and shows `Clock`, `overallStatus` badge, theme toggle, logout (opens `LogoutModal`). TabNav renders `NAV_ITEMS`, active by pathname.

- [ ] **Step 3: Wire the shell** into the existing `src/routes/demo/ews/+layout@.svelte` (created in Task 2 as the reset layout; replace its placeholder body with this shell — keep it as `+layout@.svelte`, do not add a separate `+layout.svelte`):
```svelte
<script lang="ts">
	import '$lib/components/ews/theme.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { isAuthed } from '$lib/ews/auth';
	import { startSimulation } from '$lib/ews/stores';
	import { theme } from '$lib/ews/theme';
	import TopBar from '$lib/components/ews/layout/TopBar.svelte';
	import TabNav from '$lib/components/ews/layout/TabNav.svelte';

	let { children } = $props();
	let isWall = $derived($page.url.pathname.startsWith('/demo/ews/wall'));
	let isLogin = $derived($page.url.pathname.startsWith('/demo/ews/login'));

	onMount(() => {
		if (!get(isAuthed) && !get(page).url.pathname.includes('/login')) goto('/demo/ews/login');
		const stop = startSimulation();
		return stop;
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="stesy {$theme === 'light' && !isWall ? 'theme-light' : ''} min-h-screen">
	{#if !isWall && !isLogin}
		<TopBar />
		<TabNav />
	{/if}
	{@render children()}
</div>
```

- [ ] **Step 4: Typecheck & manual check**

Run: `npm run check` (no errors) then `npm run dev`: TopBar + TabNav render on module routes, hidden on `/wall` and `/login`; theme toggle flips dashboard colors; sim clock ticks.

- [ ] **Step 5: Commit**
```bash
git add src/lib/components/ews/layout src/lib/ews/config src/lib/ews/theme.ts src/routes/demo/ews/+layout.svelte
git commit -m "feat(ews): shell layout, nav, theme toggle, simulation start"
```

---

### Task 13: Module route pages (thin wrappers)

**Files (Create):** `src/routes/demo/ews/{ringkasan,peringatan-dini,longsor,diseminasi,evakuasi,analisa}/+page.svelte`

**Interfaces:**
- Consumes: module components from Phase 6 (created next). Each page is a one-line wrapper rendering its module so routing works before modules are filled.

- [ ] **Step 1: Create six wrappers** — pattern (ringkasan shown; repeat per module with its component):
```svelte
<script lang="ts">
	import RingkasanModule from '$lib/components/ews/modules/RingkasanModule.svelte';
</script>
<RingkasanModule />
```
Create placeholder module components now so routes compile (empty `<section>Coming</section>` each), to be filled in Phase 6.

- [ ] **Step 2: Verify routing** — `npm run dev`: each tab navigates and renders its placeholder; redirect index → ringkasan works.

- [ ] **Step 3: Commit**
```bash
git add src/routes/demo/ews src/lib/components/ews/modules
git commit -m "feat(ews): module route wrappers + placeholders"
```

---

## Phase 5 — Map

### Task 14: BasinMap + legend + controls (Leaflet, browser-guarded)

**Files:**
- Create: `src/lib/components/ews/map/BasinMap.svelte`, `MapLegend.svelte`, `WallMapControls.svelte`
- Create: `src/lib/components/ews/icons/StationIcon.svelte`
- Reference: `/Users/tessa/Documents/allinone/src/lib/components/map/*`; repo reference for SSR-safe Leaflet: `src/lib/components/demo-dashboard/TulangBawangMap.svelte`

**Interfaces:**
- Consumes: `markers` store, `SIAGA_COLOR`, `loadDiyBoundary`, `goto`.
- Produces: `BasinMap` props `{ markers, center?, zoom?, onMarkerClick?(m: MapMarker) }`. Default center DIY `[-7.80, 110.37]` (Yogyakarta), zoom 11.

- [ ] **Step 1: Port BasinMap** — apply standard transforms. Critical SSR guards: `import { browser } from '$app/environment'`; create the Leaflet map inside `onMount`; dynamic-import Leaflet (`const L = (await import('leaflet')).default`) so it never loads during SSR; import `'leaflet/dist/leaflet.css'`. Load CARTO dark tiles. Add the DIY boundary via `loadDiyBoundary()` as a styled `L.geoJSON` layer. Render markers colored by `SIAGA_COLOR[status]`; click → `onMarkerClick` (wired by callers to `goto('/demo/ews/' + kind + '/' + id)`).

- [ ] **Step 2: Port MapLegend + WallMapControls + StationIcon** (standard transforms).

- [ ] **Step 3: Typecheck & manual** — `npm run check` clean; `npm run dev`: map renders client-side only (no SSR crash), DIY outline + colored markers visible.

- [ ] **Step 4: Commit**
```bash
git add src/lib/components/ews/map src/lib/components/ews/icons
git commit -m "feat(ews): Leaflet basin map, legend, controls (SSR-guarded)"
```

---

## Phase 6 — Modules

> Each module task: port the matching allinone module as a starting point, then swap its content per the Domain rename map and §6 of the spec. Consume stores (`data`, `markers`, `activeAlerts`, `statusCounts`, `overallStatus`) and UI primitives. Standard port transforms apply. Each ends with `npm run check` clean + a manual look + commit. Panels (`AlertPanel`, `InstrumentCard`, `DetailDrawer`) are ported on first use (Task 15/16) and reused.

### Task 15: RingkasanModule + earthquake feed + AlertPanel

**Files:** Create `src/lib/components/ews/modules/RingkasanModule.svelte`, `src/lib/components/ews/panels/AlertPanel.svelte`
- Reference: `allinone .../modules/OverviewModule.svelte`, `.../panels/AlertPanel.svelte`

- [ ] **Step 1:** Port OverviewModule → RingkasanModule. Compose: `BasinMap` (summary), `WallDonut`/`statusCounts`, KPI tiles (active stations, highest Siaga via `overallStatus`, population at risk = sum `areas.jiwa`, sirens armed = count `sirens.armed`), `AlertPanel` (from `activeAlerts`), and a compact **earthquake feed** list from `data.quakes` (mag, depth, lokasi, time via `timeHM`).
- [ ] **Step 2:** Port AlertPanel (standard transforms; renders `AlertItem[]`).
- [ ] **Step 3:** `npm run check` clean; manual look.
- [ ] **Step 4:** Commit `feat(ews): ringkasan module + alert panel + quake feed`.

### Task 16: PeringatanDiniModule (flood EWS core) + InstrumentCard

**Files:** Create `.../modules/PeringatanDiniModule.svelte`, `.../panels/InstrumentCard.svelte`
- Reference: `allinone .../modules/HidrologiModule.svelte`, `.../panels/InstrumentCard.svelte`

- [ ] **Step 1:** Port HidrologiModule → PeringatanDiniModule. For each `Pos`: show `StatusBadge`, current `fmtUnit(value, unit)`, `LevelBar` with `thresholds` (the 4-level Siaga ladder), `Sparkline` of `history`, rise-rate (`riseRatePerHour`), and **ETA-to-next-Siaga** (`etaToNextSiagaHours` → "≈ Xj menuju Siaga" or "—"). Group TMA vs ARR stations.
- [ ] **Step 2:** Port InstrumentCard (status, value, mini-chart).
- [ ] **Step 3:** `npm run check` clean; manual look (Siaga ladder + ETA visible).
- [ ] **Step 4:** Commit `feat(ews): peringatan-dini flood EWS module + instrument card`.

### Task 17: LongsorModule

**Files:** Create `.../modules/LongsorModule.svelte` (port `BendunganModule.svelte` as scaffold)
- [ ] **Step 1:** Replace dam content with `LandslideSensor` cards: movement (mm) vs threshold, rainfall accumulation vs threshold, derived `status`, `Sparkline` of movement history, risk-zone label. Map markers via `BasinMap` filtered to `kind==='longsor'`.
- [ ] **Step 2:** `npm run check` clean; manual look.
- [ ] **Step 3:** Commit `feat(ews): longsor (landslide) module`.

### Task 18: DiseminasiModule

**Files:** Create `.../modules/DiseminasiModule.svelte` (port `IrigasiModule.svelte` as scaffold)
- [ ] **Step 1:** Replace irrigation content with: siren network grid (`SirenNode` armed/status/lastTest via `timeHM`), notification `Channel[]` panel (online + reach), and a broadcast log derived from `activeAlerts` (which alerts were disseminated through which channels).
- [ ] **Step 2:** `npm run check` clean; manual look.
- [ ] **Step 3:** Commit `feat(ews): diseminasi & sirine module`.

### Task 19: EvakuasiModule

**Files:** Create `.../modules/EvakuasiModule.svelte` (port `BanjirModule.svelte` as scaffold)
- [ ] **Step 1:** Compose: `AffectedArea` table (KK, jiwa, status), `Shelter` capacity bars (`terisi`/`kapasitas`), evacuation map (shelters + areas), and O&P assets (`OpAsset` pompa/tanggul kondisi + operasional).
- [ ] **Step 2:** `npm run check` clean; manual look.
- [ ] **Step 3:** Commit `feat(ews): evakuasi & dampak module`.

### Task 20: AnalisaModule

**Files:** Create `.../modules/AnalisaModule.svelte` (port `AnalisaModule.svelte`)
- [ ] **Step 1:** Keep analysis UX but on EWS data: TMA & rainfall trends (`MiniChart`), rainfall-vs-water-level **correlation** (`ScatterPlot` over paired Pos histories), and a simple forecast band (project rise rate forward). Indonesian labels.
- [ ] **Step 2:** `npm run check` clean; manual look.
- [ ] **Step 3:** Commit `feat(ews): analisa & prediksi module`.

---

## Phase 7 — Detail, CCTV, Videowall

### Task 21: Asset detail drill-down

**Files:** Create `src/routes/demo/ews/[kind]/[id]/+page.svelte`, `src/lib/components/ews/views/AssetDetailPage.svelte`, `src/lib/components/ews/panels/DetailDrawer.svelte`
- Reference: `allinone .../views/AssetDetailPage.svelte`, `.../panels/DetailDrawer.svelte`

**Interfaces:**
- Consumes: route params `kind`/`id`, `data` store. Produces a detail page resolving the asset by `(kind,id)` and showing a large chart (6/24/48h selector over `history`), `InstrumentCard`s, and location on `BasinMap`.

- [ ] **Step 1:** `+page.svelte` reads `$page.params.kind/id`, looks the asset up in `$data`, passes to `AssetDetailPage`; 404 message if not found. Back button → `goto` previous module.
- [ ] **Step 2:** Port AssetDetailPage + DetailDrawer (standard transforms).
- [ ] **Step 3:** `npm run check` clean; manual: click a marker/row → detail opens with chart + back works.
- [ ] **Step 4:** Commit `feat(ews): asset detail drill-down`.

### Task 22: CCTV carousel

**Files:** Create `src/lib/components/ews/cctv/CctvPanel.svelte`, `WallCctvPanel.svelte`, `CameraTile.svelte`; Create `src/lib/ews/data/cameras.ts`
- Reference: `allinone .../cctv/*`, `.../data/cameras.ts`

**Interfaces:**
- Produces: `cameras.ts` exports `CAMERAS: {id,nama,group,src}[]` pointing at `/demo/ews/cctv/*` stills (Pos Code, sirine, Boyong, evakuasi). `CctvPanel` rotates a 2×2 grid every 8s (browser-only interval).

- [ ] **Step 1:** Author `cameras.ts` with the 4 stills from Task 9 + sensible Indonesian names/groups.
- [ ] **Step 2:** Port the three CCTV components (standard transforms; guard the interval with `onMount`).
- [ ] **Step 3:** `npm run check` clean; manual: carousel cycles.
- [ ] **Step 4:** Commit `feat(ews): cctv carousel`.

### Task 23: Videowall mode

**Files:** Create `src/routes/demo/ews/wall/+page.svelte`, `src/lib/components/ews/views/WallView.svelte`, `WallUnavailable.svelte`
- Reference: `allinone .../views/WallView.svelte`, `WallUnavailable.svelte`

**Interfaces:**
- Consumes: all stores, `BasinMap`, `WallDonut`, KPI tiles, `WallCctvPanel`, `AlertPanel`, `WallMapControls`. Wall is forced dark (layout already hides chrome on `/wall`).

- [ ] **Step 1:** `wall/+page.svelte` renders `WallView` when viewport ≥1024px else `WallUnavailable` (check via a `matchMedia` in `onMount`).
- [ ] **Step 2:** Port WallView: full-bleed `BasinMap` centerpiece + floating HUD header (logo, inventory counts, `Clock`, controls incl. "mode interaktif" → `goto('/demo/ews/ringkasan')`, fullscreen, pause, logout) + left dock (`WallDonut` from `statusCounts`, KPI tiles, `WallCctvPanel`, `AlertPanel`). Port the auto-tour (cycle markers with non-normal status) guarded by `onMount`. Port `WallUnavailable`.
- [ ] **Step 3:** `npm run check` clean; manual: `/demo/ews/wall` shows mission-control view (dark), HUD + dock + map; small viewport shows the "butuh layar besar" notice.
- [ ] **Step 4:** Commit `feat(ews): videowall mode`.

---

## Phase 8 — AI chatbot

### Task 24: OpenAI chat endpoint + chat UI

**Files:** Create `src/routes/demo/ews/api/chat/+server.ts`, `src/lib/components/ews/chat/chatClient.ts`, `InteractiveChatbot.svelte`, `WallChatbot.svelte`
- Reference: `allinone server/index.js`, `server/chatRuntime.js`, `.../chat/*`

**Interfaces:**
- Produces: `POST /demo/ews/api/chat` accepting `{ messages: {role,content}[], context?: {...} }`, returning `{ reply: string }`. Reads `OPENAI_API_KEY`/`OPENAI_MODEL` from `$env/dynamic/private`. `chatClient.ts` exports `sendChat(messages, context): Promise<string>`.

- [ ] **Step 1: Endpoint**

`src/routes/demo/ews/api/chat/+server.ts`:
```ts
import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import OpenAI from 'openai';
import type { RequestHandler } from './$types';

const SYSTEM = `Anda asisten STESY, pusat komando peringatan dini bencana (banjir, longsor, gempa) untuk wilayah DIY Yogyakarta. Jawab ringkas, dalam Bahasa Indonesia, berdasarkan status Siaga (Normal/Waspada/Siaga/Awas), pos pemantauan, diseminasi, dan evakuasi.`;

export const POST: RequestHandler = async ({ request }) => {
	const key = env.OPENAI_API_KEY;
	if (!key) throw error(503, 'AI nonaktif: OPENAI_API_KEY belum diset.');
	const { messages = [], context } = await request.json();
	const client = new OpenAI({ apiKey: key });
	const ctx = context ? `Konteks langsung: ${JSON.stringify(context)}` : '';
	const res = await client.chat.completions.create({
		model: env.OPENAI_MODEL || 'gpt-4o-mini',
		messages: [
			{ role: 'system', content: SYSTEM + '\n' + ctx },
			...messages
		]
	});
	return json({ reply: res.choices[0]?.message?.content ?? '' });
};
```
(Use the model the deployment provides via `OPENAI_MODEL`; `gpt-4o-mini` is a safe default.)

- [ ] **Step 2: Client**

`chatClient.ts`:
```ts
export async function sendChat(
	messages: { role: 'user' | 'assistant'; content: string }[],
	context?: unknown
): Promise<string> {
	const res = await fetch('/demo/ews/api/chat', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ messages, context })
	});
	if (!res.ok) {
		if (res.status === 503) return 'Asisten AI sedang nonaktif pada demo ini.';
		throw new Error('chat gagal');
	}
	const data = await res.json();
	return data.reply as string;
}
```

- [ ] **Step 3: Port chat UIs** (InteractiveChatbot for dashboard, WallChatbot for wall) — apply standard transforms; pass `{ alerts: $activeAlerts.length, status: $overallStatus }` as context; render the 503 fallback message gracefully so the demo works without a key.

- [ ] **Step 4: Wire** InteractiveChatbot into the shell (collapsible panel) and WallChatbot into WallView.

- [ ] **Step 5:** `npm run check` clean; manual: with no key, chat shows the "nonaktif" notice and the rest works; with a key set, it replies.

- [ ] **Step 6:** Commit `feat(ews): OpenAI chat endpoint + chat UI with graceful fallback`.

---

## Phase 9 — Verification & polish

### Task 25: Full verification pass

**Files:** Modify as needed for fixes.

- [ ] **Step 1: Unit tests** — Run: `npm test` → all pure-helper suites PASS.
- [ ] **Step 2: Typecheck** — Run: `npm run check` → 0 errors.
- [ ] **Step 3: Build** — Run: `npm run build` → succeeds (catches SSR-only import leaks; fix any Leaflet/window leak by moving to `onMount`/dynamic import).
- [ ] **Step 4: Manual smoke (dev)** — `npm run dev`, walk: `/demo/ews` → login → ringkasan → each of the 6 modules → a detail drill-down → `/demo/ews/wall` (and small-viewport notice) → theme toggle (dashboard) → chatbot (no-key fallback). Confirm marketing Header/Footer never appear and `.demo-deck`/demo-dashboard styles never bleed in. Confirm `/demo/dashboard` (Tulang Bawang) still works unchanged.
- [ ] **Step 5: Commit any fixes** — `chore(ews): verification fixes` (or no-op if clean).

---

## Self-Review

**Spec coverage:**
- §2 decisions → Tasks 1–24 (name/colors/fonts in Global Constraints + Task 10; OpenAI Task 24; login Task 2; theme toggle Task 12; geography Tasks 8–9). ✓
- §4 routing & isolation → Task 2 (`+layout@.svelte` reset) + Task 12. ✓
- §5 library layout → Tasks 3–8, 12, 14, 22 (`router.ts`/server/analytics/voice dropped — noted in Task 12/24). ✓
- §6 six modules → Tasks 13, 15–20. ✓
- §7 data model & simulation → Tasks 3, 8; Yogyakarta seed Task 8; GeoJSON Task 9. ✓
- §8 design & assets → Tasks 9, 10, 11. ✓
- §9 chatbot → Task 24. ✓
- §10 non-goals → respected (no changes to dashboard/presentasi — Global Constraints; verified Task 25 Step 4). ✓
- §11 testing → Task 1 (vitest), Tasks 4–8 (TDD), Task 25 (check/build/manual). ✓
- §12 open notes → Task 2 Step 6 (header/footer skip), Task 9 (GeoJSON), Task 14 (SSR Leaflet). ✓

**Placeholder scan:** Component-port tasks intentionally reference allinone source files plus explicit transform recipes rather than reproducing thousands of lines — this is a port, and the source is the authoritative content. All *new* logic (auth, stores, endpoint, helpers, nav, theme) is shown in full. Pure-helper tasks have complete failing tests + implementations. No "TBD"/"handle edge cases" placeholders remain.

**Type consistency:** `Siaga`, `Pos`, `MapMarker`, `DemoData`, `Thresholds`, `HistPoint` used consistently from Task 3 onward; `SIAGA_COLOR` (Task 4) referenced by Tasks 11/14; `startSimulation` (Task 8) consumed in Task 12; `sendChat` (Task 24) signature matches its UI consumers; nav hrefs (Task 12) match the route folders (Task 13).
