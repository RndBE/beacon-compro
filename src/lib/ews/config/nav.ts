export interface NavItem { key: string; label: string; href: string; }
export const NAV_ITEMS: NavItem[] = [
	{ key: 'ringkasan', label: 'Ringkasan', href: '/demo/ews/ringkasan' },
	{ key: 'peringatan-dini', label: 'Peringatan Dini', href: '/demo/ews/peringatan-dini' },
	{ key: 'longsor', label: 'Longsor', href: '/demo/ews/longsor' },
	{ key: 'diseminasi', label: 'Diseminasi', href: '/demo/ews/diseminasi' },
	{ key: 'evakuasi', label: 'Evakuasi & Dampak', href: '/demo/ews/evakuasi' },
	{ key: 'analisa', label: 'Analisa', href: '/demo/ews/analisa' }
];
