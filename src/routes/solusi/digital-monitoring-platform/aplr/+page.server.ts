import type { PageServerLoad } from './$types';
import { loadSubSolutionDetail, subSolutionSeo } from '$lib/loaders/sub-solution';

export const load: PageServerLoad = async ({ fetch }) => {
	const detail = await loadSubSolutionDetail('aplr', fetch);
	return { subSolutionDetail: detail, seo: subSolutionSeo(detail) };
};
