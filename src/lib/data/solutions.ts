import { 
	Droplets, Cloud, AlertTriangle, Gauge, Monitor, 
	Waves, Activity, Beaker, Radio, TriangleAlert,
	CloudRain, Siren, Flame, Smartphone, Laptop, Shield, BarChart3, Camera, Bell
} from '@lucide/svelte';

export const solutions = [
	{
		icon: Droplets, name: 'Water Security',
		tagline: 'Amankan setiap meter kubik air',
		desc: 'Dari ketinggian, debit, kualitas, hingga deformasi struktur penampungnya. Enam perangkat dirancang supaya Anda tidak pernah terlambat lagi.',
		products: ['AWLR', 'AWGC', 'AFMR', 'ADR', 'AWQR', 'AVWR'],
		href: '/solusi/water-security',
		color: '#0EA5E9',
		stat: '6', statLabel: 'Produk',
		accent: 'from-sky-500/10 to-blue-500/5'
	},
	{
		icon: Cloud, name: 'Weather Forecast',
		tagline: 'Pantau cuaca akurat',
		desc: 'Cuaca tidak bisa dilawan, tapi bisa diprediksi. Stasiun cuaca otomatis untuk pertanian, bendungan, dan aviasi.',
		products: ['AWR', 'ARR'],
		href: '/solusi/weather-forecast',
		color: '#6366F1',
		stat: '2', statLabel: 'Produk',
		accent: 'from-indigo-500/10 to-violet-500/5'
	},
	{
		icon: AlertTriangle, name: 'Early Warning',
		tagline: 'Cegah bencana',
		desc: 'Detik pertama menentukan nyawa. Sistem peringatan dini multi-level untuk wilayah rawan banjir, longsor, dan bencana hidrometeorologi.',
		products: ['EWS'],
		href: '/solusi/early-warning',
		color: '#F59E0B',
		stat: '4', statLabel: 'Level Alert',
		accent: 'from-amber-500/10 to-yellow-500/5'
	},
	{
		icon: Gauge, name: 'Pressure Measurement',
		tagline: 'Tekanan presisi tinggi',
		desc: 'Akurasi tinggi untuk medan ekstrem — geothermal, well testing, infrastruktur kritis. Terbukti di Kawah Ijen.',
		products: ['APLR'],
		href: '/solusi/pressure-measurement',
		color: '#10B981',
		stat: '1', statLabel: 'Produk',
		accent: 'from-emerald-500/10 to-green-500/5'
	},
	{
		icon: Monitor, name: 'STESY Application',
		tagline: 'Platform monitoring 1 pintu',
		desc: 'Platform tunggal yang mengikat semua perangkat menjadi satu dashboard real-time. Cross-platform, multi-tenant, AI-powered.',
		products: ['Smart Telemetry System'],
		href: '/solusi/stesy',
		color: '#C8102E',
		stat: '47', statLabel: 'Stasiun Aktif',
		accent: 'from-red-500/10 to-rose-500/5'
	}
];

export const waterSecurityProducts = [
	{ 
		slug: 'awlr', 
		name: 'AWLR', 
		full: 'Automatic Water Level Recorder', 
		hook: 'Setiap kenaikan 1 cm muka air, terekam dan terkirim dalam hitungan detik.', 
		icon: Waves, 
		desc: 'Pengukuran ketinggian muka air otomatis, 100% online, terkirim langsung ke STESY. Tersedia varian BL-1100 dan BL-110 untuk berbagai kebutuhan pos hidrologi.', 
		specs: ['Akurasi ±1mm', 'Range 0–30m', 'IP68 Waterproof', '24/7 Real-time'],
		thumbnail: 'https://picsum.photos/seed/awlr1/800/600'
	},
	{ 
		slug: 'awgc', 
		name: 'AWGC', 
		full: 'Automatic Water Gate Controller', 
		hook: 'Buka-tutup pintu air dari smartphone Anda. Tidak perlu lagi operator turun ke lapangan saat hujan deras tengah malam.', 
		icon: Activity, 
		desc: 'Kontrol pintu air otomatis berbasis telemetri. Atur level air secara remote dengan presisi tinggi dan monitoring status pintu real-time.', 
		specs: ['Remote Control', 'Auto-leveling', 'Fail-safe Mode', 'STESY Integration'],
		thumbnail: 'https://picsum.photos/seed/awgc2/800/600'
	},
	{ 
		slug: 'afmr', 
		name: 'AFMR', 
		full: 'Automatic Flow Meter Recorder', 
		hook: 'Debit air bukan tebakan — ukur akurat, 24 jam, tanpa interupsi.', 
		icon: Waves, 
		desc: 'Pencatatan debit air otomatis menggunakan sensor ultrasonik non-kontak. Ideal untuk sungai, saluran irigasi, dan outflow bendungan.', 
		specs: ['Non-contact', 'Akurasi ±2%', 'Multi-channel', 'Auto-logging'],
		thumbnail: 'https://picsum.photos/seed/afmr3/800/600'
	},
	{ 
		slug: 'adr', 
		name: 'ADR', 
		full: 'Automatic Deformation Recorder', 
		hook: 'Bendungan tidak runtuh tiba-tiba. Mereka mengirim sinyal kecil dulu — pastikan Anda yang pertama tahu.', 
		icon: TriangleAlert, 
		desc: 'Rekam pergeseran dan deformasi struktur bendungan dalam satuan mikro-milimeter. Sistem early warning untuk keamanan struktur.', 
		specs: ['Resolusi 0.001mm', 'Multi-axis', '24/7 Monitoring', 'Alert System'],
		thumbnail: 'https://picsum.photos/seed/adr4/800/600'
	},
	{ 
		slug: 'awqr', 
		name: 'AWQR', 
		full: 'Automatic Water Quality Recorder', 
		hook: 'Logam berat, sedimentasi, limbah — terdeteksi sebelum sampai ke ledeng masyarakat.', 
		icon: Beaker, 
		desc: 'Monitoring kualitas air real-time: pH, turbidity, DO, TDS, suhu, dan parameter lainnya. Data langsung ke dashboard STESY.', 
		specs: ['Multi-parameter', 'Auto-cleaning', 'Lab-grade Accuracy', 'Cloud Data'],
		thumbnail: 'https://picsum.photos/seed/awqr5/800/600'
	},
	{ 
		slug: 'avwr', 
		name: 'AVWR', 
		full: 'Automatic Vibrating Wire Recorder', 
		hook: 'Puluhan sensor vibrating wire, dibaca simultan, dipantau dari satu layar.', 
		icon: Radio, 
		desc: 'Pembacaan otomatis sensor vibrating wire untuk monitoring tekanan pore, settlement, dan stress pada struktur bendungan.', 
		specs: ['32 Channel', 'Simultaneous Read', 'High Resolution', 'Auto-calibrate'],
		thumbnail: 'https://picsum.photos/seed/avwr6/800/600'
	}
];

