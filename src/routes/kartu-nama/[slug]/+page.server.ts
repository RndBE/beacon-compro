import { error } from '@sveltejs/kit';
import { interpolate } from '$lib/data/kartu-nama';
import { translations as tr } from '$lib/i18n';
import { loadCard } from '$lib/loaders/kartu-nama';
import type { SeoMeta } from '$lib/seo';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const card = await loadCard(params.slug, fetch);
	if (!card) error(404, 'Kartu nama tidak ditemukan');

	return {
		card,
		// Pratinjau tautan (WhatsApp, dsb.) dibaca server tanpa locale, jadi pakai ID.
		seo: {
			title: interpolate(tr['card.meta.title'].ID, card, 'ID'),
			description: interpolate(tr['card.meta.desc'].ID, card, 'ID'),
			image: card.photo,
			type: 'website'
		} satisfies SeoMeta
	};
};
