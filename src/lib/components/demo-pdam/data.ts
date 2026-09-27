// Dummy data for the PDAM demo (Perumda Air Minum Tirtamarta, Kota Yogyakarta).
// Coordinates of DMA points, sources and leak segments sit on the real main-pipe
// network in static/demo/pdam-jogja-pipa-utama.geojson; every reading is simulated.

import type { AiMessage, NavGroup, SiteStatus } from '../demo-dashboard/data';

export type { SiteStatus };

export const PIPES_URL = '/demo/pdam-jogja-pipa-utama.geojson';
export const ZONES_URL = '/demo/pdam-jogja-zona.geojson';
export const PIPES_ATTRIBUTION = 'Pipa © Perumda PDAM Tirtamarta (Geoportal Kota Yogyakarta)';

export const PDAM = {
	name: 'Perumda Air Minum Tirtamarta',
	short: 'Tirtamarta',
	city: 'Kota Yogyakarta',
	province: 'D.I. Yogyakarta'
};

/* ---- service zones (polygons traced from the pipe network, see ZONES_URL) ---- */
export type ZoneId = 'BDG' | 'GMW' | 'PDS' | 'KRG' | 'BNR' | 'PGK' | 'KTG';

export interface Zone {
	id: ZoneId;
	/** value of the `zona` attribute in the GeoJSON */
	name: string;
	color: string;
	areaKm2: number;
	/** customer connections (sambungan rumah) */
	sr: number;
	/** label anchor [lng, lat] */
	label: [number, number];
}

export const ZONES: Zone[] = [
	{ id: 'BDG', name: 'Bedog', color: '#4FA3FF', areaKm2: 24.6, sr: 9850, label: [110.36226, -7.81724] },
	{ id: 'GMW', name: 'Gemawang', color: '#8B7CFF', areaKm2: 9.7, sr: 7420, label: [110.36146, -7.76924] },
	{ id: 'PDS', name: 'Padasan', color: '#36D1C4', areaKm2: 24.9, sr: 6980, label: [110.38546, -7.74684] },
	{ id: 'KRG', name: 'Karanggayam', color: '#6E8BFF', areaKm2: 6.3, sr: 4610, label: [110.38306, -7.77804] },
	{ id: 'BNR', name: 'Bener', color: '#7FD1FF', areaKm2: 3.7, sr: 2240, label: [110.35026, -7.77884] },
	{ id: 'PGK', name: 'Pengok', color: '#C58BFF', areaKm2: 4.8, sr: 2960, label: [110.39266, -7.79244] },
	{ id: 'KTG', name: 'Kotagede', color: '#2FC2A8', areaKm2: 5.1, sr: 2110, label: [110.40066, -7.82124] }
];
/** NRW choropleth bands (share of system input, 0–1). */
export function nrwColor(p: number) {
	return p >= 0.35 ? '#FF7A66' : p >= 0.3 ? '#FFB454' : p >= 0.25 ? '#C9D86A' : '#46D78F';
}

export const ZONE_BY_ID = Object.fromEntries(ZONES.map((z) => [z.id, z])) as Record<ZoneId, Zone>;
export const ZONE_BY_NAME = Object.fromEntries(ZONES.map((z) => [z.name, z])) as Record<string, Zone>;
export const TOTAL_SR = ZONES.reduce((a, z) => a + z.sr, 0);

/* ---- monitored assets ---- */
export type AssetType = 'DMA' | 'PT' | 'SC' | 'RES';

export const TYPE_META: Record<AssetType, { short: string; color: string; label: string }> = {
	DMA: { short: 'FM', color: '#3CC3F2', label: 'Flowmeter DMA' },
	PT: { short: 'PT', color: '#A08BFF', label: 'Tekanan kritis' },
	SC: { short: 'SC', color: '#E9C46A', label: 'Serah terima curah' },
	RES: { short: 'RS', color: '#2FC2A8', label: 'Reservoir / sumber' }
};

export interface Asset {
	id: string;
	type: AssetType;
	zone: ZoneId;
	/** DMA meters: which boundary they measure */
	role?: 'in' | 'out';
	name: string;
	lat: number;
	lng: number;
}

