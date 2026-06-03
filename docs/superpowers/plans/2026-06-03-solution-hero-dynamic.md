# Dynamic Solution Hero Text — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an admin edit each solution's hero text (title, description, emphasis) in two languages from the Filament CMS, with the public site falling back to today's hardcoded copy when a field is empty.

**Architecture:** Add six nullable `text` columns to `solutions` (`hero_{title,description,emphasis}_{id,en}`), surface them in the Filament "Edit Solusi" form, return them from the `GET /solutions/{slug}` API, and read them on the SvelteKit side via a small pure helper (`heroCopy`) that picks the locale field and falls back to the page's existing `pageCopy` text.

**Tech Stack:** Backend = Laravel 13 + Filament 4 (`/Users/tessa/Documents/backend-beacon`). Frontend = SvelteKit + Svelte 5 runes (`/Users/tessa/Documents/beacon-compro`).

**Note on testing:** The frontend repo has **no test runner** (only `svelte-check`) and the backend has no feature-test setup wired for this. Per YAGNI we do **not** introduce a test framework for this small feature. Verification is via `npm run check` (type safety) + documented manual checks with exact expected output. Each task below states its concrete verification.

**Note on scope:** Only **5** real hero components exist — `water-security`, `early-warning`, `weather-forecast`, `pressure-measurement`, `stesy`. The pages `digital-monitoring-platform`, `infrastructure-security`, `weather-climate-intelligence` are thin re-exports of `stesy`, `pressure-measurement`, `weather-forecast` respectively, so they update automatically. `stesy`'s hero has **no emphasis line** by design — it wires title + description only.

---

## Task 1: Backend — migration adding hero columns

**Files:**
- Create: `/Users/tessa/Documents/backend-beacon/database/migrations/2026_06_03_000001_add_hero_fields_to_solutions_table.php`

- [ ] **Step 1: Create the migration file**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('solutions', function (Blueprint $table) {
            $table->text('hero_title_id')->nullable()->after('description');
            $table->text('hero_title_en')->nullable()->after('hero_title_id');
            $table->text('hero_description_id')->nullable()->after('hero_title_en');
            $table->text('hero_description_en')->nullable()->after('hero_description_id');
            $table->text('hero_emphasis_id')->nullable()->after('hero_description_en');
            $table->text('hero_emphasis_en')->nullable()->after('hero_emphasis_id');
        });
    }

    public function down(): void
    {
        Schema::table('solutions', function (Blueprint $table) {
            $table->dropColumn([
                'hero_title_id',
                'hero_title_en',
                'hero_description_id',
                'hero_description_en',
                'hero_emphasis_id',
                'hero_emphasis_en',
            ]);
        });
    }
};
```

- [ ] **Step 2: Run the migration**

Run: `cd /Users/tessa/Documents/backend-beacon && php artisan migrate`
Expected: output includes `2026_06_03_000001_add_hero_fields_to_solutions_table .... DONE`

- [ ] **Step 3: Verify columns exist**

Run: `cd /Users/tessa/Documents/backend-beacon && php artisan tinker --execute="echo implode(',', \Illuminate\Support\Facades\Schema::getColumnListing('solutions'));"`
Expected: the printed list includes `hero_title_id,hero_title_en,hero_description_id,hero_description_en,hero_emphasis_id,hero_emphasis_en`

- [ ] **Step 4: Commit**

```bash
cd /Users/tessa/Documents/backend-beacon
git add database/migrations/2026_06_03_000001_add_hero_fields_to_solutions_table.php
git commit -m "feat(solutions): add bilingual hero text columns"
```

---

## Task 2: Backend — add hero fields to the model `$fillable`

**Files:**
- Modify: `/Users/tessa/Documents/backend-beacon/app/Models/Solution.php:10-19`

- [ ] **Step 1: Update `$fillable`**

Replace the `$fillable` array (currently lines 10–19) with:

```php
    protected $fillable = [
        'name',
        'slug',
        'description',
        'hero_title_id',
        'hero_title_en',
        'hero_description_id',
        'hero_description_en',
        'hero_emphasis_id',
        'hero_emphasis_en',
        'thumbnail',
        'icon',
        'color',
        'sort_order',
        'is_active',
    ];
