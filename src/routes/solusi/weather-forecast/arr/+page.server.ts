import type { PageServerLoad } from './$types';
import { loadSubSolutionDetail } from '$lib/loaders/sub-solution';

export const load: PageServerLoad = async ({ fetch }) => {
	const detail = await loadSubSolutionDetail('arr', fetch);
	return { subSolutionDetail: detail };
};