export const ASSETS: Asset[] = [
	{ id: 'GMW-IN', type: 'DMA', zone: 'GMW', role: 'in', name: 'Inlet DMA Gemawang', lat: -7.75429, lng: 110.38312 },
	{ id: 'GMW-OUT', type: 'DMA', zone: 'GMW', role: 'out', name: 'Outlet DMA Gemawang', lat: -7.8011, lng: 110.35623 },
	{ id: 'BDG-IN', type: 'DMA', zone: 'BDG', role: 'in', name: 'Inlet DMA Bedog', lat: -7.76252, lng: 110.34517 },
	{ id: 'BDG-OUT', type: 'DMA', zone: 'BDG', role: 'out', name: 'Outlet DMA Bedog', lat: -7.80268, lng: 110.40221 },
	{ id: 'PDS-IN', type: 'DMA', zone: 'PDS', role: 'in', name: 'Inlet DMA Padasan', lat: -7.66804, lng: 110.42947 },
	{ id: 'PDS-OUT', type: 'DMA', zone: 'PDS', role: 'out', name: 'Outlet DMA Padasan', lat: -7.78283, lng: 110.36801 },
	{ id: 'KRG-IN', type: 'DMA', zone: 'KRG', role: 'in', name: 'Inlet DMA Karanggayam', lat: -7.76074, lng: 110.38357 },
	{ id: 'KRG-OUT', type: 'DMA', zone: 'KRG', role: 'out', name: 'Outlet DMA Karanggayam', lat: -7.79468, lng: 110.36896 },
	{ id: 'BNR-IN', type: 'DMA', zone: 'BNR', role: 'in', name: 'Inlet DMA Bener', lat: -7.77747, lng: 110.35589 },
	{ id: 'PGK-IN', type: 'DMA', zone: 'PGK', role: 'in', name: 'Inlet DMA Pengok', lat: -7.78721, lng: 110.38761 },
	{ id: 'KTG-IN', type: 'DMA', zone: 'KTG', role: 'in', name: 'Inlet DMA Kotagede', lat: -7.81909, lng: 110.39539 },
	{ id: 'PT-01', type: 'PT', zone: 'GMW', name: 'Titik kritis Gemawang', lat: -7.77118, lng: 110.36129 },
	{ id: 'PT-02', type: 'PT', zone: 'KRG', name: 'Titik kritis Karanggayam', lat: -7.78304, lng: 110.37923 },
	{ id: 'PT-03', type: 'PT', zone: 'BDG', name: 'Titik kritis Bedog selatan', lat: -7.8147, lng: 110.3687 },
	{ id: 'PT-04', type: 'PT', zone: 'KTG', name: 'Ujung jaringan Kotagede', lat: -7.82052, lng: 110.40097 },
	{ id: 'SC-01', type: 'SC', zone: 'BDG', name: 'Serah terima curah · Barat', lat: -7.73742, lng: 110.3512 },
	{ id: 'SC-02', type: 'SC', zone: 'GMW', name: 'Serah terima curah · Utara', lat: -7.72539, lng: 110.38495 },
	{ id: 'RES-BDG', type: 'RES', zone: 'BDG', name: 'Unit Produksi Bedog', lat: -7.73958, lng: 110.33187 },
	{ id: 'RES-GMW', type: 'RES', zone: 'GMW', name: 'Reservoir Gemawang', lat: -7.71612, lng: 110.38386 },
	{ id: 'RES-PDS', type: 'RES', zone: 'PDS', name: 'Sumber Padasan', lat: -7.59288, lng: 110.44019 }
];
export const ASSET_BY_ID = Object.fromEntries(ASSETS.map((a) => [a.id, a])) as Record<string, Asset>;
/** DMA meters only (inlet/outlet flowmeters). */
export const DMA_METERS = ASSETS.filter((a) => a.type === 'DMA');

/* ---- leak detection ---- */
export type LeakStatus = 'verifikasi' | 'dipantau' | 'survei' | 'selesai';

