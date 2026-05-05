import type { PageServerLoad } from './$types';
import { loadSubSolutionDetail } from '$lib/loaders/sub-solution';

export const load: PageServerLoad = async ({ fetch }) => {
	const detail = await loadSubSolutionDetail('awlr', fetch);
	return { subSolutionDetail: detail };
};