```

- [ ] **Step 2: Commit**

```bash
cd /Users/tessa/Documents/backend-beacon
git add app/Models/Solution.php
git commit -m "feat(solutions): make hero fields mass-assignable"
```

---

## Task 3: Backend — add "Hero Section" to the Filament edit form

**Files:**
- Modify: `/Users/tessa/Documents/backend-beacon/app/Filament/Resources/SolutionResource.php` (add a `Section` after the "Informasi Dasar" section that ends at line 58)

- [ ] **Step 1: Insert the new section**

In the `form()` method, immediately after the `Section::make('Informasi Dasar')...->schema([...])` block (the closing `]),` on line 58) and before `Section::make('Media')`, insert:

```php
            Section::make('Hero Section')
                ->description('Teks hero di halaman solusi. Kolom kiri Bahasa Indonesia, kanan English. Kalau dikosongkan, teks bawaan website yang dipakai. Untuk judul, bungkus kata yang ingin berwarna merah dengan **dua bintang**, lalu tekan Enter untuk ganti baris.')
                ->columns(2)
                ->schema([
                    Textarea::make('hero_title_id')
                        ->label('Judul (Indonesia)')
                        ->rows(2)
                        ->helperText('Contoh: Air adalah Hidup.⏎**Dan Risiko.**'),
                    Textarea::make('hero_title_en')
                        ->label('Judul (English)')
                        ->rows(2),
                    Textarea::make('hero_description_id')
                        ->label('Deskripsi (Indonesia)')
                        ->rows(3),
                    Textarea::make('hero_description_en')
                        ->label('Deskripsi (English)')
                        ->rows(3),
                    Textarea::make('hero_emphasis_id')
                        ->label('Penekanan (Indonesia)')
                        ->rows(2),
                    Textarea::make('hero_emphasis_en')
                        ->label('Penekanan (English)')
                        ->rows(2),
                ]),
```

(`Textarea` is already imported on line 10 — no new `use` statement needed.)

- [ ] **Step 2: Verify the form renders & saves**

Run the app if not already running: `cd /Users/tessa/Documents/backend-beacon && php artisan serve` (or use the existing dev server). In the admin panel, open **Solusi → edit any solution**. Confirm the new "Hero Section" appears with 6 fields. Type a value into "Judul (Indonesia)" (e.g. `Uji Coba ⏎**Merah.**`), Save, reopen the record, and confirm the value persisted.

Expected: section visible, values save and reload correctly.

- [ ] **Step 3: Commit**

```bash
cd /Users/tessa/Documents/backend-beacon
git add app/Filament/Resources/SolutionResource.php
git commit -m "feat(solutions): add Hero Section to edit form"
```

---

## Task 4: Backend — return hero fields from the detail API

**Files:**
- Modify: `/Users/tessa/Documents/backend-beacon/app/Http/Controllers/Api/SolutionController.php:70-78` (the `solution` array inside `show()`)

- [ ] **Step 1: Add the six fields to the `solution` payload**

In `show()`, change the `'solution' => [ ... ]` array so that after `'description' => $solution->description,` (line 74) and before `'thumbnail' =>` it includes the hero fields. The resulting array:

```php
            'solution' => [
                'id' => $solution->id,
                'name' => $solution->name,
                'slug' => $solution->slug,
                'description' => $solution->description,
                'hero_title_id' => $solution->hero_title_id,
                'hero_title_en' => $solution->hero_title_en,
                'hero_description_id' => $solution->hero_description_id,
                'hero_description_en' => $solution->hero_description_en,
                'hero_emphasis_id' => $solution->hero_emphasis_id,
                'hero_emphasis_en' => $solution->hero_emphasis_en,
                'thumbnail' => $this->storageUrl($solution->thumbnail),
                'icon' => $this->storageUrl($solution->icon),
                'color' => $solution->color,
            ],