export interface LeakCase {
	id: string;
	zone: ZoneId;
	/** segment id in PIPES_URL */
	pipeId: string;
	diameter: number;
	material: string;
	pipeLen: number;
	at: { lat: number; lng: number };
	/** localisation uncertainty along the pipe, metres */
	radius: number;
	confidence: number;
	/** estimated leak flow, L/s */
	est: number;
	since: string;
	severity: SiteStatus;
	status: LeakStatus;
	nearest: string[];
	signals: string[];
	action: string;
}

export const LEAKS: LeakCase[] = [
	{
		id: 'LK-01',
		zone: 'GMW',
		pipeId: 'jogja-668-5593',
		diameter: 8,
		material: 'ACP',
		pipeLen: 954,
		at: { lat: -7.76647, lng: 110.36151 },
		radius: 140,
		confidence: 92,
		est: 18.6,
		since: '01:40',
		severity: 'alarm',
		status: 'verifikasi',
		nearest: ['PT-01', 'GMW-OUT', 'GMW-IN'],
		signals: ['MNF naik 18% dari baseline 14 malam', 'Tekanan PT-01 turun 0,34 bar', 'Residual debit inlet +18,6 L/s sejak 01:40'],
		action: 'Tim distribusi di lokasi · verifikasi korelator akustik'
	},
	{
		id: 'LK-02',
		zone: 'KRG',
		pipeId: 'jogja-668-6852',
		diameter: 7,
		material: 'CI',
		pipeLen: 707,
		at: { lat: -7.77989, lng: 110.37954 },
		radius: 320,
		confidence: 71,
		est: 5.2,
		since: '5 malam',
		severity: 'warn',
		status: 'dipantau',
		nearest: ['PT-02', 'KRG-OUT'],
		signals: ['MNF naik bertahap ±1 L/s per malam (+9% tadi malam)', 'Pola khas kebocoran kecil yang membesar'],
		action: 'Step test malam ini 01:00–03:00'
	},
	{
		id: 'LK-03',
		zone: 'BDG',
		pipeId: 'jogja-668-1360',
		diameter: 8,
		material: 'ACP',
		pipeLen: 615,
		at: { lat: -7.81223, lng: 110.36879 },
		radius: 450,
		confidence: 48,
		est: 1.9,
		since: '2 hari',
		severity: 'warn',
		status: 'survei',
		nearest: ['PT-03'],
		signals: ['Transien tekanan berulang di PT-03', 'Belum tampak di MNF zona'],
		action: 'Survei akustik dijadwalkan Kamis'
	}
];

export const LEAK_STATUS_LABEL: Record<LeakStatus, string> = {
	verifikasi: 'Verifikasi lapangan',
	dipantau: 'Dipantau',
	survei: 'Survei akustik',
	selesai: 'Selesai'
};

/** Leak cases closed in the last 30 days (for the history table). */
export const LEAK_HISTORY = [
	{ id: 'LK-98', zone: 'BDG' as ZoneId, pipe: 'JDU Ø10" ACP', est: 11.2, found: '3 j 10 m', fixed: '7 j 40 m', saved: 968, ago: 4 },
	{ id: 'LK-97', zone: 'PGK' as ZoneId, pipe: 'JDU Ø6" PVC', est: 3.8, found: '1 hari', fixed: '5 j 05 m', saved: 328, ago: 9 },
	{ id: 'LK-96', zone: 'GMW' as ZoneId, pipe: 'Transmisi Ø12" CI', est: 22.4, found: '1 j 55 m', fixed: '9 j 20 m', saved: 1935, ago: 13 },
	{ id: 'LK-95', zone: 'KTG' as ZoneId, pipe: 'JDU Ø6" ACP', est: 2.6, found: '2 hari', fixed: '4 j 15 m', saved: 225, ago: 21 },
	{ id: 'LK-94', zone: 'PDS' as ZoneId, pipe: 'Transmisi Ø16" CI', est: 14.9, found: '2 j 40 m', fixed: '11 j 00 m', saved: 1287, ago: 27 }
];

