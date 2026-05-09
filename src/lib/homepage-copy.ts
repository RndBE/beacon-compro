import type { ArticleSummary, FeaturedProject, HomepageDataLogger, TestimonialSummary } from '$lib/api';
import type { Locale } from '$lib/i18n';

type Copy = {
	ID: string;
	EN: string;
};

function pick(copy: Copy | undefined, locale: Locale, fallback: string | null | undefined = ''): string {
	if (!copy) return fallback ?? '';
	return copy[locale] ?? copy.ID;
}

export const solutionHooks: Record<string, Copy> = {
	'water-security': {
		ID: 'Amankan setiap meter kubik air. Dari ketinggian, debit, kualitas, hingga deformasi struktur penampungnya.',
		EN: 'Secure every cubic meter of water. From level, discharge, and quality to deformation of the retaining structure.'
	},
	'weather-forecast': {
		ID: 'Cuaca tidak bisa dilawan, tapi bisa diprediksi. Stasiun cuaca otomatis untuk pertanian, bendungan, dan aviasi.',
		EN: 'Weather cannot be stopped, but it can be forecast. Automatic weather stations for agriculture, dams, and aviation.'
	},
	'early-warning': {
		ID: 'Detik pertama menentukan nyawa. Sistem peringatan dini multi-level untuk wilayah rawan.',
		EN: 'The first seconds can save lives. Multi-level early warning systems for high-risk areas.'
	},
	'infrastructure-security': {
		ID: 'Proteksi aset strategis dengan pencatatan kondisi, alarm anomali, dan telemetri lapangan tahan medan.',
		EN: 'Protect strategic assets with condition logging, anomaly alarms, and rugged field telemetry.'
	},
	'pressure-measurement': {
		ID: 'Proteksi aset strategis dengan pencatatan kondisi, alarm anomali, dan telemetri lapangan tahan medan.',
		EN: 'Protect strategic assets with condition logging, anomaly alarms, and rugged field telemetry.'
	},
	stesy: {
		ID: 'Platform tunggal yang mengikat semua perangkat menjadi satu dashboard real-time.',
		EN: 'A single platform that connects every device into one real-time dashboard.'
	}
};

const dataLoggerDescriptions: Record<string, Copy> = {
	'bl-2000': {
		ID: 'Flagship telemetry dengan edge computing, multi-channel, dan redundansi satelit. Dirancang untuk infrastruktur kritis yang membutuhkan keandalan absolut.',
		EN: 'Flagship telemetry with edge computing, multi-channel inputs, and satellite redundancy. Built for critical infrastructure that demands absolute reliability.'
	},
	'bl-1100': {
		ID: 'Reliabilitas industrial untuk lingkungan ekstrem. Integrasi mulus dengan ratusan sensor dengan konsumsi daya minimal berkat teknologi solar-first.',
		EN: 'Industrial reliability for extreme environments. Smooth integration with hundreds of sensors and minimal power use through solar-first technology.'
	},
	'bl-110': {
		ID: 'Solusi kompak dan terjangkau untuk pemantauan presisi. Pilihan paling logis untuk jaringan pengamatan padat tanpa mengorbankan akurasi data.',
		EN: 'A compact and cost-efficient solution for precision monitoring. A practical choice for dense observation networks without sacrificing data accuracy.'
	},
	'bl-11': {
		ID: 'Spesialis pemantauan titik tunggal. Ukuran sekecil kotak korek api, namun ditenagai konektivitas NB-IoT dengan baterai tahan hingga 5 tahun.',
		EN: 'A specialist for single-point monitoring. Matchbox-sized, powered by NB-IoT connectivity and a battery life of up to 5 years.'
	}
};

const featureTranslations: Record<string, string> = {
	'SATELIT READY': 'SATELLITE READY'
};

const projectTranslations: Record<string, { name?: string; location?: string; category?: string }> = {
	'Telemetri ADR Bendungan Ciawi-Sukamahi': {
		name: 'ADR Telemetry at Ciawi-Sukamahi Dam',
		location: 'Bogor, West Java'
	},
	'Telemetri AWLR Bendungan Sepaku IKN': {
		name: 'AWLR Telemetry at Sepaku IKN Dam',
		location: 'East Kalimantan'
	},
	'Telemetri APLR Kawah Ijen': {
		name: 'APLR Telemetry at Ijen Crater',
		location: 'Banyuwangi, East Java'
	},
	'Telemetri AWGC Sungai Cisadane BKC 3': {
		name: 'AWGC Telemetry on Cisadane River BKC 3',
		location: 'Tangerang, Banten'
	},
	'Sistem Telemetri Bendungan Keureuto': {
		name: 'Telemetry System at Keureuto Dam',
		location: 'Aceh'
	}
};

const locationTranslations: Record<string, string> = {
	'Bogor, Jawa Barat': 'Bogor, West Java',
	'Banyuwangi, Jawa Timur': 'Banyuwangi, East Java',
	'Kalimantan Timur': 'East Kalimantan',
	'Jawa Timur': 'East Java',
	'Tangerang, Banten': 'Tangerang, Banten',
	'Aceh': 'Aceh',
	'Aceh Utara': 'North Aceh',
	'Purworejo, Jawa Tengah': 'Purworejo, Central Java',
	'Banyumas, Jawa Tengah': 'Banyumas, Central Java',
	'Jawa Barat': 'West Java',
	'Jawa Tengah': 'Central Java',
	'DKI Jakarta': 'Jakarta',
	'Yogyakarta': 'Yogyakarta',
	'Nusa Tenggara Barat': 'West Nusa Tenggara',
	'Nusa Tenggara Timur': 'East Nusa Tenggara',
	'Jakarta': 'Jakarta'
};

