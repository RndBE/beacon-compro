import type { PageServerLoad } from './$types';
import { PUBLIC_API_BASE } from '$env/static/public';
import type { SeoMeta } from '$lib/seo';

const SOLUSI_SEO: SeoMeta = {
	title: 'Solusi Monitoring & Telemetri — Beacon Engineering',
	description:
		'Lima pilar solusi Beacon Engineering: keamanan air, cuaca dan iklim, peringatan dini, keamanan infrastruktur, serta platform monitoring digital.',
	type: 'website'
};

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const res = await fetch(`${PUBLIC_API_BASE}/solutions`, {
			headers: { Accept: 'application/json' }
		});
		if (!res.ok) throw new Error(`API ${res.status}`);
		const apiSolutions = await res.json();
		return { apiSolutions, seo: SOLUSI_SEO };
	} catch (err) {
		console.error('[Solusi] Failed to load solutions:', err);
		return { apiSolutions: null, seo: SOLUSI_SEO };
	}
};