/* ---- water balance (per zone, 30 days) ---- */
export interface ZoneBalance {
	zone: ZoneId;
	/** system input volume, m³/day */
	siv: number;
	/** non-revenue share of SIV (0–1), excluding today's burst */
	nrw: number;
	/** part of NRW that is physical loss (rest is apparent: meters, illegal use) */
	realShare: number;
	/** flow handed on through the zone's outlet meter, L/s average */
	outAvg: number;
	/** pressure at the inlet at night / at the morning peak, bar */
	pIn: [number, number];
	/** pressure at the far end of the zone (outlet or critical point), bar */
	pEnd: [number, number];
}

export const BALANCE: Record<ZoneId, ZoneBalance> = {
	BDG: { zone: 'BDG', siv: 18640, nrw: 0.284, realShare: 0.68, outAvg: 21, pIn: [3.3, 2.4], pEnd: [1.9, 0.95] },
	GMW: { zone: 'GMW', siv: 13920, nrw: 0.386, realShare: 0.74, outAvg: 17, pIn: [3.1, 2.3], pEnd: [1.8, 0.86] },
	PDS: { zone: 'PDS', siv: 12380, nrw: 0.241, realShare: 0.62, outAvg: 28, pIn: [4.2, 3.3], pEnd: [2.1, 1.25] },
	KRG: { zone: 'KRG', siv: 8210, nrw: 0.332, realShare: 0.7, outAvg: 11, pIn: [2.9, 2.1], pEnd: [1.6, 0.82] },
	BNR: { zone: 'BNR', siv: 3640, nrw: 0.217, realShare: 0.6, outAvg: 0, pIn: [2.6, 1.9], pEnd: [1.5, 0.9] },
	PGK: { zone: 'PGK', siv: 4450, nrw: 0.295, realShare: 0.66, outAvg: 0, pIn: [2.7, 2.0], pEnd: [1.5, 0.8] },
	KTG: { zone: 'KTG', siv: 3180, nrw: 0.319, realShare: 0.69, outAvg: 0, pIn: [2.3, 1.6], pEnd: [1.2, 0.58] }
};

/** Whole Tirtamarta network length in the source dataset (all classes), km. */
export const NETWORK_KM = 979.6;
/** Average operating pressure for the leakage index, metres of head. */
export const AVG_PRESSURE_M = 25;
/** Unavoidable annual real losses (IWA), m³/day: (18·Lm + 0.8·Nc) · P / 1000. */
export const UARL = ((18 * NETWORK_KM + 0.8 * ZONES.reduce((a, z) => a + z.sr, 0)) * AVG_PRESSURE_M) / 1000;

/** Average production cost used for loss estimates, Rp/m³. */
export const WATER_COST = 5200;
/** Average tariff for billed water, Rp/m³. */
export const WATER_TARIFF = 6400;

/* ---- bulk water handover (air curah PDAB Tirtatama) ---- */
export const HANDOVER = [
	{ id: 'SC-01', contract: 120, avg: 117.6, month: 304_812, supplierRead: 305_190 },
	{ id: 'SC-02', contract: 70, avg: 63.9, month: 165_629, supplierRead: 166_458 }
];

/* ---- devices (logger + sensor health) ---- */
export interface DeviceHealth {
	id: string;
	logger: string;
	sensor: string;
	/** flowmeter battery % (DMA/SC only) */
	fmBattery?: number;
	/** logger system voltage */
	volt: number;
	signal: number;
	firmware: string;
	installed: string;
	fault?: string;
	lastFault?: string;
}