export const weatherForecastProducts = [
	{ 
		slug: 'awr', 
		name: 'AWR', 
		full: 'Automatic Weather Recorder', 
		hook: 'Cuaca tidak bisa dilawan, tapi bisa diprediksi — dengan data akurat setiap menit.', 
		icon: CloudRain,
		desc: 'Stasiun cuaca otomatis yang merekam suhu, kelembaban, tekanan udara, kecepatan dan arah angin, radiasi matahari secara real-time.', 
		specs: ['Multi-parameter', '1-min Interval', 'Solar Powered', 'STESY Ready'],
		thumbnail: 'https://picsum.photos/seed/awr1/800/600'
	},
	{ 
		slug: 'arr', 
		name: 'ARR', 
		full: 'Automatic Rainfall Recorder', 
		hook: 'Setiap tetes hujan terhitung — dari gerimis sampai curah hujan ekstrem.', 
		icon: CloudRain,
		desc: 'Pencatatan curah hujan otomatis menggunakan tipping bucket rain gauge. Presisi tinggi, tahan cuaca ekstrem, terintegrasi STESY.', 
		specs: ['Akurasi 0.2mm', 'Tipping Bucket', 'IP65', 'Auto-logging'],
		thumbnail: 'https://picsum.photos/seed/arr2/800/600'
	}
];

export const earlyWarningProducts = [
	{
		slug: 'ews',
		name: 'EWS',
		full: 'Early Warning System',
		hook: 'Detik pertama menentukan nyawa. Pastikan peringatan datang sebelum bencana.',
		icon: Siren,
		desc: 'Sistem end-to-end dari sensor tinggi muka air dan curah hujan, melalui data logger dan transmisi real-time, hingga sirene peringatan dan notifikasi SMS ke stakeholder. Terintegrasi penuh dengan STESY dan AWLR/ARR.',
		specs: ['Multi-level Alert', 'Sirene Outdoor', 'SMS Gateway', 'AWLR + ARR Combo', 'STESY Dashboard', 'Auto-escalation'],
		thumbnail: 'https://picsum.photos/seed/ews1/800/600'
	}
];

export const pressureMeasurementProducts = [
	{
		slug: 'aplr',
		name: 'APLR',
		full: 'Automatic Pressure Level Recorder',
		hook: 'Akurasi tinggi untuk medan ekstrem — geothermal, well testing, infrastruktur kritis.',
		icon: Flame,
		desc: 'Pencatatan tekanan otomatis menggunakan pressure transducer presisi tinggi. Tahan suhu dan tekanan ekstrem untuk aplikasi geothermal dan monitoring sumur. Terbukti di Kawah Ijen bersama PT Medco Energi.',
		specs: ['High Pressure Range', 'Extreme Temperature', 'Corrosion Resistant', 'Auto-logging', 'STESY Integration', 'Data Redundancy'],
		thumbnail: 'https://picsum.photos/seed/aplr1/800/600'
	}
];

export const stesyFeatures = [
	{ icon: Monitor, title: 'Multi-Dashboard', desc: 'Monitoring semua perangkat dari satu layar. Grafik historis, real-time data, dan peta interaktif.' },
	{ icon: Smartphone, title: 'Cross-Platform', desc: 'Windows, macOS, iOS, Android — akses monitoring dari mana saja, kapan saja.' },
	{ icon: Camera, title: 'Integrasi CCTV', desc: 'Pantau visual lokasi bersamaan dengan data telemetri. Satu platform, satu pandangan.' },
	{ icon: Bell, title: 'Alert Otomatis', desc: 'Notifikasi SMS, email, dan push notification ketika data mencapai threshold kritis.' },
	{ icon: BarChart3, title: 'Analytics & Reporting', desc: 'Analisis tren, generate laporan, dan export data untuk kebutuhan regulasi dan audit.' },
	{ icon: Shield, title: 'Multi-Tenant Security', desc: 'Setiap organisasi punya ruang data tersendiri. Enkripsi end-to-end, role-based access.' }
];