const testimonialTranslations: Record<string, { title: string; quote: string }> = {
	'Prahasdipta Bayu Adhi Koesoemo': {
		title: 'Head of the Ciawi-Sukamahi-Gintung Dam Management Unit',
		quote: 'Beacon ADR devices deliver the deformation data precision we need for real-time dam safety monitoring. Their technical team responds to field requirements quickly and professionally.'
	},
	'Ali Sukali, S.Sos, S.T, M.Si': {
		title: 'Commitment Officer for Dam Project II',
		quote: 'A partner committed to homegrown quality. Beacon proves that local products can compete with imports, with after-sales support that is even stronger because the technical team is based in Indonesia.'
	},
	'Seto Ariwibowo, ST. MT.': {
		title: 'Commitment Officer for Hydrology Post Operations & Maintenance',
		quote: 'Beacon devices have proven their accuracy and connectivity across extreme field conditions. Data is transmitted in real time around the clock, and when issues occur, their support team is consistently dependable.'
	}
};

const categoryTranslations: Record<string, string> = {
	'Artikel Teknis': 'Technical Article',
	'Studi Kasus': 'Case Study',
	'Berita Produk': 'Product News'
};

const articleTranslations: Record<string, { title: string; excerpt: string }> = {
	'telemetri-membuat-data-lapangan-tidak-menunggu-jadwal-kunjungan': {
		title: 'Telemetry Keeps Field Data From Waiting for Site Visits',
		excerpt: 'Telemetry helps technical teams read field conditions more continuously, from water level changes to weather trends, without relying solely on manual measurements limited by time and location.'
	},
	'instrumentasi-bendungan-membuat-risiko-terbaca-lebih-awal': {
		title: 'Dam Instrumentation Makes Risk Visible Earlier',
		excerpt: 'Dam instrumentation helps operators read structural and hydrological changes more consistently, from water levels and seepage to pore pressure and movement.'
	},
	'ai-tidak-lebih-cerdas-dari-data-yang-diberikan': {
		title: 'AI Is Only as Smart as the Data It Receives',
		excerpt: 'Artificial intelligence is only as strong as the data used to train and operate it. In water, weather, and infrastructure monitoring, data quality determines whether AI can read useful patterns.'
	},
	'penurunan-muka-air-tanah-data-monitoring': {
		title: 'When Groundwater Levels Drop, Data Must Not Arrive Late',
		excerpt: 'Groundwater decline is rarely visible in a single day, but its impact can appear as supply risk, land subsidence, and pressure on infrastructure.'
	}
};

export function solutionHook(slug: string, fallback: string, locale: Locale): string {
	return pick(solutionHooks[slug], locale, fallback);
}

export function dataLoggerDescription(product: HomepageDataLogger, locale: Locale): string {
	return pick(dataLoggerDescriptions[product.id], locale, product.desc);
}

export function dataLoggerFeature(feature: string, locale: Locale): string {
	if (locale !== 'EN') return feature;
	return featureTranslations[feature] ?? feature;
}

export function projectName(project: FeaturedProject | { name: string }, locale: Locale): string {
	if (locale !== 'EN') return project.name;
	return projectTranslations[project.name]?.name ?? project.name;
}

export function projectLocation(project: FeaturedProject | { name: string; location: string }, locale: Locale): string {
	if (locale !== 'EN') return project.location;
	return projectTranslations[project.name]?.location ?? locationTranslations[project.location] ?? project.location;
}

export function projectCategory(category: string | null | undefined, locale: Locale): string {
	if (!category) return '';
	if (locale !== 'EN') return category;
	return categoryTranslations[category] ?? category;
}

export function testimonialTitle(testimonial: Pick<TestimonialSummary, 'name' | 'position'> | { name: string; title: string }, locale: Locale): string {
	const fallback = 'title' in testimonial ? testimonial.title : testimonial.position;
	if (locale !== 'EN') return fallback ?? '';
	return testimonialTranslations[testimonial.name]?.title ?? fallback ?? '';
}

export function testimonialQuote(testimonial: Pick<TestimonialSummary, 'name' | 'quote'> | { name: string; quote: string }, locale: Locale): string {
	if (locale !== 'EN') return testimonial.quote;
	return testimonialTranslations[testimonial.name]?.quote ?? testimonial.quote;
}

export function articleTitle(article: ArticleSummary, locale: Locale): string {
	if (locale !== 'EN') return article.title;
	return articleTranslations[article.slug]?.title ?? article.title;
}

export function articleExcerpt(article: ArticleSummary, locale: Locale): string {
	if (locale !== 'EN') return article.excerpt ?? '';
	return articleTranslations[article.slug]?.excerpt ?? article.excerpt ?? '';
}

export function articleCategory(article: ArticleSummary, locale: Locale): string {
	if (locale !== 'EN') return article.category ?? '';
	return categoryTranslations[article.category ?? ''] ?? article.category ?? '';
}
