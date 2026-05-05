import type { PageServerLoad } from './$types';
import { PUBLIC_API_BASE } from '$env/static/public';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const res = await fetch(`${PUBLIC_API_BASE}/solutions`, {
			headers: { Accept: 'application/json' }
		});
		if (!res.ok) throw new Error(`API ${res.status}`);
		const apiSolutions = await res.json();
		return { apiSolutions };
	} catch (err) {
		console.error('[Solusi] Failed to load solutions:', err);
		return { apiSolutions: null };
	}
};
