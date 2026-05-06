import { PUBLIC_API_BASE, PUBLIC_STORAGE_BASE } from '$env/static/public';

/**
 * Converts a relative storage path (e.g. /storage/articles/...)
 * to a full URL pointing to the backend server.
 */
export function storageUrl(path: string | null | undefined): string | null {
	if (!path) return null;
	if (path.startsWith('http://') || path.startsWith('https://')) return path;
	return `${PUBLIC_STORAGE_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * Typed API fetcher for the Beacon backend.
 * Uses server-side fetch when available (SSR), falls back to browser fetch.
 */
export async function api<T>(
	endpoint: string,
	fetchFn: typeof fetch = fetch
): Promise<T> {
	const url = `${PUBLIC_API_BASE}${endpoint}`;
	const res = await fetchFn(url, {
		headers: { Accept: 'application/json' }
	});

	if (!res.ok) {
		console.error(`[API] ${res.status} — ${url}`);
		throw new Error(`API error: ${res.status}`);
	}

	return res.json();
}

// ─── Response Types ───────────────────────────

export interface SolutionSummary {
	id: number;
	name: string;
	slug: string;
	description: string;
	thumbnail: string | null;
	icon: string | null;
	color: string;
	sub_solutions_count: number;
	products_count: number;
	sub_solutions?: SolutionMenuSubSolution[];
}

export interface SolutionMenuSubSolution {
	id: number;
	name: string;
	slug: string;
	abbreviation: string | null;
}

export interface FeaturedProject {
	name: string;
	slug: string;
	thumbnail: string | null;
	year: string;
	location: string;
	client_name: string | null;
	category_name: string | null;
}

export interface ClientSummary {
	name: string;
	logo: string | null;
	website: string | null;
}

export interface TestimonialSummary {
	id: number;
	name: string;
	position: string | null;
	organization: string | null;
	quote: string;
	photo: string | null;
	initials: string;
	is_featured: boolean;
	client_name: string | null;
	client_logo: string | null;
	project_name: string | null;
	project_slug: string | null;
}

export interface ArticleSummary {
	title: string;
	slug: string;
	excerpt: string | null;
	category: string | null;
	category_color: string;
	read_time: string | null;
	thumbnail: string | null;
	published_at: string | null;
}

export interface HomepageDataLogger {
	id: string;
	name: string;
	tagline: string | null;
	desc: string | null;
	features: string[];
	image: string | null;
	image_srcset?: string | null;
	media_type: 'image' | 'video' | null;
}

export interface HomepageData {
	hero: Record<string, string>;
	stats: Record<string, string>;
	solutions: SolutionSummary[];
	data_loggers: HomepageDataLogger[];
	featured_projects: FeaturedProject[];
	clients: ClientSummary[];
	testimonials: TestimonialSummary[];
	recent_articles: ArticleSummary[];
}

// ─── Search Types ─────────────────────────────

export interface SearchResult {
	type: string;
	title: string;
	description: string | null;
	slug: string;
	href: string;
	icon: string | null;
	thumbnail: string | null;
	category?: string;
}

export interface SearchResponse {
	query: string;
	count: number;
	results: SearchResult[];
}
