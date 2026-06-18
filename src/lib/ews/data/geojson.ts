import type { FeatureCollection } from 'geojson';

export const DIY_GEOJSON_URL = '/demo/ews/diy.geojson';

export async function loadDiyBoundary(): Promise<FeatureCollection> {
	const res = await fetch(DIY_GEOJSON_URL);
	if (!res.ok) throw new Error(`gagal memuat batas DIY: ${res.status}`);
	return (await res.json()) as FeatureCollection;
}
