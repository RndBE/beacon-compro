import { api } from '$lib/api';
import { clampDescription, type SeoMeta } from '$lib/seo';

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
	thumbnail: string | null;
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

/** Meta halaman solusi: judul, deskripsi, dan gambar dari data API. */
export function solutionSeo(detail: SolutionDetailResponse | null): SeoMeta | undefined {
	if (!detail?.solution) return undefined;

	const { solution, sub_solutions } = detail;
	const subNames = (sub_solutions ?? [])
		.map((sub) => sub.abbreviation || sub.name)
		.filter(Boolean)
		.slice(0, 6)
		.join(', ');

	return {
		title: `${solution.name} — Solusi Monitoring Beacon Engineering`,
		description: clampDescription(
			[solution.description, subNames && `Mencakup ${subNames}.`].filter(Boolean).join(' '),
			200
		),
		image: solution.thumbnail,
		type: 'website'
	};
}
