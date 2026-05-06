<script lang="ts">
	import ArticleLayout from '$lib/components/ArticleLayout.svelte';
	import { page } from '$app/stores';
	import { PUBLIC_STORAGE_BASE } from '$env/static/public';

	let { data } = $props();
	
	let article = $derived(data.articleData?.article);
	let related = $derived(data.articleData?.related_articles || []);

	// Replace relative /storage/ paths in HTML content with full backend URL
	function processContent(html: string): string {
		if (!html) return '';
		return html.replace(/(?:src|href)="(\/storage\/[^"]+)"/g, (match, path) => {
			const attr = match.startsWith('src') ? 'src' : 'href';
			return `${attr}="${PUBLIC_STORAGE_BASE}${path}"`;
		});
	}

	let processedContent = $derived(processContent(article?.content || ''));

	// Format related articles to match ArticleLayout expected props
	let formattedRelated = $derived(
		related.map((r: any) => ({
			href: `/wawasan/${r.slug}`,
			category: article?.category || 'Wawasan',
			categoryColor: article?.category_color || '#C8102E',
			title: r.title,
			readTime: r.read_time || '5 min'
		}))
	);
</script>

<svelte:head>
	<title>{article?.title ? `${article.title} — Beacon Engineering` : 'Wawasan — Beacon Engineering'}</title>
	<meta name="description" content={article?.excerpt || 'Artikel wawasan dan studi kasus Beacon Engineering.'} />
</svelte:head>

