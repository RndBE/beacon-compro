import type { Siaga } from './types';

export const SIAGA_ORDER: Siaga[] = ['normal', 'waspada', 'siaga', 'awas'];

export function siagaRank(s: Siaga): number {
	return SIAGA_ORDER.indexOf(s);
}

export function worst(a: Siaga, b: Siaga): Siaga {
	return siagaRank(a) >= siagaRank(b) ? a : b;
}

export function worstOf(list: Siaga[]): Siaga {
	return list.reduce<Siaga>((acc, s) => worst(acc, s), 'normal');
}

const LABELS: Record<Siaga, string> = {
	normal: 'Normal',
	waspada: 'Waspada',
	siaga: 'Siaga',
	awas: 'Awas'
};

export function siagaLabel(s: Siaga): string {
	return LABELS[s];
}

export const SIAGA_COLOR: Record<Siaga, string> = {
	normal: '#1F8A5C',
	waspada: '#C77A1B',
	siaga: '#E08A3C',
	awas: '#B5322C'
};
