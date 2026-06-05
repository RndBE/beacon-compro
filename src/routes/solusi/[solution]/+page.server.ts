import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { loadSolutionDetail } from '$lib/loaders/solution';

/**
 * Catch-all for solutions that don't have a bespoke static folder.
 * Static routes (e.g. water-security) take priority; this only fires for
 * solution slugs without one — i.e. anything new the backend adds.
 */
export const load: PageServerLoad = async ({ params, fetch }) => {
	const detail = await loadSolutionDetail(params.solution, fetch);

	if (!detail?.solution) {
		throw error(404, `Solusi "${params.solution}" tidak ditemukan`);
	}

	return { solutionDetail: detail };
};
