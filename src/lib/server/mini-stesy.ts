// Proxy to the mini-stesy integration API for the SPAM Wosusokas demo. The read-only
// account (MINI_STESY_URL / _USER / _PASS, private env) never reaches the browser, and
// responses are cached briefly so a room full of demo viewers does not hit production
// once per widget.

import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export class MiniStesyError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
	}
}

const cache = new Map<string, { until: number; body: Promise<unknown> }>();
const MAX_ENTRIES = 400;

/** GET /api/integrasi{path} with Basic auth, memoised for ttlMs (failures are not kept). */
export function miniStesy(path: '' | '/all_logger' | '/agregat', query: Record<string, string>, ttlMs: number) {
	const { MINI_STESY_URL: base, MINI_STESY_USER: user, MINI_STESY_PASS: pass } = env;
	if (!base || !user || !pass) return Promise.reject(new MiniStesyError(503, 'Koneksi mini-stesy belum dikonfigurasi.'));

	const url = new URL(`/api/integrasi${path}`, base);
	for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
	const key = url.toString();

	const hit = cache.get(key);
	if (hit && hit.until > Date.now()) return hit.body;

	const body = fetch(url, {
		headers: { authorization: `Basic ${btoa(`${user}:${pass}`)}`, accept: 'application/json' },
		signal: AbortSignal.timeout(20_000)
	}).then((res) => {
		// 404 = logger outside the account's access, 422 = range too wide; anything else is upstream trouble
		if (!res.ok) throw new MiniStesyError(res.status === 404 || res.status === 422 ? res.status : 502, `mini-stesy menjawab ${res.status}`);
		return res.json();
	});

	if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value!);
	cache.set(key, { until: Date.now() + ttlMs, body });
	body.catch(() => cache.delete(key));
	return body;
}

/** The proxied JSON, never cached by the browser or a shared cache. */
export async function relay(body: Promise<unknown>) {
	try {
		return json(await body, { headers: { 'cache-control': 'private, no-store' } });
	} catch (e) {
		const status = e instanceof MiniStesyError ? e.status : 502;
		console.error('[DemoSpam] mini-stesy:', e instanceof Error ? e.message : e);
		error(status, status === 503 ? 'Koneksi data lapangan belum dikonfigurasi.' : 'Data lapangan sedang tidak bisa diambil.');
	}
}
