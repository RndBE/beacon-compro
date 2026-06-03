// Dummy data for the demo executive dashboard (Tulang Bawang).

export type SiteStatus = 'ok' | 'warn' | 'alarm';

export interface Pump {
	id: string;
	name: string;
	status: SiteStatus;
	flow: string;
}

export interface Alert {
	t: string;
	sev: SiteStatus;
	code: string;
	msg: string;
}

export interface WqGauge {
	label: string;
	value: string;
	unit: string;
	min: number;
	max: number;
	ok: [number, number];
}

export interface AiMessage {
	title: string;
	sub: string;
	bold: string;
}

export interface NavItem {
	href: string;
	label: string;
	icon: string;
	badge?: number;
}

export const PUMPS: Pump[] = [
	{ id: 'P-01', name: 'Pompa Banjir Menggala', status: 'ok', flow: '240 L/s' },
	{ id: 'P-02', name: 'Pintu Air Banjar Margo', status: 'ok', flow: 'open 60%' },
	{ id: 'P-03', name: 'Pompa SPAM Tumijajar', status: 'ok', flow: '180 L/s' },
	{ id: 'P-04', name: 'Lift Pump Rawa Pitu', status: 'warn', flow: '95 L/s' },
	{ id: 'P-05', name: 'Pintu Air Penawar Aji', status: 'ok', flow: 'open 40%' },
	{ id: 'P-06', name: 'Pompa Industri UM-A', status: 'ok', flow: '320 L/s' }
];

export const ALERTS_SEED: Alert[] = [
	{ t: 'now', sev: 'alarm', code: 'WQ-03', msg: 'pH 5.1 di Rawajitu — di bawah ambang baku' },
	{ t: '2m', sev: 'warn', code: 'ARR-02', msg: 'Curah hujan 32 mm/h · Gedung Aji' },
	{ t: '8m', sev: 'warn', code: 'AWLR-02', msg: 'TMA naik 0.6 m dalam 30 menit' },
	{ t: '14m', sev: 'ok', code: 'P-04', msg: 'Lift pump Rawa Pitu normal kembali' }
];

export const WQ_GAUGES: WqGauge[] = [
	{ label: 'pH', value: '7.2', unit: '', min: 0, max: 14, ok: [6, 9] },
	{ label: 'DO', value: '6.8', unit: 'mg/L', min: 0, max: 12, ok: [4, 12] },
	{ label: 'TSS', value: '42', unit: 'mg/L', min: 0, max: 200, ok: [0, 100] },
	{ label: 'COND', value: '320', unit: 'µS', min: 0, max: 1000, ok: [0, 500] }
];

export const AI_MESSAGES: AiMessage[] = [
	{
		title: 'Lift Pump Rawa Pitu turun 21% — periksa mekanis dalam 24 jam',
		sub: 'Pola sama terjadi 3× sejak Februari · prediksi failure: 11–14 hari · ',
		bold: 'Prioritas Tinggi'
	},
	{
		title: 'Hujan ekstrem terprediksi Way Tulang Bawang (12–16 jam)',
		sub: 'Model ensemble 87% confidence · siapkan SOP banjir · ',
		bold: 'Siaga Banjir'
	},
	{
		title: 'Anomali pH di Rawajitu — kemungkinan kontaminasi industri',
		sub: 'Sampling otomatis dijadwalkan · investigasi lapangan disarankan · ',
		bold: 'Lapor BPBD'
	}
];

export const NAV: NavItem[] = [
	{ href: '/demo/dashboard', label: 'Overview', icon: 'LayoutDashboard' },
	{ href: '/demo/dashboard/sites', label: 'Jaringan Sites', icon: 'MapPin' },
	{ href: '/demo/dashboard/hidrologi', label: 'Hidrologi', icon: 'Waves' },
	{ href: '/demo/dashboard/perangkat', label: 'Perangkat', icon: 'Cpu' },
	{ href: '/demo/dashboard/kualitas-air', label: 'Kualitas Air', icon: 'FlaskConical' },
	{ href: '/demo/dashboard/notifikasi', label: 'Notifikasi', icon: 'Bell', badge: 1 },
	{ href: '/demo/dashboard/argo', label: 'ARGO AI', icon: 'Sparkles' },
	{ href: '/demo/dashboard/laporan', label: 'Laporan', icon: 'FileText' },
	{ href: '/demo/dashboard/pengaturan', label: 'Pengaturan', icon: 'Settings' }
];

