import type { PageServerLoad } from './$types';
import { loadSubSolutionDetail, subSolutionSeo } from '$lib/loaders/sub-solution';

export const load: PageServerLoad = async ({ fetch }) => {
	const detail = await loadSubSolutionDetail('avwr', fetch);
	return { subSolutionDetail: detail, seo: subSolutionSeo(detail) };
};
