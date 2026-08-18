/**
 * SEO helpers — canonical URL, meta description, dan JSON-LD.
 *
 * Domain publik di-hardcode karena dipakai saat SSR maupun di sitemap.xml,
 * dan build di server tidak boleh gagal hanya karena satu env var belum diisi.
 */
export const SITE_URL = 'https://be-jogja.com';
export const SITE_NAME = 'Beacon Engineering';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo_be.png`;

/**
 * Melengkapi tanggal `Y-m-d` dari API jadi ISO 8601 penuh (zona WIB), karena
 * `article:published_time` dan schema.org mengharapkan datetime, bukan tanggal.
 */
export function toIsoDateTime(value: string | null | undefined): string | null {
	if (!value) return null;
	if (value.includes('T')) return value;
	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T00:00:00+07:00`;

	return value;
}

export type SeoMeta = {
	title?: string;
	description?: string;
	image?: string | null;
	type?: 'website' | 'article';
	publishedTime?: string | null;
	modifiedTime?: string | null;
	section?: string | null;
	tags?: string[];
};

/** Menyusun URL absolut dari path relatif; URL absolut dibiarkan apa adanya. */
export function absoluteUrl(path: string | null | undefined): string {
	if (!path) return SITE_URL;
	if (path.startsWith('http://') || path.startsWith('https://')) return path;
	return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * Memotong teks jadi meta description yang tidak terpotong di hasil pencarian.
 * Potongan jatuh di batas kata, bukan di tengah kata.
 */
export function clampDescription(text: string | null | undefined, max = 160): string {
	if (!text) return '';

	const clean = text
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

	if (clean.length <= max) return clean;

	const cut = clean.slice(0, max - 1);
	const lastSpace = cut.lastIndexOf(' ');

	return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:\-—]$/, '')}…`;
}

/**
 * Judul untuk tag <title>. Suffix merek dilepas kalau judul artikelnya sudah
 * panjang, supaya tidak terpotong di SERP.
 */
export function pageTitle(title: string | null | undefined, suffix = SITE_NAME): string {
	const base = (title ?? '').trim();
	if (!base) return suffix;
	if (base.length > 52) return base;
	return `${base} — ${suffix}`;
}

/** Canonical URL: origin publik + pathname, query dibuang kecuali `page`. */
export function canonicalUrl(url: URL): string {
	const path = url.pathname.replace(/\/+$/, '') || '/';
	const pageParam = url.searchParams.get('page');
	const suffix = pageParam && pageParam !== '1' ? `?page=${pageParam}` : '';

	return `${SITE_URL}${path}${suffix}`;
}

/** Serialisasi JSON-LD yang aman ditempel ke dalam <script>. */
export function jsonLdScript(data: unknown): string {
	const json = JSON.stringify(data).replace(/</g, '\\u003c');

	return `<script type="application/ld+json">${json}</script>`;
}

export function articleJsonLd(input: {
	title: string;
	description: string;
	url: string;
	image?: string | null;
	author?: string | null;
	category?: string | null;
	publishedAt?: string | null;
	updatedAt?: string | null;
	tags?: string[];
}) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: input.title,
		description: input.description,
		mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
		url: input.url,
		...(input.image ? { image: [input.image] } : {}),
		...(input.publishedAt ? { datePublished: toIsoDateTime(input.publishedAt) } : {}),
		dateModified: toIsoDateTime(input.updatedAt || input.publishedAt) ?? undefined,
		...(input.category ? { articleSection: input.category } : {}),
		...(input.tags?.length ? { keywords: input.tags.join(', ') } : {}),
		author: {
			'@type': 'Organization',
			name: input.author || SITE_NAME,
			url: SITE_URL
		},
		publisher: {
			'@type': 'Organization',
			name: SITE_NAME,
			url: SITE_URL,
			logo: { '@type': 'ImageObject', url: DEFAULT_OG_IMAGE }
		},
		inLanguage: 'id-ID'
	};
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: absoluteUrl(item.path)
		}))
	};
}

export function itemListJsonLd(input: {
	name: string;
	description: string;
	url: string;
	items: Array<{ title: string; path: string }>;
}) {
	return {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: input.name,
		description: input.description,
		url: input.url,
		inLanguage: 'id-ID',
		mainEntity: {
			'@type': 'ItemList',
			itemListElement: input.items.map((item, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: item.title,
				url: absoluteUrl(item.path)
			}))
		}
	};
}
