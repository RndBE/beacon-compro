// Daftar kamera CCTV untuk pusat komando EWS STESY.
// Gambar disimpan lokal di static/demo/ews/cctv/<nama>.png — bebas dependensi
// sumber eksternal saat runtime.

export type CameraGrup = 'Banjir' | 'Diseminasi' | 'Lahar' | 'Evakuasi';

export interface Camera {
	id: string;
	/** nama lokasi kamera */
	nama: string;
	/** sub-label (sungai / area) */
	area: string;
	/** kategori kamera */
	grup: CameraGrup;
	/** path gambar (relatif ke root situs) */
	src: string;
}

export const CAMERAS: Camera[] = [
	// Banjir — TMA Kali Code
	{
		id: 'cam-code-hulu',
		nama: 'Pos Code Hulu — Gondolayu',
		area: 'K. Code',
		grup: 'Banjir',
		src: '/demo/ews/cctv/cam-code-hulu.png',
	},
	// Diseminasi — sirine peringatan
	{
		id: 'cam-sirine-code',
		nama: 'Sirine Kali Code — Sayidan',
		area: 'K. Code',
		grup: 'Diseminasi',
		src: '/demo/ews/cctv/cam-sirine-code.png',
	},
	// Lahar — Kali Boyong / Merapi
	{
		id: 'cam-boyong',
		nama: 'Pos Lahar Kali Boyong',
		area: 'K. Boyong',
		grup: 'Lahar',
		src: '/demo/ews/cctv/cam-boyong.png',
	},
	// Evakuasi
	{
		id: 'cam-evakuasi',
		nama: 'Titik Evakuasi — Sleman',
		area: 'Sleman',
		grup: 'Evakuasi',
		src: '/demo/ews/cctv/cam-evakuasi.png',
	},
	// Tambahan — reuse gambar yang tersedia
	{
		id: 'cam-code-hilir',
		nama: 'Pos Code Hilir — Wonokromo',
		area: 'K. Code',
		grup: 'Banjir',
		src: '/demo/ews/cctv/cam-code-hulu.png',
	},
	{
		id: 'cam-sirine-progo',
		nama: 'Sirine Kali Progo — Kalibawang',
		area: 'K. Progo',
		grup: 'Diseminasi',
		src: '/demo/ews/cctv/cam-sirine-code.png',
	},
	{
		id: 'cam-lahar-gendol',
		nama: 'Pos Lahar Kali Gendol',
		area: 'K. Gendol',
		grup: 'Lahar',
		src: '/demo/ews/cctv/cam-boyong.png',
	},
	{
		id: 'cam-evakuasi-kota',
		nama: 'Titik Evakuasi — Kota Yogyakarta',
		area: 'Kota Yogyakarta',
		grup: 'Evakuasi',
		src: '/demo/ews/cctv/cam-evakuasi.png',
	},
];
