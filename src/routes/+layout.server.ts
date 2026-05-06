import type { LayoutServerLoad } from './$types';
import { api, type ArticleSummary, type SolutionSummary } from '$lib/api';

type ArticlesResponse = {
	data?: ArticleSummary[];
};

export const load: LayoutServerLoad = async ({ fetch }) => {
	const [solutionsResult, articlesResult] = await Promise.allSettled([
		api<SolutionSummary[]>('/solutions', fetch),
		api<ArticlesResponse>('/articles?page=1', fetch)
	]);

	if (solutionsResult.status === 'rejected') {
		console.error('[Layout] Failed to load solutions:', solutionsResult.reason);
	}

	if (articlesResult.status === 'rejected') {
		console.error('[Layout] Failed to load latest article:', articlesResult.reason);
	}

	return {
		solutions: solutionsResult.status === 'fulfilled' ? solutionsResult.value : null,
		latestArticle:
			articlesResult.status === 'fulfilled'
				? articlesResult.value.data?.[0] ?? null
				: null
	};
};
