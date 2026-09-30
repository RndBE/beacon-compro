// SPAM Regional Wosusokas: the 12 flowmeter loggers installed in the field and monitored
// by mini-stesy (https://mini-stesy.monitoring4system.com). Names, coordinates and the
// channel layout come from its production database (t_logger, t_lokasi,
// parameter_sensor), read on 2026-09-30; live and historical values arrive through the
// /demo/spam/api proxy. The "Skenario operasi" mode (scenario.ts) replays a normal day
// calibrated from DMA 1 Mojolaban, the one DMA that flows every day.
// Shared by the browser and the proxy (logger allowlist), so no browser-only imports.

export type ReservoirId = 'MJL' | 'PLS';

export const RESERVOIRS: Record<ReservoirId, { id: ReservoirId; name: string; short: string; area: string; color: string }> = {
	MJL: { id: 'MJL', name: 'Reservoir Mojolaban', short: 'Mojolaban', area: 'Sukoharjo', color: '#2FC2A8' },
	PLS: { id: 'PLS', name: 'Reservoir Plesungan', short: 'Plesungan', area: 'Surakarta', color: '#4FA3FF' }
};

export type Role = 'in' | 'out';

export interface Logger {
	id: string;
	/** t_lokasi.nama_lokasi */
	name: string;
	reservoir: ReservoirId;
	dma: number;
	/** the pin kind in mini-stesy's pipe schematic */
	role: Role;
	lat: number;
	lng: number;
	/** 50-column loggers carry Pressure 1 and 2, 16-column ones a single Pressure */
	pressures: 1 | 2;
}

/** In mini-stesy's display order: Sukoharjo (Mojolaban) first, then Surakarta (Plesungan). */
export const LOGGERS: Logger[] = [
	{ id: '10373', name: 'DMA 1 Mojolaban', reservoir: 'MJL', dma: 1, role: 'out', lat: -7.595876, lng: 110.883446, pressures: 1 },
	{ id: '10374', name: 'DMA 3 Mojolaban', reservoir: 'MJL', dma: 3, role: 'out', lat: -7.589134, lng: 110.890404, pressures: 1 },
	{ id: '10375', name: 'DMA 5 Mojolaban', reservoir: 'MJL', dma: 5, role: 'out', lat: -7.580677, lng: 110.880611, pressures: 1 },
	{ id: '10376', name: 'DMA 6 Mojolaban', reservoir: 'MJL', dma: 6, role: 'out', lat: -7.570938, lng: 110.866907, pressures: 1 },
	{ id: '10377', name: 'DMA 9 Inlet Plesungan', reservoir: 'PLS', dma: 9, role: 'in', lat: -7.531944, lng: 110.828415, pressures: 1 },
	{ id: '10368', name: 'DMA 9 Outlet Plesungan', reservoir: 'PLS', dma: 9, role: 'out', lat: -7.532328, lng: 110.828316, pressures: 2 },
	{ id: '10369', name: 'DMA 11 Outlet Plesungan', reservoir: 'PLS', dma: 11, role: 'out', lat: -7.532778, lng: 110.823273, pressures: 2 },
	{ id: '10378', name: 'DMA 12 Inlet Plesungan', reservoir: 'PLS', dma: 12, role: 'in', lat: -7.54599, lng: 110.833328, pressures: 1 },
	{ id: '10370', name: 'DMA 12 Outlet Plesungan', reservoir: 'PLS', dma: 12, role: 'out', lat: -7.547948, lng: 110.830574, pressures: 2 },
	{ id: '10379', name: 'DMA 15 Inlet Plesungan', reservoir: 'PLS', dma: 15, role: 'in', lat: -7.542571, lng: 110.85128, pressures: 1 },
	{ id: '10371', name: 'DMA 15 Outlet Plesungan', reservoir: 'PLS', dma: 15, role: 'out', lat: -7.546256, lng: 110.847412, pressures: 2 },
	{ id: '10372', name: 'DMA 16 Outlet Plesungan', reservoir: 'PLS', dma: 16, role: 'out', lat: -7.529763, lng: 110.846119, pressures: 2 }
];
export const LOGGER_BY_ID = Object.fromEntries(LOGGERS.map((l) => [l.id, l])) as Record<string, Logger>;
export const LOGGER_IDS = new Set(LOGGERS.map((l) => l.id));

export const roleTag = (l: Logger) => (l.role === 'in' ? 'IN' : 'OUT');

/** The outlet loggers carry each DMA's supply; inlets repeat it upstream (see PAIRS). */
export const SUPPLY = LOGGERS.filter((l) => l.role === 'out');

/**
 * DMAs 9, 12 and 15 have an inlet and an outlet logger at the same entry station, in
 * series (e.g. DMA 12: inlet 7,9 bar, outlet P1 8,6 bar upstream / P2 4,4 bar
 * downstream). Both should read the same flow, so their difference flags a meter or
 * station problem.
 */