```

- [ ] **Step 2: Verify the API returns the fields**

With the backend serving, run (adjust host/slug to a real active solution slug):
`curl -s http://127.0.0.1:8000/api/v1/solutions/water-security | python3 -m json.tool | grep hero_`
Expected: six `hero_*` keys appear under `solution` (values may be `null` or the test value saved in Task 3).

- [ ] **Step 3: Commit**

```bash
cd /Users/tessa/Documents/backend-beacon
git add app/Http/Controllers/Api/SolutionController.php
git commit -m "feat(solutions): expose hero fields in detail API"
```

---

## Task 5: Frontend — extend the `SolutionDetail` type

**Files:**
- Modify: `/Users/tessa/Documents/beacon-compro/src/lib/loaders/solution.ts:3-11`

- [ ] **Step 1: Add the optional hero fields to the interface**

Replace the `SolutionDetail` interface with:

```ts
export interface SolutionDetail {
	id: number;
	name: string;
	slug: string;
	description: string;
	hero_title_id?: string | null;
	hero_title_en?: string | null;
	hero_description_id?: string | null;
	hero_description_en?: string | null;
	hero_emphasis_id?: string | null;
	hero_emphasis_en?: string | null;
	thumbnail: string | null;
	icon: string | null;
	color: string;
}
```

- [ ] **Step 2: Type-check**

Run: `cd /Users/tessa/Documents/beacon-compro && npm run check`
Expected: no new errors introduced by this change.

- [ ] **Step 3: Commit**

```bash
cd /Users/tessa/Documents/beacon-compro
git add src/lib/loaders/solution.ts
git commit -m "feat(solusi): add hero fields to SolutionDetail type"
```

---

## Task 6: Frontend — create the `heroCopy` helper

**Files:**
- Create: `/Users/tessa/Documents/beacon-compro/src/lib/utils/heroCopy.ts`

- [ ] **Step 1: Write the helper**

```ts
import type { SolutionDetail } from '$lib/loaders/solution';

const HIGHLIGHT_COLOR = '#C8102E';

/**
 * Turn an admin-entered hero title into HTML for {@html}.
 * Conventions: **word** -> colored span, newline -> <br/>.
 * Raw HTML is escaped first so stray characters can't break the layout.
 */
export function formatHeroTitle(raw: string): string {
	const escaped = raw
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
	return escaped
		.replace(/\*\*([^*]+)\*\*/g, `<span style="color: ${HIGHLIGHT_COLOR};">$1</span>`)
		.replace(/\r?\n/g, '<br/>');
}

export interface HeroFallback {
	title: string;
	desc: string;
	emphasis: string;
}

/**
 * Pick the locale-appropriate hero text from the solution record, falling back
 * to the page's hardcoded copy when a CMS field is empty.
 * `title` is always ready for {@html}: CMS values are run through
 * formatHeroTitle; the fallback (which may already be HTML) is returned as-is.
 */
export function heroCopy(
	solution: SolutionDetail | null | undefined,
	locale: string,
	fallback: HeroFallback
): HeroFallback {
	const isEn = locale === 'EN';
	const rawTitle = (isEn ? solution?.hero_title_en : solution?.hero_title_id) ?? '';
	const desc = (isEn ? solution?.hero_description_en : solution?.hero_description_id) ?? '';
	const emphasis = (isEn ? solution?.hero_emphasis_en : solution?.hero_emphasis_id) ?? '';

	return {
		title: rawTitle.trim() ? formatHeroTitle(rawTitle) : fallback.title,
		desc: desc.trim() ? desc : fallback.desc,
		emphasis: emphasis.trim() ? emphasis : fallback.emphasis
	};
}
```

- [ ] **Step 2: Type-check**

Run: `cd /Users/tessa/Documents/beacon-compro && npm run check`
Expected: no errors.

- [ ] **Step 3: Manual logic verification**

