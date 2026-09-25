// Dummy data for the demo executive dashboard (Tulang Bawang).

import tbSensors from './tulang-bawang-sensors.json';

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
	tag?: string;
}

export interface NavGroup {
	label: string;
	items: NavItem[];
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

export interface WqStation {
	id: string;
	name: string;
	gauges: WqGauge[];
	sampled: string;
}

/** Water-quality stations. WQ-03 carries the pH 5.1 alarm shown across the dashboard. */
export const WQ_STATIONS: WqStation[] = [
	{
		id: 'WQ-03',
		name: 'Sungai Hilir · Rawajitu',
		sampled: '2 menit lalu',
		gauges: [
			{ label: 'pH', value: '5.1', unit: '', min: 0, max: 14, ok: [6, 9] },
			{ label: 'DO', value: '4.6', unit: 'mg/L', min: 0, max: 12, ok: [4, 12] },
			{ label: 'TSS', value: '88', unit: 'mg/L', min: 0, max: 200, ok: [0, 100] },
			{ label: 'COND', value: '430', unit: 'µS', min: 0, max: 1000, ok: [0, 500] }
		]
	},
	{
		id: 'WQ-01',
		name: 'Outlet Industri',
		sampled: '6 menit lalu',
		gauges: WQ_GAUGES
	}
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

export const NAV_GROUPS: NavGroup[] = [
	{
		label: 'Pemantauan',
		items: [
			{ href: '/demo/dashboard', label: 'Overview', icon: 'LayoutDashboard' },
			{ href: '/demo/dashboard/digital-twin', label: 'Digital Twin', icon: 'Box', tag: '3D' },
			{ href: '/demo/dashboard/sites', label: 'Jaringan Sites', icon: 'MapPin' },
			{ href: '/demo/dashboard/hidrologi', label: 'Hidrologi', icon: 'Waves' },
			{ href: '/demo/dashboard/kualitas-air', label: 'Kualitas Air', icon: 'FlaskConical' }
		]
	},
	{
		label: 'Operasi',
		items: [
			{ href: '/demo/dashboard/perangkat', label: 'Perangkat', icon: 'Cpu' },
			{ href: '/demo/dashboard/notifikasi', label: 'Notifikasi', icon: 'Bell', badge: 1 },
			{ href: '/demo/dashboard/argo', label: 'ARGO AI', icon: 'Sparkles' }
		]
	},
	{
		label: 'Administrasi',
		items: [
			{ href: '/demo/dashboard/laporan', label: 'Laporan', icon: 'FileText' },
			{ href: '/demo/dashboard/pengaturan', label: 'Pengaturan', icon: 'Settings' }
		]
	}
];

export const NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

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

export const TB_SENSORS = tbSensors as TbSensor[];

export const TB_GEOJSON_URL = '/demo/tulang-bawang.geojson';

/* ---- Bottom ops section: trends, CCTV, EWS, telemetry (Overview) ---- */
export interface TrendCard {
	label: string;
	value: string;
	unit: string;
	delta: string;
	up: boolean;
	spark: number[];
}

export const TREND_CARDS: TrendCard[] = [
	{ label: 'Debit Sungai', value: '128', unit: 'm³/s', delta: '6.2%', up: true, spark: [98, 104, 101, 110, 115, 112, 120, 118, 124, 122, 128, 128] },
	{ label: 'Curah Hujan 7h', value: '512', unit: 'mm', delta: '18%', up: true, spark: [120, 160, 140, 210, 260, 300, 340, 320, 400, 460, 500, 512] },
	{ label: 'TMA Rata-rata', value: '2.31', unit: 'm', delta: '0.4%', up: false, spark: [2.45, 2.42, 2.4, 2.38, 2.41, 2.39, 2.36, 2.34, 2.35, 2.33, 2.32, 2.31] },
	{ label: 'Beban Pompa', value: '78', unit: '%', delta: '3.1%', up: true, spark: [62, 65, 63, 68, 70, 72, 71, 74, 76, 75, 77, 78] }
];

export interface CctvFeed {
	id: string;
	name: string;
	img: string;
}

// Image URLs are free-licensed photos from Wikimedia Commons (verified to load).
export const CCTV_FEEDS: CctvFeed[] = [
	{
		id: 'CAM-01',
		name: 'Sungai · Menggala',
		img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/3._Hilir_sungai_Pesisir_Barat%2C_Lampung_2016.jpg/960px-3._Hilir_sungai_Pesisir_Barat%2C_Lampung_2016.jpg'
	},
	{
		id: 'CAM-02',
		name: 'Pintu Air · Banjar Margo',
		img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Pintu_Air_Di_Saluran_Irigasi_Sekunder_Di_Jl.Soeprapto_Kebumen_Jateng_Indonesia.jpg/960px-Pintu_Air_Di_Saluran_Irigasi_Sekunder_Di_Jl.Soeprapto_Kebumen_Jateng_Indonesia.jpg'
	},
	{
		id: 'CAM-03',
		name: 'Bendung · Rawa Pitu',
		img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Saluran_Air_Irigasi_Sawah_Dari_Bendung_Bedegolan_Di_Kutowinangun_Kebumen.jpg/960px-Saluran_Air_Irigasi_Sawah_Dari_Bendung_Bedegolan_Di_Kutowinangun_Kebumen.jpg'
	},
	{
		id: 'CAM-04',
		name: 'Saluran Irigasi · Penawar Aji',
		img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Pintu_Air_Saluran_Irigasi_Di_Ambal_Kebumen_Jateng_Indonesia.jpg/960px-Pintu_Air_Saluran_Irigasi_Di_Ambal_Kebumen_Jateng_Indonesia.jpg'
	}
];

export const EWS_LEVELS = ['Normal', 'Waspada', 'Siaga', 'Awas'] as const;
export const EWS_ACTIVE = 2; // index → Siaga
export const EWS_INFO = {
	headline: 'Siaga Banjir · Way Tulang Bawang',
	eta: '12–16 jam',
	area: '3 kecamatan · Banjar Margo, Gedung Aji, Rawa Pitu',
	confidence: 87
};

export interface TelemetryRow {
	label: string;
	value: string;
	tone: 'ok' | 'warn';
	pct: number;
}

export const TELEMETRY_ROWS: TelemetryRow[] = [
	{ label: 'Uptime · 30h', value: '99.6%', tone: 'ok', pct: 99.6 },
	{ label: 'Latency sync', value: '1.2s', tone: 'ok', pct: 86 },
	{ label: 'Paket diterima · 24h', value: '18.4k', tone: 'ok', pct: 92 },
	{ label: 'Gateway online', value: '4 / 4', tone: 'ok', pct: 100 },
	{ label: 'RTU online', value: '42 / 44', tone: 'warn', pct: 95 }
];

/* ---- Notification log (Notifikasi page) ---- */
export type Channel = 'WhatsApp' | 'SMS' | 'Telegram';

export interface AlertLog extends Alert {
	channels: Channel[];
	recipients: number;
	read: boolean;
}

export const ALERT_LOG: AlertLog[] = [
	{ t: 'now', sev: 'alarm', code: 'WQ-03', msg: 'pH 5.1 di Rawajitu — di bawah ambang baku', channels: ['WhatsApp', 'SMS', 'Telegram'], recipients: 18, read: false },
	{ t: '2m', sev: 'warn', code: 'ARR-02', msg: 'Curah hujan 32 mm/h · Gedung Aji', channels: ['WhatsApp', 'Telegram'], recipients: 12, read: true },
	{ t: '8m', sev: 'warn', code: 'AWLR-02', msg: 'TMA naik 0.6 m dalam 30 menit', channels: ['WhatsApp', 'SMS'], recipients: 24, read: true },
	{ t: '14m', sev: 'ok', code: 'P-04', msg: 'Lift pump Rawa Pitu normal kembali', channels: ['Telegram'], recipients: 6, read: true },
	{ t: '31m', sev: 'warn', code: 'AWLR-02', msg: 'Status SIAGA · TMA 3.12 m melewati ambang 3.0 m', channels: ['WhatsApp', 'SMS', 'Telegram'], recipients: 32, read: true },
	{ t: '47m', sev: 'warn', code: 'P-04', msg: 'Debit lift pump turun 21% dari baseline', channels: ['WhatsApp'], recipients: 5, read: true },
	{ t: '1h', sev: 'ok', code: 'RTU-17', msg: 'RTU Banjar Agung kembali online setelah 12 menit', channels: ['Telegram'], recipients: 4, read: true },
	{ t: '2h', sev: 'warn', code: 'ARR-01', msg: 'Akumulasi hujan 3 jam 48 mm · Banjar Agung', channels: ['WhatsApp', 'Telegram'], recipients: 12, read: true },
	{ t: '3h', sev: 'ok', code: 'SCADA-01', msg: 'Sinkronisasi SCADA utility industri selesai', channels: ['Telegram'], recipients: 3, read: true },
	{ t: '5h', sev: 'alarm', code: 'RTU-31', msg: 'RTU Rawa Pitu offline · baterai 11.2 V', channels: ['WhatsApp', 'SMS'], recipients: 8, read: true },
	{ t: '6h', sev: 'ok', code: 'CCTV-01', msg: 'Stream CCTV Menggala pulih', channels: ['Telegram'], recipients: 3, read: true },
	{ t: '9h', sev: 'ok', code: 'SYS', msg: 'Laporan harian otomatis terkirim ke 14 penerima', channels: ['WhatsApp'], recipients: 14, read: true }
];

/** 24h totals per channel; they add up to the 186 in the top bar. */
export const CHANNEL_STATS: { ch: Channel; sent: number; delivered: number }[] = [
	{ ch: 'WhatsApp', sent: 124, delivered: 122 },
	{ ch: 'SMS', sent: 38, delivered: 37 },
	{ ch: 'Telegram', sent: 24, delivered: 24 }
];

/* ---- Devices (Perangkat page) ---- */
export interface PumpDetail {
	kind: 'Pompa' | 'Pintu Air';
	load: number;
	hours: number;
	power: string;
	service: string;
}

export const PUMP_DETAILS: Record<string, PumpDetail> = {
	'P-01': { kind: 'Pompa', load: 72, hours: 1284, power: '55 kW', service: '12 hari lalu' },
	'P-02': { kind: 'Pintu Air', load: 60, hours: 0, power: '7.5 kW', service: '30 hari lalu' },
	'P-03': { kind: 'Pompa', load: 64, hours: 2210, power: '37 kW', service: '5 hari lalu' },
	'P-04': { kind: 'Pompa', load: 41, hours: 3890, power: '45 kW', service: '84 hari lalu' },
	'P-05': { kind: 'Pintu Air', load: 40, hours: 0, power: '7.5 kW', service: '21 hari lalu' },
	'P-06': { kind: 'Pompa', load: 81, hours: 1570, power: '75 kW', service: '9 hari lalu' }
};

/* ---- Reports (Laporan page) ---- */
export interface ReportItem {
	id: string;
	kind: 'Harian' | 'Mingguan' | 'Bulanan' | 'Insiden';
	title: string;
	/** days before today the period ends */
	ago: number;
	/** period length in days */
	span: number;
	pages: number;
	size: string;
}

export const REPORTS: ReportItem[] = [
	{ id: 'RPT-D-001', kind: 'Harian', title: 'Ringkasan Operasional Harian', ago: 0, span: 1, pages: 6, size: '1.2 MB' },
	{ id: 'RPT-I-014', kind: 'Insiden', title: 'Insiden pH Rendah WQ-03 Rawajitu', ago: 0, span: 1, pages: 4, size: '860 KB' },
	{ id: 'RPT-D-002', kind: 'Harian', title: 'Ringkasan Operasional Harian', ago: 1, span: 1, pages: 6, size: '1.1 MB' },
	{ id: 'RPT-W-020', kind: 'Mingguan', title: 'Hidrologi & Curah Hujan Mingguan', ago: 2, span: 7, pages: 18, size: '3.4 MB' },
	{ id: 'RPT-W-019', kind: 'Mingguan', title: 'Kinerja Pompa & Pintu Air', ago: 2, span: 7, pages: 12, size: '2.2 MB' },
	{ id: 'RPT-I-013', kind: 'Insiden', title: 'RTU Rawa Pitu Offline', ago: 4, span: 1, pages: 3, size: '640 KB' },
	{ id: 'RPT-M-004', kind: 'Bulanan', title: 'Laporan Bulanan Smart Regency', ago: 9, span: 30, pages: 42, size: '8.9 MB' }
];

/* ---- Settings (Pengaturan page) ---- */
export interface DemoUser {
	name: string;
	email: string;
	role: 'Admin' | 'Operator' | 'Engineer' | 'Viewer';
	unit: string;
	active: boolean;
}

export const DEMO_USERS: DemoUser[] = [
	{ name: 'Operator Command Center', email: 'operator@beacon.id', role: 'Operator', unit: 'Command Center Menggala', active: true },
	{ name: 'Admin Sistem', email: 'admin@beacon.id', role: 'Admin', unit: 'Beacon Engineering', active: true },
	{ name: 'Engineer Lapangan', email: 'engineer@beacon.id', role: 'Engineer', unit: 'Dinas PUPR', active: true },
	{ name: 'Pos Siaga BPBD', email: 'bpbd@beacon.id', role: 'Viewer', unit: 'BPBD Tulang Bawang', active: false }
];