export const PAIRS = [9, 12, 15].map((dma) => ({
	dma,
	inlet: LOGGERS.find((l) => l.dma === dma && l.role === 'in')!,
	outlet: LOGGERS.find((l) => l.dma === dma && l.role === 'out')!
}));

/* ---- channels ---- */
export type Channel = 'flow' | 'tot' | 'fault' | 'fm' | 'p1' | 'p2' | 'hum' | 'volt' | 'temp';

/** mini-stesy parameter key (slug of nama_parameter) → channel */
export const CHANNEL_OF: Record<string, Channel> = {
	flowrate: 'flow',
	totalizer: 'tot',
	fault: 'fault',
	flowmeter_battery: 'fm',
	pressure: 'p1',
	pressure_1: 'p1',
	pressure_2: 'p2',
	humidity_logger: 'hum',
	battery_logger: 'volt',
	temperature_logger: 'temp'
};

/** Same slug rule as mini-stesy (Str::slug with '_'): 'Pressure 1' → 'pressure_1'. */
export const slug = (s: string) =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '');

export const CHANNEL_META: Record<Channel, { label: string; unit: string; d: number }> = {
	flow: { label: 'Flowrate', unit: 'L/s', d: 1 },
	tot: { label: 'Totalizer', unit: 'm³', d: 0 },
	fault: { label: 'Fault', unit: '', d: 0 },
	fm: { label: 'Baterai flowmeter', unit: '%', d: 0 },
	p1: { label: 'Tekanan', unit: 'bar', d: 2 },
	p2: { label: 'Tekanan 2', unit: 'bar', d: 2 },
	hum: { label: 'Kelembapan logger', unit: '%RH', d: 0 },
	volt: { label: 'Baterai logger', unit: 'V', d: 2 },
	temp: { label: 'Suhu logger', unit: '°C', d: 1 }
};

/** Below this a reading counts as "no flow" (meter noise around zero). */
export const FLOW_EPS = 0.5;
/** mini-stesy calls a logger offline after 60 minutes without data. */
export const ONLINE_MIN = 60;

/* ---- flowmeter fault bitmask (mini-stesy App\Support\FaultStatus) ---- */
export const FAULT_BITS: Record<number, string> = {
	1: 'Insulation error',
	2: 'Coil current error',
	3: 'Preamplifier overload',
	4: 'Database checksum error',
	5: 'Low power warning',
	6: 'Flow overload warning',
	7: 'Pulse A overload warning',
	8: 'Pulse B overload warning',
	9: 'Consumption interval warning',
	10: 'Leakage warning',
	11: 'Empty pipe warning',
	12: 'Low impedance warning',
	13: 'Flow limit warning',
	14: 'Reverse flow warning'
};

/** Active fault labels of a bitmask, ascending by bit. */
export const decodeFault = (v: number) =>
	Object.entries(FAULT_BITS)
		.filter(([bit]) => (v & (1 << (Number(bit) - 1))) !== 0)
		.map(([, label]) => label);

/* ---- scenario calibration ---- */
/** DMA 1 Mojolaban, mean per clock hour over 1–29 Sep 2026 (flowing all 696 hours). */
export const DMA1_FLOW = [
	9.16, 8.97, 8.92, 9.78, 11.58, 13.68, 13.89, 13.33, 12.9, 12.38, 11.95, 12.06, 11.93, 11.53, 11.47, 12.58, 13.34, 13.89,
	12.79, 11.74, 11.36, 11.04, 10.35, 9.59
];
export const DMA1_PRESSURE = [
	4.51, 4.52, 4.52, 4.5, 4.47, 4.43, 4.53, 4.67, 4.67, 4.68, 4.67, 4.66, 4.69, 4.69, 4.69, 4.67, 4.66, 4.66, 4.68, 4.7, 4.72,
	4.72, 4.73, 4.74
];

/**
 * Scenario level per logger: mean flow (L/s) and pressure (bar). DMA 1 is its real
 * September mean; the others follow their median flow during the few hours they did
 * flow in Aug–Sep 2026 and the pressures seen at the Plesungan stations (upstream
 * ±7,9 bar, downstream P2 ±4,4 bar at DMA 12). A series outlet reads 1–2% under its
 * inlet, the usual meter spread.
 */
export const SCENARIO: Record<string, { flow: number; p1: number; p2?: number }> = {
	'10373': { flow: 11.7, p1: 4.6 },
	'10374': { flow: 10.3, p1: 2.3 },
	'10375': { flow: 6.5, p1: 1.5 },
	'10376': { flow: 7.8, p1: 2.0 },
	'10377': { flow: 15.5, p1: 7.5 },
	'10368': { flow: 15.3, p1: 7.4, p2: 3.6 },
	'10369': { flow: 10.0, p1: 7.0, p2: 3.8 },
	'10378': { flow: 8.0, p1: 7.9 },
	'10370': { flow: 7.9, p1: 8.1, p2: 4.4 },
	'10379': { flow: 34.3, p1: 7.9 },
	'10371': { flow: 33.8, p1: 7.8, p2: 4.5 },
	'10372': { flow: 19.2, p1: 2.8, p2: 2.6 }
};