export const DEVICES: DeviceHealth[] = [
	{ id: 'GMW-IN', logger: 'BL-110', sensor: 'EMF DN200 + 2× PT 10 bar', fmBattery: 84, volt: 12.9, signal: -71, firmware: '3.4.2', installed: 'Mar 2026' },
	{ id: 'GMW-OUT', logger: 'BL-110', sensor: 'EMF DN150 + 2× PT 10 bar', fmBattery: 79, volt: 12.8, signal: -77, firmware: '3.4.2', installed: 'Mar 2026' },
	{ id: 'BDG-IN', logger: 'BL-1100', sensor: 'EMF DN250 + 2× PT 10 bar', fmBattery: 91, volt: 13.1, signal: -68, firmware: '3.4.2', installed: 'Feb 2026' },
	{ id: 'BDG-OUT', logger: 'BL-110', sensor: 'EMF DN150 + 2× PT 10 bar', fmBattery: 73, volt: 12.7, signal: -82, firmware: '3.4.1', installed: 'Feb 2026', lastFault: 'Empty pipe 17 hari lalu · pulih 14 menit' },
	{ id: 'PDS-IN', logger: 'BL-1100', sensor: 'EMF DN300 + 2× PT 16 bar', fmBattery: 88, volt: 13.0, signal: -89, firmware: '3.4.2', installed: 'Jan 2026' },
	{ id: 'PDS-OUT', logger: 'BL-110', sensor: 'EMF DN200 + 2× PT 10 bar', fmBattery: 81, volt: 12.8, signal: -74, firmware: '3.4.2', installed: 'Jan 2026' },
	{ id: 'KRG-IN', logger: 'BL-110', sensor: 'EMF DN200 + 2× PT 10 bar', fmBattery: 86, volt: 12.9, signal: -70, firmware: '3.4.2', installed: 'Apr 2026' },
	{ id: 'KRG-OUT', logger: 'BL-110', sensor: 'EMF DN150 + 2× PT 10 bar', fmBattery: 77, volt: 12.7, signal: -79, firmware: '3.4.2', installed: 'Apr 2026' },
	{ id: 'BNR-IN', logger: 'BL-11', sensor: 'EMF DN100 + 2× PT 10 bar', fmBattery: 18, volt: 12.2, signal: -81, firmware: '3.3.9', installed: 'Mei 2026', fault: 'Baterai flowmeter 18%' },
	{ id: 'PGK-IN', logger: 'BL-11', sensor: 'EMF DN150 + 2× PT 10 bar', fmBattery: 69, volt: 12.6, signal: -76, firmware: '3.4.2', installed: 'Mei 2026' },
	{ id: 'KTG-IN', logger: 'BL-11', sensor: 'EMF DN100 + 2× PT 10 bar', fmBattery: 72, volt: 12.6, signal: -84, firmware: '3.4.2', installed: 'Mei 2026' },
	{ id: 'PT-01', logger: 'BL-11', sensor: 'PT 10 bar', volt: 12.7, signal: -73, firmware: '3.4.2', installed: 'Jun 2026' },
	{ id: 'PT-02', logger: 'BL-11', sensor: 'PT 10 bar', volt: 12.6, signal: -78, firmware: '3.4.2', installed: 'Jun 2026' },
	{ id: 'PT-03', logger: 'BL-11', sensor: 'PT 10 bar', volt: 12.5, signal: -86, firmware: '3.4.2', installed: 'Jun 2026' },
	{ id: 'PT-04', logger: 'BL-11', sensor: 'PT 10 bar', volt: 12.6, signal: -88, firmware: '3.4.2', installed: 'Jun 2026' },
	{ id: 'SC-01', logger: 'BL-1100', sensor: 'EMF DN400 + PT 16 bar', fmBattery: 94, volt: 13.2, signal: -66, firmware: '3.4.2', installed: 'Des 2025' },
	{ id: 'SC-02', logger: 'BL-1100', sensor: 'EMF DN300 + PT 16 bar', fmBattery: 90, volt: 13.0, signal: -91, firmware: '3.4.1', installed: 'Des 2025', lastFault: 'Sinyal putus 4 hari lalu · data dibuffer' },
	{ id: 'RES-BDG', logger: 'BL-2000', sensor: 'Radar level 10 m + EMF DN400', volt: 13.4, signal: -64, firmware: '3.4.2', installed: 'Nov 2025' },
	{ id: 'RES-GMW', logger: 'BL-2000', sensor: 'Radar level 8 m', volt: 13.3, signal: -69, firmware: '3.4.2', installed: 'Nov 2025' },
	{ id: 'RES-PDS', logger: 'BL-2000', sensor: 'Radar level 6 m + EMF DN400', volt: 13.1, signal: -93, firmware: '3.4.2', installed: 'Nov 2025' }
];
export const DEVICE_BY_ID = Object.fromEntries(DEVICES.map((d) => [d.id, d])) as Record<string, DeviceHealth>;