/* ---- Tulang Bawang sensor network (Overview map, ported from tulang-bawang slide 3) ---- */
export type TbSensorType = 'AWLR' | 'ARR' | 'WQ' | 'SCADA' | 'CCTV' | 'CMD';

export interface TbSensor {
	id: string;
	lat: number;
	lng: number;
	type: TbSensorType;
	name: string;
	status: SiteStatus;
	value: string;
	unit: string;
}

/** Short code + accent color per sensor type. */
export const TB_TYPE_META: Record<TbSensorType, { short: string; color: string }> = {
	AWLR: { short: 'AW', color: '#2876E8' },
	ARR: { short: 'RG', color: '#1FA5C7' },
	WQ: { short: 'WQ', color: '#46D78F' },
	SCADA: { short: 'SC', color: '#FFB454' },
	CCTV: { short: 'TV', color: '#C9D5EC' },
	CMD: { short: 'CC', color: '#6AA0FF' }
};

export const TB_SENSORS: TbSensor[] = [
	{ id: 'AWLR-01', lat: -4.444, lng: 105.264, type: 'AWLR', name: 'Way Tulang Bawang · Menggala', status: 'ok', value: '2.14', unit: 'm' },
	{ id: 'AWLR-02', lat: -4.279, lng: 105.382, type: 'AWLR', name: 'Way Tulang Bawang · Banjar Margo', status: 'warn', value: '3.42', unit: 'm' },
	{ id: 'AWLR-03', lat: -4.213, lng: 105.132, type: 'AWLR', name: 'Way Kanan · Penawar Aji', status: 'ok', value: '1.87', unit: 'm' },
	{ id: 'AWLR-04', lat: -4.383, lng: 105.740, type: 'AWLR', name: 'Saluran Irigasi · Rawa Pitu', status: 'ok', value: '0.92', unit: 'm' },
	{ id: 'ARR-01', lat: -4.167, lng: 105.302, type: 'ARR', name: 'Curah Hujan · Banjar Agung', status: 'ok', value: '12.4', unit: 'mm/h' },
	{ id: 'ARR-02', lat: -4.477, lng: 105.438, type: 'ARR', name: 'Curah Hujan · Gedung Aji', status: 'warn', value: '32.1', unit: 'mm/h' },
	{ id: 'WQ-01', lat: -4.501, lng: 105.823, type: 'WQ', name: 'Kualitas Air · Outlet Industri', status: 'ok', value: '7.2', unit: 'pH' },
	{ id: 'WQ-02', lat: -4.702, lng: 105.930, type: 'WQ', name: 'Kualitas Air · Tambak Dente', status: 'ok', value: '6.8', unit: 'DO' },
	{ id: 'WQ-03', lat: -4.635, lng: 105.742, type: 'WQ', name: 'Sungai Hilir · Rawajitu', status: 'alarm', value: '5.1', unit: 'pH' },
	{ id: 'SCADA-01', lat: -4.442, lng: 105.842, type: 'SCADA', name: 'Udang Manis Industrial Utility', status: 'ok', value: '98.4', unit: '%' },
	{ id: 'CCTV-01', lat: -4.417, lng: 105.330, type: 'CCTV', name: 'CCTV Sungai · Menggala', status: 'ok', value: 'LIVE', unit: '' },
	{ id: 'CMD', lat: -4.442, lng: 105.264, type: 'CMD', name: 'Command Center · Menggala', status: 'ok', value: 'HUB', unit: '' }
];

export const TB_GEOJSON_URL = '/demo/tulang-bawang.geojson';
