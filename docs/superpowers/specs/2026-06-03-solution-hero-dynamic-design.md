# Dynamic Solution Hero Text — Design

**Date:** 2026-06-03
**Status:** Approved (ready for implementation plan)
**Repos involved:**
- `backend-beacon` (Laravel 13 + Filament 4 — the CMS)
- `beacon-compro` (SvelteKit — the public website)

## Goal

Let an admin edit each solution's **hero text** from the CMS ("Edit Solusi" form),
instead of it being hardcoded in the frontend. Three text parts per solution become
editable, in **two languages** (Indonesian + English):

1. **Judul** (title) — supports a red highlight on part of the text.
2. **Deskripsi** (description) — the grey paragraph under the title.
3. **Penekanan** (emphasis) — the bold red line under the description.

If a CMS field is left empty, the frontend keeps showing **today's hardcoded text**
for that page. Rollout is therefore zero-risk: nothing changes visually until an
admin fills a field in.

## Background (current state)

### Frontend
- Each solution page is a separate folder under `src/routes/solusi/<page>/`, with its
  own `+page.svelte` containing a hardcoded, bilingual `pageCopy = { ID: {...}, EN: {...} }`
  object. The hero renders `copy.title` (via `{@html}`), `copy.desc`, and `copy.emphasis`.
  - ⚠️ Field names vary per page (e.g. `stesy` uses `description` instead of `desc`, and
    some pages may not have an `emphasis`). Each page must be wired individually.
- The server loader `loadSolutionDetail(slug, fetch)` in
  `src/lib/loaders/solution.ts` already fetches `solution.description` from the API but
  the hero ignores it.
- Locale store `$lib/i18n` exposes `$locale` with values `'ID'` / `'EN'`.
- API base from `.env`: `PUBLIC_API_BASE` (e.g. `http://admin.be-jogja.com/api/v1`).

### Backend
- `Solution` model + `solutions` table currently has: `name`, `slug`, `description`
  (plain text), `thumbnail`, `icon`, `color`, `sort_order`, `is_active`.
- `SolutionResource` (Filament) edit form has sections: Informasi Dasar, Media, Status.
- `SolutionController::show($slug)` returns `solution` (id, name, slug, description,
  thumbnail, icon, color) + `sub_solutions`. Create/update is handled entirely by
  Filament (no API write endpoint).

### Page → Solution mapping (important caveat)
The 8 frontend pages load only ~5 solution records:

| Frontend page | Loads solution slug |
|---|---|
| `water-security` | `water-security` |
| `early-warning` | `early-warning` |
| `weather-climate-intelligence` | `weather-climate-intelligence` |
| `weather-forecast` | `weather-climate-intelligence` (shared) |
| `infrastructure-security` | `infrastructure-security` |
| `pressure-measurement` | `infrastructure-security` (shared) |
| `digital-monitoring-platform` | `digital-monitoring-platform` |
| `stesy` | `digital-monitoring-platform` (shared) |

**Consequence:** when an admin edits a solution's hero, *every* page that loads that
solution shows the same hero text. With the empty-field fallback, pages that share a
solution still show their own distinct hardcoded text **until** the admin fills the
fields in — at which point the shared pages converge on the CMS text. Accepted for now;
per-page hero text is out of scope.

## Approach (chosen: A — dedicated hero fields)

Add six nullable `text` columns on the `Solution` model, surface them in the Filament
form, expose them in the API, and read them on the frontend with a fallback to the
existing hardcoded copy.

Rejected alternatives:
- **B (single JSON `hero` column):** fussier Filament form, less discoverable, no gain here.
- **C (reuse `description`):** `description` is already the short card/summary text;
  the user wants title + desc + emphasis, which `description` can't represent.

## Backend changes (`backend-beacon`)

### 1. Migration — add columns to `solutions`
New migration adding six nullable text columns:
`hero_title_id`, `hero_title_en`, `hero_description_id`, `hero_description_en`,
`hero_emphasis_id`, `hero_emphasis_en`.

### 2. Model — `app/Models/Solution.php`
Add the six column names to `$fillable`.