/** Daily data completeness (%) for the last 7 days, oldest first. Missing ids are 100% every day (see COMPLETENESS_AVG). */
export const COMPLETENESS: Record<string, number[]> = {
	'SC-02': [100, 100, 93.8, 100, 99.9, 100, 99.8],
	'PDS-IN': [99.7, 97.2, 99.9, 100, 99.6, 100, 99.9],
	'RES-PDS': [99.4, 99.8, 98.9, 99.7, 99.9, 99.6, 99.8],
	'BNR-IN': [100, 99.9, 100, 99.8, 99.2, 98.6, 99.1],
	'BDG-OUT': [100, 100, 99.9, 100, 100, 99.7, 100],
	'PT-04': [99.9, 100, 100, 99.8, 100, 100, 99.9]
};

/** 7-day average completeness over every logger (%). */
export const COMPLETENESS_AVG =
	ASSETS.flatMap((a) => COMPLETENESS[a.id] ?? Array(7).fill(100)).reduce((x, y) => x + y, 0) / (ASSETS.length * 7);

/* ---- alert thresholds (Tingkat Siaga) ---- */
export interface Threshold {
	param: string;
	unit: string;
	scope: string;
	waspada: string;
	siaga: string;
	awas: string;
	/** minutes between repeated notifications */
	cooldown: number;
	on: boolean;
}

export const THRESHOLDS: Threshold[] = [
	{ param: 'Tekanan minimum', unit: 'bar', scope: 'Semua PT & outlet DMA', waspada: '< 1,0', siaga: '< 0,7', awas: '< 0,5', cooldown: 30, on: true },
	{ param: 'Tekanan maksimum', unit: 'bar', scope: 'Inlet DMA', waspada: '> 4,5', siaga: '> 5,0', awas: '> 6,0', cooldown: 30, on: true },
	{ param: 'Kenaikan MNF', unit: '%', scope: 'Semua DMA (02:00–04:00)', waspada: '> 8', siaga: '> 12', awas: '> 18', cooldown: 720, on: true },
	{ param: 'Residual debit (AI)', unit: 'σ', scope: 'Inlet DMA', waspada: '> 2', siaga: '> 3', awas: '> 4', cooldown: 60, on: true },
	{ param: 'Deviasi air curah', unit: '%', scope: 'SC-01 · SC-02', waspada: '> 5', siaga: '> 10', awas: '> 20', cooldown: 60, on: true },
	{ param: 'Level reservoir', unit: '%', scope: 'Reservoir & sumber', waspada: '< 45', siaga: '< 35', awas: '< 20', cooldown: 30, on: true },
	{ param: 'Baterai flowmeter', unit: '%', scope: 'Semua flowmeter', waspada: '< 30', siaga: '< 20', awas: '< 10', cooldown: 1440, on: true },
	{ param: 'Data tidak masuk', unit: 'menit', scope: 'Semua logger', waspada: '> 10', siaga: '> 30', awas: '> 60', cooldown: 60, on: true }
];

/* ---- notification log ---- */
export type Channel = 'WhatsApp' | 'Telegram' | 'Email';

export interface PdamAlert {
	t: string;
	sev: SiteStatus;
	code: string;
	msg: string;
	channels: Channel[];
	recipients: number;
	read: boolean;
}

