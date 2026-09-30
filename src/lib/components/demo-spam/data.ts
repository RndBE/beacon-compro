// Shell of the SPAM demo (SPAM Regional Wosusokas case study): branding and navigation.
// The field setup itself lives in wosusokas.ts, the numbers in field.svelte.ts.

import type { NavGroup } from '../demo-dashboard/data';

export const SPAM = {
	name: 'SPAM Regional Wosusokas',
	short: 'SPAM',
	area: 'Sukoharjo · Surakarta'
};

export const NAV_GROUPS: NavGroup[] = [
	{
		label: 'Pemantauan',
		items: [
			{ href: '/demo/spam', label: 'Beranda', icon: 'LayoutDashboard' },
			{ href: '/demo/spam/skema-pipa', label: 'Skema Pipa', icon: 'Box' },
			{ href: '/demo/spam/jaringan', label: 'Peta Jaringan', icon: 'Network' },
			{ href: '/demo/spam/realtime', label: 'Realtime', icon: 'Activity' },
			{ href: '/demo/spam/historis', label: 'Data Historis', icon: 'History' }
		]
	},
	{
		label: 'Analitik Air',
		items: [
			{ href: '/demo/spam/kebocoran', label: 'Deteksi Kebocoran', icon: 'Radar' },
			{ href: '/demo/spam/neraca-air', label: 'Neraca Air', icon: 'Scale' },
			{ href: '/demo/spam/tekanan', label: 'Manajemen Tekanan', icon: 'Gauge' }
		]
	},
	{
		label: 'Operasi',
		items: [
			{ href: '/demo/spam/rekap', label: 'Rekap Data', icon: 'Database' },
			{ href: '/demo/spam/siaga', label: 'Tingkat Siaga', icon: 'Siren' },
			{ href: '/demo/spam/perangkat', label: 'Perangkat', icon: 'Cpu' }
		]
	}
];
