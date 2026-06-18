export type Siaga = 'normal' | 'waspada' | 'siaga' | 'awas';

export type PosKind = 'tma' | 'arr'; // water level | rainfall

export interface Thresholds {
	waspada: number;
	siaga: number;
	awas: number;
}

export interface HistPoint {
	t: number; // unix ms
	v: number;
}

export interface Pos {
	id: string;
	nama: string;
	kind: PosKind;
	sungai: string; // e.g. "Kali Code"
	lat: number;
	lng: number;
	unit: string; // "m" | "mm"
	value: number;
	thresholds: Thresholds;
	status: Siaga;
	history: HistPoint[];
}

export interface LandslideSensor {
	id: string;
	nama: string;
	lokasi: string; // "Kulon Progo - Menoreh"
	lat: number;
	lng: number;
	movementMm: number; // extensometer
	movementThreshold: number;
	rainAccumMm: number;
	rainThreshold: number;
	status: Siaga;
	history: HistPoint[];
}

export type ChannelKind = 'sirine' | 'wa' | 'sms' | 'push' | 'telegram';

export interface SirenNode {
	id: string;
	nama: string;
	sungai: string;
	lat: number;
	lng: number;
	armed: boolean;
	lastTest: number; // unix ms
	status: Siaga;
}

export interface Channel {
	kind: ChannelKind;
	label: string;
	online: boolean;
	reach: number; // recipients
}

export interface Shelter {
	id: string;
	nama: string;
	lokasi: string;
	lat: number;
	lng: number;
	kapasitas: number;
	terisi: number;
}

export interface AffectedArea {
	id: string;
	nama: string;
	terdampakKK: number; // households
	jiwa: number; // people
	status: Siaga;
}

export interface OpAsset {
	id: string;
	nama: string;
	jenis: 'pompa' | 'tanggul';
	lat: number;
	lng: number;
	kondisi: number; // 0..100
	operasional: boolean;
}

export interface Earthquake {
	id: string;
	t: number;
	mag: number;
	depthKm: number;
	lokasi: string;
	lat: number;
	lng: number;
}

export interface AlertItem {
	id: string;
	t: number;
	kind: 'tma' | 'arr' | 'longsor' | 'gempa' | 'sirine';
	refId: string;
	nama: string;
	from: Siaga;
	to: Siaga;
	pesan: string;
}

export type AssetKind = 'pos' | 'longsor' | 'sirine' | 'shelter' | 'op';

export interface MapMarker {
	id: string;
	kind: AssetKind;
	nama: string;
	lat: number;
	lng: number;
	status: Siaga;
}

export interface DemoData {
	pos: Pos[];
	longsor: LandslideSensor[];
	sirens: SirenNode[];
	channels: Channel[];
	shelters: Shelter[];
	areas: AffectedArea[];
	op: OpAsset[];
	quakes: Earthquake[];
	alerts: AlertItem[];
}
