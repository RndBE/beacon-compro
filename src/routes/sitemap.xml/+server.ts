import { api, type SolutionSummary } from '$lib/api';
import { SITE_URL } from '$lib/seo';
import type { RequestHandler } from './$types';

type ArticleSitemapEntry = {
	slug: string;
	published_at: string | null;
	updated_at: string | null;
};

type ArticleSitemapResponse = {
	data?: ArticleSitemapEntry[];
};

type SitemapUrl = {
	loc: string;
	lastmod?: string | null;
	changefreq?: string;
	priority?: string;
};

/** Halaman statis yang boleh diindeks. /demo, /presentasi, dan /hris sengaja dilewat. */
const STATIC_PAGES: SitemapUrl[] = [
	{ loc: '/', changefreq: 'weekly', priority: '1.0' },
	{ loc: '/solusi', changefreq: 'weekly', priority: '0.9' },
	{ loc: '/proyek', changefreq: 'weekly', priority: '0.8' },
	{ loc: '/wawasan', changefreq: 'daily', priority: '0.8' },
	{ loc: '/tentang-kami', changefreq: 'monthly', priority: '0.7' },
	{ loc: '/kontak', changefreq: 'monthly', priority: '0.6' },
	{ loc: '/privacy-policy', changefreq: 'yearly', priority: '0.2' },
	{ loc: '/terms-of-service', changefreq: 'yearly', priority: '0.2' }
];

function xmlEscape(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function renderUrl(entry: SitemapUrl): string {
	const parts = [`\t\t<loc>${xmlEscape(`${SITE_URL}${entry.loc}`)}</loc>`];

	if (entry.lastmod) {
		parts.push(`\t\t<lastmod>${xmlEscape(entry.lastmod)}</lastmod>`);
	}
	if (entry.changefreq) {
		parts.push(`\t\t<changefreq>${entry.changefreq}</changefreq>`);
	}
	if (entry.priority) {
		parts.push(`\t\t<priority>${entry.priority}</priority>`);
	}

	return `\t<url>\n${parts.join('\n')}\n\t</url>`;
}

export const GET: RequestHandler = async ({ fetch, setHeaders }) => {
	const [articlesResult, solutionsResult] = await Promise.allSettled([
		api<ArticleSitemapResponse>('/articles/sitemap', fetch),
		api<SolutionSummary[]>('/solutions', fetch)
	]);

	if (articlesResult.status === 'rejected') {
		console.error('[Sitemap] Failed to load articles:', articlesResult.reason);
	}
	if (solutionsResult.status === 'rejected') {
		console.error('[Sitemap] Failed to load solutions:', solutionsResult.reason);
	}

	const urls: SitemapUrl[] = [...STATIC_PAGES];

	if (solutionsResult.status === 'fulfilled' && Array.isArray(solutionsResult.value)) {
		for (const solution of solutionsResult.value) {
			urls.push({
				loc: `/solusi/${solution.slug}`,
				changefreq: 'monthly',
				priority: '0.8'
			});

			for (const sub of solution.sub_solutions ?? []) {
				urls.push({
					loc: `/solusi/${solution.slug}/${sub.slug}`,
					changefreq: 'monthly',
					priority: '0.7'
				});
			}
		}
	}

	if (articlesResult.status === 'fulfilled') {
		for (const article of articlesResult.value.data ?? []) {
			urls.push({
				loc: `/wawasan/${article.slug}`,
				lastmod: article.updated_at || article.published_at,
				changefreq: 'monthly',
				priority: '0.7'
			});
		}
	}

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(renderUrl).join('\n')}
</urlset>`;

	setHeaders({
		'content-type': 'application/xml; charset=utf-8',
		'cache-control': 'public, max-age=3600'
	});

	return new Response(body);
};
