import { describe, expect, it } from 'vitest';
import { buildVcard, findCard, interpolate } from './kartu-nama';

describe('buildVcard', () => {
	const card = findCard('sofyan')!;

	it('escapes commas in the formatted name and uses CRLF', () => {
		const vcf = buildVcard(card, 'ID');
		expect(vcf).toContain('FN:Sofyan Ariyanto\\, S.T.');
		expect(vcf).toContain('N:Ariyanto;Sofyan;;;S.T.');
		expect(vcf).toContain('TEL;TYPE=WORK:+628112850986');
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

	it('returns undefined for an unknown slug', () => {
		expect(findCard('nope')).toBeUndefined();
	});
});
