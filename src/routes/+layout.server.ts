import type { LayoutServerLoad } from './$types';
import { api, type SolutionSummary } from '$lib/api';

export const load: LayoutServerLoad = async ({ fetch }) => {
	try {
		const solutions = await api<SolutionSummary[]>('/solutions', fetch);
		return { solutions };
	} catch (err) {
		console.error('[Layout] Failed to load solutions:', err);
		return { solutions: null };
	}
};
