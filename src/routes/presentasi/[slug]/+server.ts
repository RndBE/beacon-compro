import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Standalone presentation host.
 *
 * The presentation decks live verbatim in `src/lib/presentasi/<slug>/index.html`
 * (byte-for-byte copies of the original — see md5 check in commit notes). Their
 * runtime assets (styles.css, slides.css, deck-stage.js, logo) are served as-is
 * from `static/presentasi/<slug>/`.
 *
 * This is a raw endpoint (not a +page.svelte) on purpose: it bypasses the
 * beacon-compro app shell / +layout entirely and returns the original HTML
 * document untouched, so the deck renders pixel-identical to the source.
 *
 * The ONLY transform applied is prefixing the 4 relative asset references with
 * `/presentasi/<slug>/` so they resolve under the clean URL. Markup, styles and
 * the inlined React/Babel logic are never modified.
 */

// Bundled at build time as strings — works identically in dev and adapter-node.
const decks = import.meta.glob('../../../lib/presentasi/*/index.html', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

// Map "<slug>" -> raw html, derived from the file path.
const bySlug = new Map<string, string>(
	Object.entries(decks)
		.map(([path, html]) => {
			const m = path.match(/\/presentasi\/([^/]+)\/index\.html$/);
			return m ? ([m[1], html] as const) : null;
		})
		.filter((x): x is readonly [string, string] => x !== null)
);

/** Relative asset refs present in the source decks (verified via grep). */
const RELATIVE_ASSETS = [
	'href="styles.css"',
	'href="slides.css"',
	'src="deck-stage.js"',
	'src="logo_be%202.png"'
] as const;

function withAbsoluteAssets(html: string, slug: string): string {
	const prefix = `/presentasi/${slug}`;
	let out = html;
	for (const ref of RELATIVE_ASSETS) {
		// e.g. href="styles.css" -> href="/presentasi/<slug>/styles.css"
		const fixed = ref.replace('="', `="${prefix}/`);
		out = out.split(ref).join(fixed);
	}
	return out;
}

export const GET: RequestHandler = ({ params }) => {
	const slug = params.slug;
	const html = bySlug.get(slug);

	if (!html) {
		throw error(404, `Presentasi "${slug}" tidak ditemukan`);
	}

	return new Response(withAbsoluteAssets(html, slug), {
		headers: {
			'content-type': 'text/html; charset=utf-8',
			'cache-control': 'public, max-age=300'
		}
	});
};

// Pure static content keyed by slug — safe and cheap to prerender if desired.
export const prerender = false;
