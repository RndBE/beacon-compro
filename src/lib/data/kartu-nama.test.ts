import { describe, expect, it } from 'vitest';
import { buildVcard, findCard, fromApi, fullName, interpolate } from './kartu-nama';

describe('buildVcard', () => {
	const card = findCard('sofyan')!;

	it('escapes commas in the formatted name and uses CRLF', () => {
		const vcf = buildVcard(card, 'ID');
		expect(vcf).toContain('FN:Sofyan Ariyanto\\, S.T.');
		expect(vcf).toContain('N:Ariyanto;Sofyan;;;S.T.');
		expect(vcf).toContain('TEL;TYPE=WORK:+628112401983');
		expect(vcf.split('\r\n')[0]).toBe('BEGIN:VCARD');
	});

	it('localises the title', () => {
		expect(buildVcard(card, 'ID')).toContain('TITLE:Direktur');
		expect(buildVcard(card, 'EN')).toContain('TITLE:Director');
	});

	it('does not double the final period after the S.T. suffix', () => {
		expect(interpolate('Simpan {name}.', card, 'ID')).toBe('Simpan Sofyan Ariyanto, S.T.');
		expect(interpolate('Role: {role}', card, 'EN')).toBe('Role: Director');
	});

	it('uses the company email unless the card has its own', () => {
		expect(card.email).toBe('info@bejogja.com');
		const masywir = findCard('masywir')!;
		expect(buildVcard(masywir, 'ID')).toContain('EMAIL:arifmasywir@gmail.com');
		expect(buildVcard(masywir, 'ID')).toContain('FN:Masywir Arif\\, S.H.\\, M.H.');
		expect(buildVcard(masywir, 'ID')).toContain('TEL;TYPE=WORK:+6281311569088');
	});

	it('returns undefined for an unknown slug', () => {
		expect(findCard('nope')).toBeUndefined();
	});
});

describe('fromApi', () => {
	const base = {
		slug: 'budi-santoso',
		first_name: 'Budi',
		last_name: 'Santoso',
		suffix: null,
		role_id: 'Staf Teknik',
		role_en: 'Technical Staff',
		field_id: 'TELEMETRI',
		field_en: 'TELEMETRY',
		phone_display: '+62 812-3456-789',
		email: null,
		photo: 'https://admin.be-jogja.com/storage/business-cards/budi.webp'
	};

	it('maps the CMS response and derives the dial digits', () => {
		const c = fromApi(base);
		expect(c.role).toEqual({ ID: 'Staf Teknik', EN: 'Technical Staff' });
		expect(c.phone).toBe('628123456789');
		expect(c.email).toBe('info@bejogja.com');
		expect(c.photo).toBe(base.photo);
	});

	it('keeps the name clean when there is no degree', () => {
		const c = fromApi(base);
		expect(fullName(c)).toBe('Budi Santoso');
		expect(interpolate('Simpan {name}.', c, 'ID')).toBe('Simpan Budi Santoso.');
		expect(buildVcard(c, 'ID')).toContain('FN:Budi Santoso\r\n');
	});

	it('uses the bundled photo for a seeded card without an uploaded one', () => {
		const c = fromApi({ ...base, slug: 'sofyan', photo: null, email: 'x@y.id' });
		expect(c.photo).toBe('/kartu-nama/sofyan.webp');
		expect(c.email).toBe('x@y.id');
	});
});
