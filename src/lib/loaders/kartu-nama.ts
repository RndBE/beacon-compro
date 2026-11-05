import { PUBLIC_API_BASE } from '$env/static/public';
import type { BusinessCardResponse } from '$lib/api';
import { findCard, fromApi, type BusinessCard } from '$lib/data/kartu-nama';

/**
 * Kartu dari CMS. 404 dari API berarti kartunya memang tidak ada atau dinonaktifkan,
 * sedangkan API yang mati/error jatuh ke data bawaan agar QR yang sudah tercetak tetap jalan.
 */
export async function loadCard(
	slug: string,
	fetch: typeof globalThis.fetch
): Promise<BusinessCard | undefined> {
	try {
		const res = await fetch(`${PUBLIC_API_BASE}/business-cards/${encodeURIComponent(slug)}`, {
			headers: { Accept: 'application/json' }
		});
		if (res.status === 404) return undefined;
		if (!res.ok) throw new Error(`API error: ${res.status}`);
		return fromApi((await res.json()) as BusinessCardResponse);
	} catch (e) {
		console.error('[KartuNama]', e);
		return findCard(slug);
	}
}