export const ALERT_LOG: PdamAlert[] = [
	{ t: '2m', sev: 'alarm', code: 'LK-01', msg: 'Kebocoran JDU Ø8" Gemawang · estimasi 18,6 L/s · tim di lokasi', channels: ['WhatsApp', 'Telegram'], recipients: 14, read: false },
	{ t: '9m', sev: 'warn', code: 'PT-01', msg: 'Tekanan titik kritis Gemawang turun 0,34 bar dari pola normal', channels: ['WhatsApp'], recipients: 8, read: false },
	{ t: '47m', sev: 'warn', code: 'BNR-IN', msg: 'Baterai flowmeter 18% · jadwalkan penggantian', channels: ['Email'], recipients: 3, read: true },
	{ t: '1h', sev: 'ok', code: 'SC-01', msg: 'Rekap harian serah terima air curah terkirim ke PDAB Tirtatama', channels: ['Email'], recipients: 4, read: true },
	{ t: '3h', sev: 'warn', code: 'PT-04', msg: 'Tekanan ujung jaringan Kotagede 0,62 bar saat jam puncak', channels: ['WhatsApp'], recipients: 6, read: true },
	{ t: '5h', sev: 'alarm', code: 'LK-01', msg: 'MNF DMA Gemawang +18% · status AWAS · buka tiket distribusi', channels: ['WhatsApp', 'Telegram', 'Email'], recipients: 18, read: true },
	{ t: '7h', sev: 'warn', code: 'GMW-IN', msg: 'AI: residual debit malam > 3σ sejak 02:05', channels: ['Telegram'], recipients: 6, read: true },
	{ t: '9h', sev: 'warn', code: 'LK-02', msg: 'MNF Karanggayam naik 5 malam berturut-turut', channels: ['WhatsApp'], recipients: 8, read: true },
	{ t: '1d', sev: 'ok', code: 'SYS', msg: 'Laporan harian NRW & tekanan terkirim ke 12 penerima', channels: ['Email'], recipients: 12, read: true },
	{ t: '1d', sev: 'ok', code: 'RES-GMW', msg: 'Level reservoir Gemawang kembali normal (68%)', channels: ['Telegram'], recipients: 5, read: true }
];

export const CHANNEL_STATS: { ch: Channel; sent: number; delivered: number }[] = [
	{ ch: 'WhatsApp', sent: 64, delivered: 63 },
	{ ch: 'Telegram', sent: 31, delivered: 31 },
	{ ch: 'Email', sent: 22, delivered: 22 }
];

/* ---- AI ribbon ---- */
export const AI_MESSAGES: AiMessage[] = [
	{
		title: 'Kebocoran JDU Ø8" Gemawang · estimasi 18,6 L/s (≈1.607 m³/hari)',
		sub: 'MNF +18%, tekanan PT-01 −0,34 bar · lokasi ±140 m · ',
		bold: 'Prioritas Tinggi'
	},
	{
		title: 'MNF Karanggayam naik 5 malam berturut-turut',
		sub: 'Pola kebocoran kecil yang membesar · jalankan step test 01:00–03:00 · ',
		bold: 'Pantau'
	},
	{
		title: 'Tekanan malam Padasan 4,2 bar · peluang manajemen tekanan',
		sub: 'PRV inlet 3,4 bar malam (23:00–05:00) · 3,5 bar siang · potensi hemat ±310 m³/hari · ',
		bold: 'Rekomendasi'
	}
];

/* ---- shell ---- */
export const NAV_GROUPS: NavGroup[] = [
	{
		label: 'Pemantauan',
		items: [
			{ href: '/demo/pdam', label: 'Beranda', icon: 'LayoutDashboard' },
			{ href: '/demo/pdam/digital-twin', label: 'Digital Twin', icon: 'Box', tag: '3D' },
			{ href: '/demo/pdam/jaringan', label: 'Peta Jaringan', icon: 'Network' },
			{ href: '/demo/pdam/realtime', label: 'Realtime', icon: 'Activity' }
		]
	},
	{
		label: 'Analitik Air',
		items: [
			{ href: '/demo/pdam/kebocoran', label: 'Deteksi Kebocoran', icon: 'Radar', badge: 1 },
			{ href: '/demo/pdam/neraca-air', label: 'Neraca Air & NRW', icon: 'Scale' },
			{ href: '/demo/pdam/tekanan', label: 'Manajemen Tekanan', icon: 'Gauge' }
		]
	},
	{
		label: 'Operasi',
		items: [
			{ href: '/demo/pdam/rekap', label: 'Rekap Data', icon: 'Database' },
			{ href: '/demo/pdam/siaga', label: 'Tingkat Siaga', icon: 'Siren', badge: 2 },
			{ href: '/demo/pdam/perangkat', label: 'Perangkat', icon: 'Cpu' }
		]
	}
];