Confirm by reading the code against these cases (no test runner in repo):
- `formatHeroTitle('Air adalah Hidup.\n**Dan Risiko.**')` → `Air adalah Hidup.<br/><span style="color: #C8102E;">Dan Risiko.</span>`
- `heroCopy(null, 'ID', {title:'T', desc:'D', emphasis:'E'})` → `{title:'T', desc:'D', emphasis:'E'}` (all fallback)
- `heroCopy({hero_description_id:'X', ...} , 'ID', {desc:'D', ...})` → `desc` is `'X'`
- `heroCopy({hero_description_en:'Y', hero_description_id:'X', ...}, 'EN', {...})` → `desc` is `'Y'`
- empty string / whitespace CMS field → fallback used (because of `.trim()`).

- [ ] **Step 4: Commit**

```bash
cd /Users/tessa/Documents/beacon-compro
git add src/lib/utils/heroCopy.ts
git commit -m "feat(solusi): add heroCopy helper for dynamic hero text"
```

---

## Task 7: Frontend — wire the 3 standard pages (title + desc + emphasis)

These three pages share the same shape: `const/let copy = $derived(pageCopy[$locale])`, hero renders `{@html copy.title}`, `{copy.desc}`, `{copy.emphasis}`.

**Files:**
- Modify: `/Users/tessa/Documents/beacon-compro/src/routes/solusi/water-security/+page.svelte` (copy at line 80; renders at 129/133/136)
- Modify: `/Users/tessa/Documents/beacon-compro/src/routes/solusi/early-warning/+page.svelte` (copy at line 60; renders at 135/141/147)
- Modify: `/Users/tessa/Documents/beacon-compro/src/routes/solusi/weather-forecast/+page.svelte` (copy at line 53; renders at 128/134/140)

- [ ] **Step 1: Add the import + `hero` derived in each file**

In each of the three files, add this import alongside the other imports near the top of `<script>`:

```ts
	import { heroCopy } from '$lib/utils/heroCopy';
```

Immediately after that file's `const copy = $derived(pageCopy[$locale]);` line, add:

```ts
	const hero = $derived(
		heroCopy(data.solutionDetail?.solution, $locale, {
			title: copy.title,
			desc: copy.desc,
			emphasis: copy.emphasis
		})
	);
```

- [ ] **Step 2: Swap the render bindings in each file**

In each file's hero markup, replace:
- `{@html copy.title}` → `{@html hero.title}`
- `{copy.desc}` → `{hero.desc}`
- `{copy.emphasis}` → `{hero.emphasis}`

(Leave the `metaTitle`/`metaDesc`/`stats`/everything else bound to `copy` untouched.)

- [ ] **Step 3: Type-check**

Run: `cd /Users/tessa/Documents/beacon-compro && npm run check`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/tessa/Documents/beacon-compro
git add src/routes/solusi/water-security/+page.svelte src/routes/solusi/early-warning/+page.svelte src/routes/solusi/weather-forecast/+page.svelte
git commit -m "feat(solusi): wire dynamic hero on water-security, early-warning, weather pages"
```

---

## Task 8: Frontend — wire `pressure-measurement` (uses `copy.description`)

This page uses `description` (not `desc`) and `let copy` at line 68; renders `{@html copy.title}` (145), `{copy.description}` (151), `{copy.emphasis}` (157). It is also re-exported by `infrastructure-security`, which updates automatically.

**Files:**
- Modify: `/Users/tessa/Documents/beacon-compro/src/routes/solusi/pressure-measurement/+page.svelte`

- [ ] **Step 1: Add the import + `hero` derived**

Add near the other imports:

```ts
	import { heroCopy } from '$lib/utils/heroCopy';
```

Immediately after `let copy = $derived(pageCopy[$locale]);` (line 68), add:

```ts
	const hero = $derived(
		heroCopy(data.solutionDetail?.solution, $locale, {
			title: copy.title,
			desc: copy.description,
			emphasis: copy.emphasis
		})
	);
