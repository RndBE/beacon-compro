import type { PageServerLoad } from './$types';
import { api } from '$lib/api';
import type { SeoMeta } from '$lib/seo';

const PROYEK_SEO: SeoMeta = {
	title: 'Proyek & Track Record — Beacon Engineering',
	description:
		'Rekam jejak pemasangan sistem telemetri dan monitoring Beacon Engineering di bendungan, sungai, irigasi, tambang, dan kawasan industri di seluruh Indonesia.',
	type: 'website'
};

export interface ProjectListItem {
	id: number;
	name: string;
	slug: string;
	thumbnail: string | null;
	year: string;
	location: string;
	is_featured: boolean;
	client_name: string | null;
	client_logo: string | null;
	category_name: string | null;
	category_slug: string | null;
}

interface PaginatedProjects {
	current_page: number;
	data: ProjectListItem[];
	last_page: number;
	total: number;
}

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const data = await api<PaginatedProjects>('/projects?per_page=50', fetch);
		return { projects: data.data, total: data.total, seo: PROYEK_SEO };
	} catch (err) {
		console.error('[Proyek] Failed to load projects:', err);
		return { projects: null, total: 0, seo: PROYEK_SEO };
	}
};
