import type { PageServerLoad } from './$types';
import { loadSolutionDetail } from '$lib/loaders/solution';

export const load: PageServerLoad = async ({ fetch }) => {
	const detail = await loadSolutionDetail('pressure-measurement', fetch);
	return { solutionDetail: detail };
};
