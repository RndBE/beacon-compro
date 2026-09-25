// Map tile sources for the demo. CARTO basemaps now answer every tile with an
// "API KEY REQUIRED" watermark, so the demo uses Esri's public tile services.
// Keep the attribution visible wherever these tiles are shown.

const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services';

export const DARK_BASE_URL = `${ESRI}/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`;
export const DARK_LABELS_URL = `${ESRI}/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`;
export const DARK_ATTRIBUTION = 'Tiles © Esri, HERE, Garmin';

export const imageryTile = (z: number, x: number, y: number) => `${ESRI}/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
export const IMAGERY_ATTRIBUTION = 'Citra © Esri, Maxar, Earthstar Geographics';

/** River network (OSM, simplified) and its required credit. */
export const RIVERS_GEOJSON_URL = '/demo/tulang-bawang-rivers.geojson';
export const RIVERS_ATTRIBUTION = 'Sungai © OpenStreetMap contributors';
