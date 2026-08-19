import type { PageServerLoad } from './$types';
import { loadSolutionDetail, solutionSeo } from '$lib/loaders/solution';

export const load: PageServerLoad = async ({ fetch }) => {
	const detail = await loadSolutionDetail('infrastructure-security', fetch);
	return { solutionDetail: detail, seo: solutionSeo(detail) };
};
