import type { BusinessCardResponse } from '$lib/api';
import type { Locale } from '$lib/i18n';

type Localized = Record<Locale, string>;

export type BusinessCard = {
	slug: string;
	/** Nama tanpa gelar, dipakai di field N: vCard. */
	firstName: string;
	lastName: string;
	/** Gelar; boleh kosong. */
	suffix: string;
	role: Localized;
	/** Bidang keahlian, ditampilkan sebagai pita di bawah nama. */
	field: Localized;
	/** Nomor internasional tanpa `+`, dipakai untuk tel: dan wa.me. */
	phone: string;
	phoneDisplay: string;
	/** Email kartu; bila tidak diisi memakai email perusahaan. */
	email: string;
	photo: string;
};

export const COMPANY = {
	name: 'PT Arta Teknologi Comunindo',
	brand: 'Beacon Engineering',
	email: 'info@bejogja.com',
	website: 'be-jogja.com',
	address: 'Kadirojo I, Purwomartani, Kalasan, Sleman, DIY 55571',
	mapsUrl:
		'https://www.google.com/maps/search/?api=1&query=Kadirojo+I,+Purwomartani,+Kalasan,+Sleman,+DIY+55571',
	instagram: { url: 'https://instagram.com/beacon_engineering', handle: '@beacon_engineering' },
	linkedin: 'https://www.linkedin.com/company/beaconen-gineering/',
	youtube: 'https://youtube.com/@beacon_engineering',
	solutions: [
		'Water Security',
		'Early Warning System',
		'Infrastructure Security',
		'Weather & Climate',
		'Digital Monitoring Platform'
	]
} as const;

// Nomor cukup ditulis sekali (format tampilan); versi tel:/wa.me diturunkan darinya.
const makeCard = (c: Omit<BusinessCard, 'phone' | 'email'> & { email?: string }): BusinessCard => ({
	...c,
	email: c.email ?? COMPANY.email,
	phone: c.phoneDisplay.replace(/\D/g, '')
});

// Cadangan bila API CMS tidak terjangkau. Sumber utama kartu ada di admin (Kartu Nama).
const cards: BusinessCard[] = [
	makeCard({
		slug: 'sofyan',
		firstName: 'Sofyan',
		lastName: 'Ariyanto',
		suffix: 'S.T.',
		role: { ID: 'Direktur', EN: 'Director' },
		field: {
			ID: 'TELEMETRI · INSTRUMENTASI · IoT',
			EN: 'TELEMETRY · INSTRUMENTATION · IoT'
		},
		phoneDisplay: '+62 811-2401-983',
		photo: '/kartu-nama/sofyan.webp'
	}),
	makeCard({
		slug: 'masywir',
		firstName: 'Masywir',
		lastName: 'Arif',
		suffix: 'S.H., M.H.',
		role: { ID: 'Marketing Partner', EN: 'Marketing Partner' },
		field: {
			ID: 'TELEMETRI · INSTRUMENTASI · IoT',
			EN: 'TELEMETRY · INSTRUMENTATION · IoT'
		},
		phoneDisplay: '+62 813-1156-9088',
		email: 'arifmasywir@gmail.com',
		photo: '/kartu-nama/masywir.webp'
	})
];

export const findCard = (slug: string) => cards.find((c) => c.slug === slug);

/** Respons API `/business-cards/{slug}` menjadi kartu; foto kosong memakai foto bawaan bila ada. */
export const fromApi = (r: BusinessCardResponse): BusinessCard =>
	makeCard({
		slug: r.slug,
		firstName: r.first_name,
		lastName: r.last_name,
		suffix: r.suffix ?? '',
		role: { ID: r.role_id, EN: r.role_en },
		field: { ID: r.field_id, EN: r.field_en },
		phoneDisplay: r.phone_display,
		email: r.email || undefined,
		photo: r.photo ?? findCard(r.slug)?.photo ?? ''
	});

export const fullName = (c: BusinessCard) =>
	[`${c.firstName} ${c.lastName}`, c.suffix].filter(Boolean).join(', ');

/** Mengisi placeholder {name} dan {role}; gelar "S.T." di akhir kalimat tidak jadi "S.T..". */
export const interpolate = (s: string, c: BusinessCard, lang: Locale) =>
	s
		.replace('{name}', fullName(c))
		.replace('{role}', c.role[lang])
		.replace(/\.{2}$/, '.');

const esc = (v: string) => v.replace(/[\\,;]/g, '\\$&');

/** vCard 3.0, selaras dengan isi QR di kartu. */
export function buildVcard(c: BusinessCard, lang: Locale): string {
	return [
		'BEGIN:VCARD',
		'VERSION:3.0',
		`N:${esc(c.lastName)};${esc(c.firstName)};;;${esc(c.suffix)}`,
		`FN:${esc(fullName(c))}`,
		`ORG:${esc(`${COMPANY.name} (${COMPANY.brand})`)}`,
		`TITLE:${esc(c.role[lang])}`,
		`TEL;TYPE=WORK:+${c.phone}`,
		`EMAIL:${esc(c.email)}`,
		`URL:https://${COMPANY.website}`,
		'ADR:;;Kadirojo I\\, Purwomartani\\, Kalasan;Sleman;DIY;55571;Indonesia',
		'END:VCARD',
		''
	].join('\r\n');
}
