import type { PageServerLoad } from './$types';
import { api, type ClientSummary, type TestimonialSummary } from '$lib/api';

interface AboutPageData {
	visi: string | null;
	misi: string[];
	hero_title: string | null;
	hero_subtitle: string | null;
	hero_tagline: string | null;
	milestones: { year: string; title: string; desc: string }[];
	certifications: {
		title: string;
		subtitle: string | null;
		desc: string;
		style: 'light' | 'dark';
		icon_name: string | null;
		status_label: string;
	}[];
	contributions: {
		title: string;
		desc: string;
		metric: string;
		metric_label: string;
		icon_name: string | null;
	}[];
}

export const load: PageServerLoad = async ({ fetch }) => {
	const [clients, aboutPage, testimonials] = await Promise.all([
		api<ClientSummary[]>('/clients', fetch).catch(() => []),
		api<AboutPageData>('/about-page', fetch).catch(() => null),
		api<TestimonialSummary[]>('/testimonials?limit=50', fetch).catch(() => [])
	]);

	return {
		clients: clients ?? [],
		aboutPage,
		testimonials: testimonials ?? []
	};
};
