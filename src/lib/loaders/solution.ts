import { api } from '$lib/api';

export interface SolutionDetail {
	id: number;
	name: string;
	slug: string;
	description: string;
	thumbnail: string | null;
	icon: string | null;
	color: string;
}

export interface SubSolutionItem {
	id: number;
	name: string;
	slug: string;
	abbreviation: string;
	icon: string | null;
	products_count: number;
}

export interface SolutionDetailResponse {
	solution: SolutionDetail;
	sub_solutions: SubSolutionItem[];
}

/**
 * Reusable loader for solution detail pages
 */
export async function loadSolutionDetail(slug: string, fetchFn: typeof fetch) {
	try {
		return await api<SolutionDetailResponse>(`/solutions/${slug}`, fetchFn);
	} catch (err) {
		console.error(`[Solusi/${slug}] Failed to load:`, err);
		return null;
	}
}
