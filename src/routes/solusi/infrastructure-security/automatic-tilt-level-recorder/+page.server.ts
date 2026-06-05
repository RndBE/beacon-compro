import type { PageServerLoad } from './$types';
import { loadSubSolutionDetail } from '$lib/loaders/sub-solution';

export const load: PageServerLoad = async ({ fetch }) => {
	const detail = await loadSubSolutionDetail('automatic-tilt-level-recorder', fetch);
	return { subSolutionDetail: detail };
};
