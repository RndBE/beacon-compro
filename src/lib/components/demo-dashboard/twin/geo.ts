// Geometry helpers for the digital twin: Web Mercator projection into a local
// kilometre frame, XYZ tile math, and small polygon utilities.

const R_KM = 6378.137;
const DEG = Math.PI / 180;

export const mercX = (lon: number) => R_KM * lon * DEG;
export const mercY = (lat: number) => R_KM * Math.log(Math.tan(Math.PI / 4 + (lat * DEG) / 2));

export interface XZ {
	x: number;
	z: number;
}

/** Projects lon/lat to scene kilometres around (lon0, lat0). North is -Z, east is +X. */
export function makeProjector(lon0: number, lat0: number) {
	const x0 = mercX(lon0);
	const y0 = mercY(lat0);
	return (lon: number, lat: number): XZ => ({ x: mercX(lon) - x0, z: -(mercY(lat) - y0) });
}

/** Inverse of makeProjector: scene kilometres back to lon/lat. */
export function makeUnprojector(lon0: number, lat0: number) {
	const x0 = mercX(lon0);
	const y0 = mercY(lat0);
	return (x: number, z: number) => ({
		lon: (x + x0) / R_KM / DEG,
		lat: (2 * Math.atan(Math.exp((y0 - z) / R_KM)) - Math.PI / 2) / DEG
	});
}

export const tileX =(lon: number, z: number) => ((lon + 180) / 360) * 2 ** z;
export const tileY = (lat: number, z: number) => {
	const r = lat * DEG;
	return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z;
};
export const tileLon = (x: number, z: number) => (x / 2 ** z) * 360 - 180;
export const tileLat = (y: number, z: number) =>
	Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / 2 ** z))) / DEG;

export interface TileRange {
	z: number;
	x0: number;
	x1: number;
	y0: number;
	y1: number;
	/** geographic bounds of the whole range */
	west: number;
	east: number;
	north: number;
	south: number;
}

/** Smallest XYZ tile range at zoom z that covers the given lon/lat box. */
export function tileRange(west: number, south: number, east: number, north: number, z: number): TileRange {
	const x0 = Math.floor(tileX(west, z));
	const x1 = Math.floor(tileX(east, z));
	const y0 = Math.floor(tileY(north, z));
	const y1 = Math.floor(tileY(south, z));
	return {
		z,
		x0,
		x1,
		y0,
		y1,
		west: tileLon(x0, z),
		east: tileLon(x1 + 1, z),
		north: tileLat(y0, z),
		south: tileLat(y1 + 1, z)
	};
}

export type Ring = [number, number][];

/** Douglas-Peucker simplification for [lon, lat] rings. */
export function simplify(pts: Ring, tol: number): Ring {
	if (pts.length < 3) return pts;
	const keep = new Uint8Array(pts.length);
	keep[0] = keep[pts.length - 1] = 1;
	const stack: [number, number][] = [[0, pts.length - 1]];
	while (stack.length) {
		const [a, b] = stack.pop()!;
		const [ax, ay] = pts[a];
		const [bx, by] = pts[b];
		const dx = bx - ax;
		const dy = by - ay;
		const len2 = dx * dx + dy * dy || 1e-18;
		let maxD = 0;
		let idx = -1;
		for (let i = a + 1; i < b; i++) {
			const [px, py] = pts[i];
			const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
			const qx = ax + t * dx - px;
			const qy = ay + t * dy - py;
			const d = qx * qx + qy * qy;
			if (d > maxD) {
				maxD = d;
				idx = i;
			}
		}
		if (idx >= 0 && maxD > tol * tol) {
			keep[idx] = 1;
			stack.push([a, idx], [idx, b]);
		}
	}
	return pts.filter((_, i) => keep[i]);
}

/** Outer rings of every polygon in a (Multi)Polygon GeoJSON collection. */
export function outerRings(geo: { features: { geometry: { type: string; coordinates: unknown } }[] }): Ring[] {
	const rings: Ring[] = [];
	for (const f of geo.features) {
		const g = f.geometry;
		const polys = (g.type === 'MultiPolygon' ? g.coordinates : [g.coordinates]) as number[][][][];
		for (const p of polys) rings.push(p[0].map(([x, y]) => [x, y] as [number, number]));
	}
	return rings;
}

export function ringArea(r: Ring): number {
	let a = 0;
	for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]);
	return Math.abs(a / 2);
}
