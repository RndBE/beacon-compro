// Dummy data + geo helpers for the demo executive dashboard.
// Ported verbatim from slide 14 of the infrastruktur-air deck.

export type SiteStatus = 'ok' | 'warn' | 'alarm';

export interface Site {
	id: string;
	name: string;
	lon: number;
	lat: number;
	s: SiteStatus;
}

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

export interface GeoPath {
	d: string;
	name: string;
}

export const CC_SITES: Site[] = [
	{ id: 'TBW-01', name: 'Tulang Bawang', lon: 105.5, lat: -4.4, s: 'alarm' },
	{ id: 'BKL-02', name: 'Bengkulu', lon: 102.3, lat: -3.8, s: 'ok' },
	{ id: 'JKT-04', name: 'DKI Jakarta', lon: 106.83, lat: -6.21, s: 'warn' },
	{ id: 'SMG-07', name: 'Semarang', lon: 110.42, lat: -6.99, s: 'ok' },
	{ id: 'SBY-09', name: 'Surabaya', lon: 112.75, lat: -7.25, s: 'ok' },
	{ id: 'DPS-12', name: 'Denpasar', lon: 115.22, lat: -8.67, s: 'ok' },
	{ id: 'PTK-03', name: 'Pontianak', lon: 109.33, lat: 0.03, s: 'ok' },
	{ id: 'BJM-05', name: 'Banjarmasin', lon: 114.59, lat: -3.32, s: 'warn' },
	{ id: 'BPN-08', name: 'Balikpapan', lon: 116.83, lat: -1.27, s: 'ok' },
	{ id: 'MKS-11', name: 'Makassar', lon: 119.43, lat: -5.13, s: 'ok' },
	{ id: 'MND-14', name: 'Manado', lon: 124.84, lat: 1.49, s: 'ok' },
	{ id: 'AMB-17', name: 'Ambon', lon: 128.18, lat: -3.7, s: 'ok' },
	{ id: 'JYP-21', name: 'Jayapura', lon: 140.72, lat: -2.53, s: 'ok' },
	{ id: 'PDG-22', name: 'Padang', lon: 100.36, lat: -0.95, s: 'ok' },
	{ id: 'MDN-23', name: 'Medan', lon: 98.67, lat: 3.59, s: 'ok' }
];

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

/* ---- Geo projection (ported from CcMap) ---- */
export const GEO_BOUNDS = { lonMin: 94.5, lonMax: 141.5, latMin: -11.5, latMax: 7.0 };
export const GEO_URL = '/demo/indonesia.geojson';

export function project(lon: number, lat: number, vw: number, vh: number): [number, number] {
	const { lonMin, lonMax, latMin, latMax } = GEO_BOUNDS;
	const x = ((lon - lonMin) / (lonMax - lonMin)) * vw;
	const y = ((latMax - lat) / (latMax - latMin)) * vh;
	return [x, y];
}

interface GeoFeature {
	geometry?: { type: string; coordinates: number[][][] | number[][][][] };
	properties?: Record<string, unknown>;
}

export function featureToPath(feature: GeoFeature, vw: number, vh: number, minDist = 0.55): string {
	const g = feature.geometry;
	if (!g) return '';
	const polys =
		g.type === 'MultiPolygon'
			? (g.coordinates as number[][][][])
			: g.type === 'Polygon'
				? [g.coordinates as number[][][]]
				: [];
	let d = '';
	for (const poly of polys) {
		for (const ring of poly) {
			if (!ring.length) continue;
			let started = false;
			let px = 0;
			let py = 0;
			for (let i = 0; i < ring.length; i++) {
				const [lon, lat] = ring[i];
				const [x, y] = project(lon, lat, vw, vh);
				if (!started) {
					d += 'M' + x.toFixed(1) + ',' + y.toFixed(1);
					started = true;
					px = x;
					py = y;
					continue;
				}
				if (i === ring.length - 1 || Math.hypot(x - px, y - py) >= minDist) {
					d += 'L' + x.toFixed(1) + ',' + y.toFixed(1);
					px = x;
					py = y;
				}
			}
			d += 'Z';
		}
	}
	return d;
}

let _geoCache: { vw: number; vh: number; paths: GeoPath[] } | null = null;
let _geoPromise: Promise<{ features: GeoFeature[] } | null> | null = null;

export function loadGeo(vw: number, vh: number): Promise<GeoPath[] | null> {
	if (_geoCache && _geoCache.vw === vw && _geoCache.vh === vh) {
		return Promise.resolve(_geoCache.paths);
	}
	if (!_geoPromise) {
		_geoPromise = fetch(GEO_URL)
			.then((r) => (r.ok ? r.json() : Promise.reject(new Error('geo ' + r.status))))
			.catch((e) => {
				console.warn('[demo dashboard] geojson load failed:', e);
				_geoPromise = null;
				return null;
			});
	}
	return _geoPromise.then((geo) => {
		if (!geo) return null;
		const paths: GeoPath[] = geo.features.map((f) => ({
			d: featureToPath(f, vw, vh),
			name: (f.properties?.state as string) || (f.properties?.name as string) || ''
		}));
		_geoCache = { vw, vh, paths };
		return paths;
	});
}
