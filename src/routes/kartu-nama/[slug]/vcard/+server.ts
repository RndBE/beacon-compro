import { error } from '@sveltejs/kit';
import { buildVcard } from '$lib/data/kartu-nama';
import { loadCard } from '$lib/loaders/kartu-nama';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url, fetch }) => {
	const card = await loadCard(params.slug, fetch);
	if (!card) error(404, 'Kartu nama tidak ditemukan');

	const lang = url.searchParams.get('lang') === 'en' ? 'EN' : 'ID';

	return new Response(buildVcard(card, lang), {
		headers: {
			'Content-Type': 'text/vcard; charset=utf-8',
			// inline: iOS Safari langsung menawarkan "Tambah Kontak", browser lain mengunduh .vcf.
			'Content-Disposition': `inline; filename="${card.slug}.vcf"`
		}
	});
};
