import { api } from '$lib/api';
import type { PageServerLoad } from './$types';

const kategoriMap: Record<string, string> = {
	'studi-kasus': 'Studi Kasus',
	'artikel-teknis': 'Artikel Teknis',
	'berita-produk': 'Berita Produk'
};
const categories = ['Studi Kasus', 'Artikel Teknis', 'Berita Produk'];

export const load: PageServerLoad = async ({ url, fetch }) => {
	const requestedPage = Number(url.searchParams.get('page') || '1');
	const page = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1;
	const legacyKategori = url.searchParams.get('kategori') || '';
	const requestedCategory = url.searchParams.get('category') || kategoriMap[legacyKategori] || '';
	const category = categories.includes(requestedCategory) ? requestedCategory : '';

	let endpoint = `/articles?page=${page}`;
	if (category) {
		endpoint += `&category=${encodeURIComponent(category)}`;
	}

	try {
		const articlesResponse = await api<any>(endpoint, fetch);
		return {
			articlesResponse,
			activeCategory: category,
			seo: {
				title: category
					? `${category} — Wawasan Beacon Engineering`
					: 'Wawasan — Studi Kasus & Artikel Teknis',
				description:
					'Studi kasus, artikel teknis, dan berita produk dari Beacon Engineering seputar telemetri dan monitoring infrastruktur air, cuaca, serta geoteknik di Indonesia.',
				type: 'website' as const
			}
		};
	} catch (error) {
		console.error('Failed to load articles:', error);
		return {
			activeCategory: category,
			articlesResponse: {
				data: [],
				current_page: 1,
				last_page: 1,
				total: 0,
				stats: {
					total: 0,
					categories: {}
				}
			}
		};
	}
};
