import type { PageLoad } from './$types';
import type { SeoMeta } from '$lib/seo';

/** Halaman statis, hanya perlu meta untuk canonical dan Open Graph. */
export const load: PageLoad = () => ({
	seo: {
		title: 'Kontak — Beacon Engineering',
		description:
			'Hubungi tim Beacon Engineering untuk konsultasi kebutuhan monitoring, telemetri, dan instrumentasi lapangan di lokasi proyek Anda.',
		type: 'website'
	} satisfies SeoMeta
});
