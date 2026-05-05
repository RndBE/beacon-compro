import type { PageServerLoad } from './$types';
import { api, type HomepageData } from '$lib/api';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const data = await api<HomepageData>('/homepage', fetch);
		return { homepage: data };
	} catch (err) {
		console.error('[Beranda] Failed to load homepage data:', err);
		return { homepage: null };
	}
};
