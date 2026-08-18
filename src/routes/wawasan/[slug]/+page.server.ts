import { error } from '@sveltejs/kit';
import { api } from '$lib/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	try {
		const data = await api<any>(`/articles/${params.slug}`, fetch);
		const article = data?.article;

		return {
			articleData: data,
			seo: article
				? {
						title: article.title,
						description: article.excerpt ?? '',
						image: article.thumbnail ?? null,
						type: 'article' as const,
						publishedTime: article.published_at ?? null,
						modifiedTime: article.updated_at ?? article.published_at ?? null,
						section: article.category ?? null,
						tags: article.tags ?? []
					}
				: undefined
		};
	} catch (err) {
		console.error(`[Article] Failed to load ${params.slug}:`, err);

		// Slug yang tidak ada harus 404, bukan halaman 200 berisi "tidak ditemukan",
		// supaya crawler tidak menganggapnya duplikat. Error lain (backend mati)
		// tetap merender fallback.
		if (String(err).includes('404')) {
			error(404, 'Artikel tidak ditemukan');
		}

		return {
			articleData: null
		};
	}
};