```

- [ ] **Step 2: Swap the render bindings**

In the hero markup replace:
- `{@html copy.title}` → `{@html hero.title}`
- `{copy.description}` → `{hero.desc}`
- `{copy.emphasis}` → `{hero.emphasis}`

- [ ] **Step 3: Type-check**

Run: `cd /Users/tessa/Documents/beacon-compro && npm run check`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/tessa/Documents/beacon-compro
git add src/routes/solusi/pressure-measurement/+page.svelte
git commit -m "feat(solusi): wire dynamic hero on pressure-measurement"
```

---

## Task 9: Frontend — wire `stesy` (title + description, no emphasis)

This page uses `let copy` at line 348, renders the title as **plain** `{copy.title}` (line 398) and `{copy.description}` (line 402). It has **no emphasis line**. It is re-exported by `digital-monitoring-platform`, which updates automatically. We switch the title to `{@html ...}` so the `**...**` convention works; the plain-text fallback renders fine through `{@html}`.

**Files:**
- Modify: `/Users/tessa/Documents/beacon-compro/src/routes/solusi/stesy/+page.svelte`

- [ ] **Step 1: Add the import + `hero` derived**

Add near the other imports (around line 23 where `locale` is imported):

```ts
	import { heroCopy } from '$lib/utils/heroCopy';
```

Immediately after `let copy = $derived(pageCopy[$locale]);` (line 348), add:

```ts
	const hero = $derived(
		heroCopy(data.solutionDetail?.solution, $locale, {
			title: copy.title,
			desc: copy.description,
			emphasis: ''
		})
	);
```

- [ ] **Step 2: Swap the render bindings**

In the hero markup:
- Replace `{copy.title}` (line 398) → `{@html hero.title}`
- Replace `{copy.description}` (line 402) → `{hero.desc}`

(There is no emphasis line on stesy; the `hero_emphasis_*` field has no effect on this page — documented as a known limitation.)

- [ ] **Step 3: Type-check**

Run: `cd /Users/tessa/Documents/beacon-compro && npm run check`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
cd /Users/tessa/Documents/beacon-compro
git add src/routes/solusi/stesy/+page.svelte
git commit -m "feat(solusi): wire dynamic hero on stesy"
```

---

## Task 10: End-to-end verification

- [ ] **Step 1: Type-check the whole frontend**

Run: `cd /Users/tessa/Documents/beacon-compro && npm run check`
Expected: no errors.

- [ ] **Step 2: Empty-field fallback check (no regression)**

With backend hero fields empty for a solution, load each page in the browser (`npm run dev`):
`/solusi/water-security`, `/solusi/early-warning`, `/solusi/weather-forecast`, `/solusi/weather-climate-intelligence`, `/solusi/pressure-measurement`, `/solusi/infrastructure-security`, `/solusi/stesy`, `/solusi/digital-monitoring-platform`.
Expected: every hero looks exactly as before this change (title highlight, description, emphasis where present).

- [ ] **Step 3: Dynamic-override check**

In the CMS, set `hero_title_id` (e.g. `Judul Baru ⏎**Dinamis.**`), `hero_description_id`, and `hero_emphasis_id` for the `water-security` solution. Reload `/solusi/water-security` with the site in Indonesian.
Expected: hero shows the new title with "Dinamis." in red, the new description, and the new emphasis. Toggle to English → falls back to the hardcoded English copy (since EN fields left empty).

- [ ] **Step 4: Shared-page check**

Confirm that setting hero fields on the `infrastructure-security` solution updates **both** `/solusi/infrastructure-security` and `/solusi/pressure-measurement` (expected shared behavior).

- [ ] **Step 5: Final commit (if any docs/tidy needed)**

Nothing to commit if all prior tasks committed cleanly. Otherwise commit remaining changes.

---

## Self-review notes
- **Spec coverage:** migration/model/form/API (backend) + types/helper/5 pages (frontend) all map to tasks 1–9; verification in task 10. ✓
- **Type consistency:** field names `hero_{title,description,emphasis}_{id,en}` identical across migration, model, form, API, type, and helper. Helper named `heroCopy`, formatter `formatHeroTitle` — used consistently in tasks 7–9. ✓
- **Known limitation documented:** `stesy`/`digital-monitoring-platform` have no emphasis line; shared pages converge on one solution's hero. ✓
