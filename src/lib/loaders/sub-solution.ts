import { api } from '$lib/api';
import { clampDescription, type SeoMeta } from '$lib/seo';

export interface SpecItem {
	name: string;
	value: string;
}

export interface SpecCategory {
	category: string;
	items: SpecItem[];
}

export interface ProductComponentItem {
	id: number;
	name: string;
	type: string;
	image_1: string | null;
	image_2: string | null;
	specs: SpecCategory[];
}

export interface ProductItem {
	id: number;
	name: string;
	slug: string;
	highlight_points: string[] | null;
	description: string | null;
	thumbnail: string | null;
	main_image: string | null;
	brochure_pdf: string | null;
	link_lkpp_general: string | null;
	link_lkpp_regency: string | null;
	link_tkdn: string | null;
	use_case: string | null;
	components: ProductComponentItem[];
	device_series: { name: string; type: string; image_1: string | null; image_2: string | null }[];
}

export interface TrackRecordItem {
	id: number;
	project_name: string;
	client: string;
	year: string;
	location: string | null;
}

export interface TrackRecordDisplayItem {
	name: string;
	client: string;
	year: string;
	location?: string | null;
}

export interface SubSolutionDetailResponse {
	sub_solution: {
		id: number;
		name: string;
		slug: string;
		abbreviation: string;
		main_content: string | null;
		support_content: string | null;
		application_content: string | null;
		icon: string | null;
		video_url: string | null;
		file_3d_local: string | null;
		link_3d: string | null;
		solution: {
			name: string;
			slug: string;
			color: string;
		};
	};
	features: { id: number; title: string; description: string; icon: string | null }[];
	gallery: { id: number; image: string; caption: string | null }[];
	products: ProductItem[];
	track_records: TrackRecordItem[];
}

/**
 * Reusable loader for sub-solution detail pages (e.g. awlr, adr, afmr)
 * Fetches products (variants) from the API.
 */
export async function loadSubSolutionDetail(slug: string, fetchFn: typeof fetch) {
	try {
		return await api<SubSolutionDetailResponse>(`/sub-solutions/${slug}`, fetchFn);
	} catch (err) {
		console.error(`[SubSolution/${slug}] Failed to load:`, err);
		return null;
	}
}

export function mapTrackRecords(
	trackRecords: TrackRecordItem[] | null | undefined,
	fallbackRecords: TrackRecordDisplayItem[]
): TrackRecordDisplayItem[] {
	if (!trackRecords?.length) {
		return fallbackRecords;
	}

	return trackRecords.map((record) => ({
		name: record.project_name,
		client: record.client,
		year: record.year,
		location: record.location
	}));
}

/** Meta halaman sub-solusi: dirangkai dari konten utama dan galeri produk. */
export function subSolutionSeo(detail: SubSolutionDetailResponse | null): SeoMeta | undefined {
	if (!detail?.sub_solution) return undefined;

	const sub = detail.sub_solution;
	const label = sub.abbreviation ? `${sub.name} (${sub.abbreviation})` : sub.name;
	const body = clampDescription(sub.main_content, 200);
	const productNames = (detail.products ?? [])
		.map((product) => product.name)
		.slice(0, 4)
		.join(', ');

	// Galeri sering kosong untuk sub-solusi baru; jatuh ke gambar produk dulu
	// sebelum menyerah ke logo default.
	const image =
		detail.gallery?.[0]?.image ??
		detail.products?.find((product) => product.main_image || product.thumbnail)?.main_image ??
		detail.products?.find((product) => product.thumbnail)?.thumbnail ??
		null;

	return {
		title: `${label} — ${sub.solution?.name ?? 'Solusi'} Beacon Engineering`,
		description:
			body ||
			clampDescription(
				`${label} dari Beacon Engineering${productNames ? `. Varian: ${productNames}` : ''}.`,
				200
			),
		image,
		type: 'website'
	};
}
