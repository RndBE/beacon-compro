import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { loadSubSolutionDetail } from '$lib/loaders/sub-solution';

/**
 * Catch-all for sub-solutions that don't have a bespoke static folder.
 * Static routes (e.g. water-security/awlr) take priority; this only fires
 * for slugs without one — i.e. anything new the backend adds.
 */
export const load: PageServerLoad = async ({ params, fetch }) => {
	const detail = await loadSubSolutionDetail(params.subSolution, fetch);

	if (!detail?.sub_solution) {
		throw error(404, `Sub-solusi "${params.subSolution}" tidak ditemukan`);
	}

	// Canonicalize: every sub-solution lives under its real parent solution.
	// If the URL's solution segment doesn't match, redirect to the canonical URL.
	const canonical = detail.sub_solution.solution?.slug;
	if (canonical && canonical !== params.solution) {
		throw redirect(307, `/solusi/${canonical}/${params.subSolution}`);
	}

	return { subSolutionDetail: detail };
};