### 3. Filament form — `app/Filament/Resources/SolutionResource.php`
Add a new `Section::make('Hero Section')` (after "Informasi Dasar"), `->columns(2)`,
with helper text: *"Teks hero di halaman solusi. Kolom kiri Bahasa Indonesia, kanan
English. Kalau dikosongkan, teks bawaan website yang dipakai. Untuk judul, bungkus kata
yang ingin berwarna merah dengan `**...**`, dan tekan Enter untuk ganti baris."*

Fields, row by row (ID on left, EN on right):
- `TextInput`/`Textarea` `hero_title_id` | `hero_title_en`
- `Textarea` `hero_description_id` | `hero_description_en`
- `Textarea` `hero_emphasis_id` | `hero_emphasis_en`

(Plain text inputs — not RichEditor — since these are short strings and the title uses
the `**...**` convention, not HTML.)

### 4. API — `app/Http/Controllers/Api/SolutionController.php`
In `show()`, add the six fields to the returned `solution` array. (`index()` unchanged —
the listing doesn't need hero text.)

## Frontend changes (`beacon-compro`)

### 1. Types — `src/lib/loaders/solution.ts`
Extend `SolutionDetail` with the six optional string fields
(`hero_title_id?`, `hero_title_en?`, `hero_description_id?`, `hero_description_en?`,
`hero_emphasis_id?`, `hero_emphasis_en?`).

### 2. New helper — `src/lib/utils/heroCopy.ts`
Two pure functions, unit-testable in isolation:

```ts
// Escape HTML, then apply the admin-friendly conventions:
//   **word** -> red span,  newline -> <br/>
export function formatHeroTitle(raw: string): string;

// Pick the right locale fields from the solution; fall back to the page's
// hardcoded copy when a CMS field is empty. Returns { title, desc, emphasis }
// where `title` is ready for {@html} (CMS path is escaped+converted; fallback is
// the page's existing HTML title, passed through untouched).
export function heroCopy(
  solution: SolutionDetail | null | undefined,
  locale: 'ID' | 'EN',
  fallback: { title: string; desc: string; emphasis: string }
): { title: string; desc: string; emphasis: string };
```

`formatHeroTitle` escapes `&`, `<`, `>` first (admin content is trusted, but escaping
keeps stray characters from breaking layout), then converts `**...**` and newlines. The
red color matches the existing accent `#C8102E`.

### 3. Wire each of the 8 solution pages
In each `solusi/<page>/+page.svelte`:
```ts
import { heroCopy } from '$lib/utils/heroCopy';
const hero = $derived(
  heroCopy(data.solutionDetail?.solution, $locale, {
    title: copy.title,           // page's existing hardcoded values
    desc: copy.desc,             // (use the page's actual field names — may be
    emphasis: copy.emphasis      //  `description` / missing on some pages)
  })
);
```
Then in the hero markup, replace `{@html copy.title}` → `{@html hero.title}`,
`{copy.desc}` → `{hero.desc}`, `{copy.emphasis}` → `{hero.emphasis}`.
Pages without an `emphasis` pass `''` as the emphasis fallback and keep their markup.

## Data flow (after change)

```
Admin edits Hero Section in Filament
        ↓ (saved to solutions.hero_*_id / hero_*_en)
GET /api/v1/solutions/{slug}  → solution.hero_*_id / hero_*_en
        ↓
loadSolutionDetail(slug)  → data.solutionDetail.solution
        ↓
heroCopy(solution, $locale, pageFallback)  → { title, desc, emphasis }
        ↓
Hero markup renders CMS text, or page's hardcoded text if CMS field empty
```

## Testing

- **Backend:** migration runs; Filament form shows the new section and saves all six
  fields; `GET /solutions/{slug}` includes them. Manual check via the admin panel + a
  curl/HTTP request to the API endpoint.
- **Frontend:** unit tests for `formatHeroTitle` (escaping, `**...**` → span, newline →
  `<br/>`) and `heroCopy` (CMS value used when present; fallback used when empty/null;
  correct locale field chosen). Manual check: empty fields → page unchanged; filled
  fields → hero updates; language toggle switches ID/EN.

## Out of scope
- Per-page (vs per-solution) hero text for the shared pages.
- Making the hero stats / badges / "why" points / CTA dynamic.
- Any API write endpoint (Filament handles writes).
- Backfilling existing hardcoded copy into the DB (fields start empty; fallback covers it).