{#if article}
	<ArticleLayout
		title={article.title}
		description={article.excerpt || ''}
		category={article.category || 'Berita'}
		categoryColor={article.category_color || '#C8102E'}
		date={article.published_at || ''}
		readTime={article.read_time || '5 min'}
		tags={article.tags || []}
		ctaTitle="Punya Kebutuhan Serupa?"
		ctaDesc="Bicara dengan tim engineer kami untuk merancang solusi yang tepat untuk proyek Anda."
		ctaButtonLabel="Konsultasi Sekarang"
		ctaWhatsApp={`https://wa.me/628112632151?text=Halo%20CS%20Marketing%20Beacon%2C%20saya%20tertarik%20setelah%20membaca%20artikel%20${article.title}.`}
		ctaSecondary={{ href: '/solusi', label: 'Lihat Semua Solusi' }}
		relatedArticles={formattedRelated}
	>
		<!-- Render content as HTML directly from database -->
		<div class="article-content">
			{@html processedContent}
		</div>
	</ArticleLayout>
{:else}
	<div class="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
		<h1 class="text-3xl font-bold mb-4">Artikel Tidak Ditemukan</h1>
		<p class="text-gray-500 mb-8">Artikel yang Anda cari mungkin telah dihapus atau URL tidak valid.</p>
		<a href="/wawasan" class="px-6 py-3 bg-[#C8102E] text-white rounded-xl font-medium">Kembali ke Wawasan</a>
	</div>
{/if}

<style>
	/* Some basic styles to ensure HTML from DB renders well within the layout */
	:global(.article-content p) {
		margin-bottom: 1.25rem;
	}
	:global(.article-content h2) {
		margin-top: 2.5rem;
		margin-bottom: 1rem;
		color: #111827;
		font-size: 1.5rem;
		font-weight: 800;
		line-height: 1.25;
		letter-spacing: 0;
	}
	:global(.article-content h3) {
		margin-top: 2rem;
		margin-bottom: 0.85rem;
		color: #111827;
		font-size: 1.15rem;
		font-weight: 750;
		line-height: 1.35;
		letter-spacing: 0;
	}
	:global(.article-content ul) {
		margin-bottom: 1.5rem;
	}

	:global(.article-content .beacon-article-figure) {
		margin: 2rem 0;
	}

	:global(.article-content .beacon-article-image) {
		display: block;
		width: 100%;
		max-height: 520px;
		border-radius: 18px;
		object-fit: cover;
	}

	:global(.article-content .beacon-callout) {
		margin: 1.75rem 0;
		border-left: 4px solid #c8102e;
		border-radius: 16px;
		background: #fff1f2;
		padding: 1.25rem;
	}

	:global(.article-content .beacon-callout-soft) {
		border-left-color: #64748b;
		background: #f8fafc;
	}

	:global(.article-content .beacon-callout strong) {
		display: block;
		margin-bottom: 0.4rem;
		color: #9f1239;
	}

	:global(.article-content .beacon-callout p) {
		margin: 0;
	}

	:global(.article-content .beacon-metric-grid),
	:global(.article-content .beacon-benefit-grid) {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
		margin: 1.75rem 0;
	}

	:global(.article-content .beacon-metric-card),
	:global(.article-content .beacon-benefit-card) {
		border: 1px solid #e5e7eb;
		border-radius: 16px;
		background: #ffffff;
		box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
		padding: 1.25rem;
	}

	:global(.article-content .beacon-metric-card span) {
		display: block;
		color: #9ca3af;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	:global(.article-content .beacon-metric-card strong) {
		display: block;
		margin-top: 0.5rem;
		color: #c8102e;
		font-size: clamp(1.4rem, 3vw, 2rem);
		font-weight: 800;
		line-height: 1.15;
	}

	:global(.article-content .beacon-benefit-card strong) {
		display: block;
		color: #111827;
		margin-bottom: 0.5rem;
	}

	:global(.article-content .beacon-benefit-card p) {
		color: #4b5563;
		margin: 0;
	}

	:global(.article-content .beacon-highlight-band) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin: 1.75rem 0;
		border: 1px solid #fecdd3;
		border-radius: 18px;
		background: #fff1f2;
		padding: 1.35rem;
	}

	:global(.article-content .beacon-highlight-band span) {
		color: #9ca3af;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	:global(.article-content .beacon-highlight-band strong) {
		color: #be123c;
		line-height: 1.45;
	}

	:global(.article-content .beacon-quote-card) {
		margin: 1.75rem 0;
		border: 1px solid #fee2e2;
		border-radius: 18px;
		background: #fffafa;
		padding: 1.5rem;
	}

	:global(.article-content .beacon-quote-card p) {
		color: #374151;
		font-style: italic;
		line-height: 1.75;
		margin: 0 0 1rem;
	}

	:global(.article-content .beacon-quote-card footer) {
		color: #6b7280;
		font-size: 0.9rem;
		font-weight: 650;
	}

	:global(.article-content .beacon-process) {
		display: grid;
		gap: 0.85rem;
		margin: 1.75rem 0;
	}

	:global(.article-content .beacon-process > div) {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		column-gap: 0.9rem;
		align-items: start;
		border: 1px solid #e5e7eb;
		border-radius: 16px;
		background: #ffffff;
		padding: 1rem;
	}

	:global(.article-content .beacon-process span) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.7rem;
		background: #c8102e;
		color: #ffffff;
		font-size: 0.85rem;
		font-weight: 800;
		grid-row: span 2;
	}

	:global(.article-content .beacon-process strong) {
		color: #111827;
	}

	:global(.article-content .beacon-process p) {
		color: #4b5563;
		margin: 0.25rem 0 0;
	}

	:global(.article-content .beacon-split-panel) {
		display: grid;
		grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
		gap: 1.25rem;
		margin: 2rem 0;
		border-top: 1px solid #e5e7eb;
		border-bottom: 1px solid #e5e7eb;
		padding: 1.5rem 0;
	}

	:global(.article-content .beacon-split-panel > div:first-child span) {
		display: block;
		color: #9ca3af;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		margin-bottom: 0.55rem;
	}

	:global(.article-content .beacon-split-panel > div:first-child strong) {
		display: block;
		color: #111827;
		font-size: clamp(1.2rem, 2vw, 1.55rem);
		font-weight: 800;
		line-height: 1.3;
	}

	:global(.article-content .beacon-split-panel p),
	:global(.article-content .beacon-split-panel ul) {
		margin-bottom: 0.75rem;
	}

	:global(.article-content .beacon-comparison-table) {
		display: block;
		width: 100%;
		overflow-x: auto;
		margin: 2rem 0;
		border: 1px solid #e5e7eb;
		border-radius: 18px;
		border-spacing: 0;
		border-collapse: separate;
		background: #ffffff;
		font-size: 0.9rem;
	}

	:global(.article-content .beacon-comparison-table th),
	:global(.article-content .beacon-comparison-table td) {
		min-width: 10rem;
		border-bottom: 1px solid #e5e7eb;
		padding: 0.9rem 1rem;
		text-align: left;
		vertical-align: top;
	}

	:global(.article-content .beacon-comparison-table th) {
		background: #f8fafc;
		color: #111827;
		font-weight: 750;
	}

	:global(.article-content .beacon-comparison-table tr:last-child td) {
		border-bottom: 0;
	}

	:global(.article-content .beacon-timeline) {
		display: grid;
		gap: 0;
		margin: 2rem 0;
		border-left: 2px solid #fecdd3;
		padding-left: 1.15rem;
	}

	:global(.article-content .beacon-timeline > div) {
		position: relative;
		padding: 0 0 1.25rem 1.1rem;
	}

	:global(.article-content .beacon-timeline > div::before) {
		content: "";
		position: absolute;
		top: 0.45rem;
		left: -1.55rem;
		width: 0.65rem;
		height: 0.65rem;
		border-radius: 999px;
		background: #c8102e;
		box-shadow: 0 0 0 0.28rem #fff1f2;
	}

	:global(.article-content .beacon-timeline span) {
		display: block;
		color: #c8102e;
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		margin-bottom: 0.25rem;
	}

	:global(.article-content .beacon-timeline strong),
	:global(.article-content .beacon-definition-list dt) {
		color: #111827;
		font-weight: 750;
	}

	:global(.article-content .beacon-timeline p) {
		color: #4b5563;
		margin: 0.25rem 0 0;
	}

	:global(.article-content .beacon-definition-list) {
		display: grid;
		gap: 0;
		margin: 2rem 0;
		border-top: 1px solid #e5e7eb;
		border-bottom: 1px solid #e5e7eb;
	}

	:global(.article-content .beacon-definition-list > div) {
		display: grid;
		grid-template-columns: 11rem minmax(0, 1fr);
		gap: 1rem;
		padding: 1rem 0;
		border-bottom: 1px solid #e5e7eb;
	}

	:global(.article-content .beacon-definition-list > div:last-child) {
		border-bottom: 0;
	}

	:global(.article-content .beacon-definition-list dd) {
		color: #4b5563;
		margin: 0;
	}

	:global(.article-content .beacon-insight-strip) {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin: 2rem 0;
		border-top: 1px solid #fee2e2;
		border-bottom: 1px solid #fee2e2;
		padding: 1rem 0;
	}

	:global(.article-content .beacon-insight-strip span) {
		display: inline-flex;
		align-items: center;
		border-radius: 999px;
		background: #fff1f2;
		color: #be123c;
		font-size: 0.78rem;
		font-weight: 750;
		padding: 0.45rem 0.7rem;
	}

	@media (max-width: 640px) {
		:global(.article-content .beacon-metric-grid),
		:global(.article-content .beacon-benefit-grid) {
			grid-template-columns: 1fr;
		}

		:global(.article-content .beacon-highlight-band) {
			align-items: flex-start;
			flex-direction: column;
		}

		:global(.article-content .beacon-split-panel),
		:global(.article-content .beacon-definition-list > div) {
			grid-template-columns: 1fr;
		}
	}
</style>
