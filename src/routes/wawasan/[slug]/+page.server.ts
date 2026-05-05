import { api } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	try {
		const data = await api<any>(`/articles/${params.slug}`, fetch);
		return {
			articleData: data
		};
	} catch (error) {
		console.error(`Failed to load article ${params.slug}:`, error);
		return {
			articleData: null
		};
	}
};
