import { api } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, fetch }) => {
	const page = url.searchParams.get('page') || '1';
	const category = url.searchParams.get('category') || '';

	let endpoint = `/articles?page=${page}`;
	if (category) {
		endpoint += `&category=${encodeURIComponent(category)}`;
	}

	try {
		const articlesResponse = await api<any>(endpoint, fetch);
		return {
			articlesResponse
		};
	} catch (error) {
		console.error('Failed to load articles:', error);
		return {
			articlesResponse: { data: [], current_page: 1, last_page: 1, total: 0 }
		};
	}
};
