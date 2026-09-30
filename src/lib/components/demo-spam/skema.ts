// mini-stesy's isometric pipe schematics for Reservoir Plesungan and Mojolaban: the
// artwork layers (resized copies of its public/ WebPs, 3911 → 2400 px) and the pin
// positions from its production pipa_points table (percent of the artwork), read on
// 2026-09-30. Values on the pins come from field.svelte.ts like every other page.

import type { ReservoirId } from './wosusokas';

export type SchemeId = 'plesungan' | 'mojolaban';

export interface Pin {
	/** logger id; absent for the reservoir itself */
	id?: string;
	label: string;
	x: number;
	y: number;
	/** label side when the automatic one collides with a neighbour */
	at?: ('l' | 'up' | 'down')[];
}

export interface Scheme {
	id: SchemeId;
	reservoir: ReservoirId;
	/** bottom to top */
	layers: string[];
	pins: Pin[];
	/** served areas painted in the artwork */
	areas: string[];
}

const art = (f: string) => `/demo/spam/skema/${f}`;

export const SCHEMES: Record<SchemeId, Scheme> = {
	plesungan: {
		id: 'plesungan',
		reservoir: 'PLS',
		layers: [art('plesungan-base.webp'), art('plesungan-detail.webp')],
		areas: ['Kadipiro', 'Banjarsari', 'Joglo', 'Nusukan', 'Gilingan', 'Mojosongo'],
		pins: [
			{ label: 'Reservoir Plesungan', x: 86.118, y: 15.763, at: ['l', 'down'] },
			{ id: '10372', label: 'DMA 16 Outlet', x: 68.688, y: 9.176, at: ['l'] },
			{ id: '10379', label: 'DMA 15 Inlet', x: 76.255, y: 41.321 },
			{ id: '10371', label: 'DMA 15 Outlet', x: 66.944, y: 70.285 },
			{ id: '10377', label: 'DMA 9 Inlet', x: 34.727, y: 24.859, at: ['up'] },
			{ id: '10368', label: 'DMA 9 Outlet', x: 35.597, y: 32.135 },
			{ id: '10369', label: 'DMA 11 Outlet', x: 8.987, y: 28.708 },
			{ id: '10378', label: 'DMA 12 Inlet', x: 39.59, y: 54.437 },
			{ id: '10370', label: 'DMA 12 Outlet', x: 34.964, y: 69.621 }
		]
	},
	mojolaban: {
		id: 'mojolaban',
		reservoir: 'MJL',
		layers: [art('mojolaban-under.webp'), art('mojolaban-base.webp'), art('mojolaban-detail.webp')],
		areas: ['Palur', 'Triyagan', 'Joho', 'Demakan', 'Dukuh'],
		pins: [
			{ label: 'Reservoir Mojolaban', x: 66.544, y: 83.749 },
			{ id: '10373', label: 'DMA 1', x: 55.732, y: 84.619, at: ['l', 'up'] },
			{ id: '10374', label: 'DMA 3', x: 85.559, y: 68.834 },
			{ id: '10375', label: 'DMA 5', x: 50.924, y: 38.051 },
			{ id: '10376', label: 'DMA 6', x: 14.627, y: 9.176 }
		]
	}
};
