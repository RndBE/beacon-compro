<script lang="ts">
	import '$lib/components/demo-pdam/pdam.css';
	import { onMount } from 'svelte';
	import { ArrowRight, Eye, EyeOff, Lock, Mail, Box, Radar, Gauge } from '@lucide/svelte';
	import BrandMark from '$lib/components/demo-dashboard/BrandMark.svelte';
	import { ASSETS, PDAM, PIPES_URL, TYPE_META, ZONES_URL, ZONE_BY_NAME } from '$lib/components/demo-pdam/data';

	let showPass = $state(false);
	let submitting = $state(false);
	let zones = $state<{ color: string; rings: [number, number][][] }[]>([]);
	let pipes = $state<{ t: boolean; pts: [number, number][] }[]>([]);

	// plate carrée is fine for a decorative outline this close to the equator
	const BOX = { w: 110.33, e: 110.448, n: -7.705, s: -7.835 };
	const VW = 600;
	const VH = Math.round((VW * (BOX.n - BOX.s)) / ((BOX.e - BOX.w) * Math.cos((7.77 * Math.PI) / 180)));
	const px = (lon: number) => ((lon - BOX.w) / (BOX.e - BOX.w)) * VW;
	const py = (lat: number) => ((BOX.n - lat) / (BOX.n - BOX.s)) * VH;
	const toPath = (pts: [number, number][], close = false) =>
		pts.map(([x, y], i) => `${i ? 'L' : 'M'}${px(x).toFixed(1)} ${py(y).toFixed(1)}`).join(' ') + (close ? 'Z' : '');

	onMount(async () => {
		try {
			const [z, p] = await Promise.all([fetch(ZONES_URL).then((r) => r.json()), fetch(PIPES_URL).then((r) => r.json())]);
			zones = z.features
				.filter((f: { properties: { zona: string } }) => ZONE_BY_NAME[f.properties.zona])
				.map((f: { properties: { zona: string }; geometry: { coordinates: [number, number][][][] } }) => ({
					color: ZONE_BY_NAME[f.properties.zona].color,
					rings: f.geometry.coordinates.map((poly) => poly[0])
				}));
			pipes = p.features.map((f: { properties: { kategori: string }; geometry: { coordinates: [number, number][] } }) => ({
				t: f.properties.kategori === 'transmisi',
				pts: f.geometry.coordinates
			}));
		} catch {
			/* decorative only */
		}
	});

	const inBox = (a: { lat: number; lng: number }) => a.lng > BOX.w && a.lng < BOX.e && a.lat < BOX.n && a.lat > BOX.s;
	const year = new Date().getFullYear();
</script>

<svelte:head>
	<title>Masuk · STESY Smart Water {PDAM.short}</title>
</svelte:head>

<div class="demo-login">
	<section class="demo-login__hero" aria-hidden="true">
		<div class="demo-login__hero-top">
			<BrandMark size={44} eyebrow="BEACON · {PDAM.short.toUpperCase()}" title="Smart Water" />
			<span class="demo-login__chip"><span class="cc-live-dot"></span> Sistem online · {ASSETS.length}/{ASSETS.length} logger</span>
		</div>

		<div class="demo-login__map">
			<svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet">
				<defs>
					<radialGradient id="lgGlowP" cx="50%" cy="45%" r="60%">
						<stop offset="0%" stop-color="#2876e8" stop-opacity="0.28" />
						<stop offset="100%" stop-color="#2876e8" stop-opacity="0" />
					</radialGradient>
					<pattern id="lgGridP" width="24" height="24" patternUnits="userSpaceOnUse">
						<path d="M24 0H0V24" fill="none" stroke="rgba(120,160,220,0.08)" stroke-width="1" />
					</pattern>
				</defs>
				<rect width={VW} height={VH} fill="url(#lgGridP)" />
				<ellipse cx={VW / 2} cy={VH / 2} rx={VW * 0.55} ry={VH * 0.6} fill="url(#lgGlowP)" />
				{#each zones as z, i (i)}
					{#each z.rings as ring, j (j)}
						<path class="lg-zone" d={toPath(ring, true)} fill={z.color} stroke={z.color} />
					{/each}
				{/each}
				{#each pipes as p, i (i)}
					<path class="lg-pipe" class:lg-pipe--t={p.t} d={toPath(p.pts)} />
				{/each}
				{#each ASSETS.filter(inBox) as a, i (a.id)}
					<g transform={`translate(${px(a.lng)} ${py(a.lat)})`}>
						<circle class="lg-ping" r="5" style="--c:{a.id === 'GMW-IN' || a.id === 'PT-01' ? '#FFB454' : '#46D78F'};animation-delay:{i * 0.3}s" />
						<circle r="4.2" fill={TYPE_META[a.type].color} stroke="#07112a" stroke-width="2" />
					</g>
				{/each}
			</svg>
			<span class="demo-login__map-cap">Jaringan pipa utama {PDAM.short} · {PDAM.city}</span>
		</div>

		<div class="demo-login__copy">
			<h1>Smart Water Monitoring</h1>
			<p>Debit, tekanan, dan kinerja DMA jaringan distribusi {PDAM.short} dipantau tiap menit, lengkap dengan deteksi kebocoran MNF, neraca air, dan digital twin 3D.</p>
		</div>
		<div class="demo-login__feats">
			<span><Radar size={15} /> Deteksi kebocoran</span>
			<span><Gauge size={15} /> Manajemen tekanan</span>
			<span><Box size={15} /> Digital twin 3D</span>
		</div>
	</section>

	<section class="demo-login__panel">
		<form class="demo-login__card" method="POST" onsubmit={() => (submitting = true)}>
			<div class="demo-login__brand demo-login__brand--mobile">
				<BrandMark eyebrow="BEACON · {PDAM.short.toUpperCase()}" title="Smart Water" />
			</div>
			<h2 class="demo-login__title">Masuk ke dashboard</h2>
			<p class="demo-login__sub">STESY Smart Water · {PDAM.name}</p>

			<div class="demo-login__field">
				<label for="email">Email</label>
				<span class="demo-login__input">
					<Mail size={16} />
					<input id="email" name="email" type="email" value="distribusi@tirtamarta.demo" autocomplete="username" />
				</span>
			</div>
			<div class="demo-login__field">
				<label for="password">Password</label>
				<span class="demo-login__input">
					<Lock size={16} />
					<input
						id="password"
						name="password"
						type={showPass ? 'text' : 'password'}
						value="demo1234"
						autocomplete="current-password"
					/>
					<button
						type="button"
						class="demo-login__eye"
						aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
						onclick={() => (showPass = !showPass)}
					>
						{#if showPass}<EyeOff size={16} />{:else}<Eye size={16} />{/if}
					</button>
				</span>
			</div>

			<div class="demo-login__row">
				<label class="demo-login__check"><input type="checkbox" checked /> Ingat perangkat ini</label>
				<span class="demo-login__muted">Sesi 8 jam</span>
			</div>

			<button class="demo-login__btn" type="submit" disabled={submitting}>
				{#if submitting}<span class="twin-spinner twin-spinner--sm"></span> Memuat…{:else}Masuk <ArrowRight size={17} />{/if}
			</button>
			<p class="demo-login__hint">Demo — masuk dengan kredensial apa pun</p>
		</form>
		<p class="demo-login__foot">© {year} Beacon Engineering · Pilot {PDAM.name}</p>
	</section>
</div>
