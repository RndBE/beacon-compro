<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowRight, Eye, EyeOff, Lock, Mail, Box, Waves, ShieldCheck } from '@lucide/svelte';
	import BrandMark from '$lib/components/demo-dashboard/BrandMark.svelte';
	import { TB_SENSORS, TB_TYPE_META } from '$lib/components/demo-dashboard/data';

	let showPass = $state(false);
	let submitting = $state(false);
	let outline = $state<{ boundary: [number, number][][]; rivers: { rank: number; pts: [number, number][] }[] } | null>(null);

	// plate carrée is fine for a decorative outline this close to the equator
	const BOX = { w: 105.14, e: 105.93, n: -4.1, s: -4.7 };
	const VW = 600;
	const VH = Math.round((VW * (BOX.n - BOX.s)) / (BOX.e - BOX.w));
	const px = (lon: number) => ((lon - BOX.w) / (BOX.e - BOX.w)) * VW;
	const py = (lat: number) => ((BOX.n - lat) / (BOX.n - BOX.s)) * VH;
	const toPath = (pts: [number, number][], close = false) =>
		pts.map(([x, y], i) => `${i ? 'L' : 'M'}${px(x).toFixed(1)} ${py(y).toFixed(1)}`).join(' ') + (close ? 'Z' : '');

	onMount(async () => {
		try {
			const res = await fetch('/demo/tulang-bawang-outline.json');
			if (res.ok) outline = await res.json();
		} catch {
			/* decorative only */
		}
	});

	const STATUS_HEX = { ok: '#46D78F', warn: '#FFB454', alarm: '#FF7A66' } as const;
	const year = new Date().getFullYear();
</script>

<svelte:head>
	<title>Masuk · Beacon Command Center</title>
</svelte:head>

<div class="demo-login">
	<section class="demo-login__hero" aria-hidden="true">
		<div class="demo-login__hero-top">
			<BrandMark size={44} />
			<span class="demo-login__chip"><span class="cc-live-dot"></span> Sistem online · 42/44 node</span>
		</div>

		<div class="demo-login__map">
			<svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet">
				<defs>
					<radialGradient id="lgGlow" cx="50%" cy="45%" r="60%">
						<stop offset="0%" stop-color="#2876e8" stop-opacity="0.28" />
						<stop offset="100%" stop-color="#2876e8" stop-opacity="0" />
					</radialGradient>
					<pattern id="lgGrid" width="24" height="24" patternUnits="userSpaceOnUse">
						<path d="M24 0H0V24" fill="none" stroke="rgba(120,160,220,0.08)" stroke-width="1" />
					</pattern>
				</defs>
				<rect width={VW} height={VH} fill="url(#lgGrid)" />
				<ellipse cx={VW / 2} cy={VH / 2} rx={VW * 0.55} ry={VH * 0.6} fill="url(#lgGlow)" />
				{#if outline}
					{#each outline.boundary as ring, i (i)}
						<path class="lg-boundary" d={toPath(ring, true)} />
					{/each}
					{#each outline.rivers as r, i (i)}
						<path class="lg-river" class:lg-river--main={r.rank === 1} d={toPath(r.pts)} />
					{/each}
				{/if}
				{#each TB_SENSORS as s, i (s.id)}
					<g transform={`translate(${px(s.lng)} ${py(s.lat)})`}>
						<circle class="lg-ping" r="5" style="--c:{STATUS_HEX[s.status]};animation-delay:{i * 0.35}s" />
						<circle r="4.5" fill={TB_TYPE_META[s.type].color} stroke="#07112a" stroke-width="2" />
					</g>
				{/each}
			</svg>
			<span class="demo-login__map-cap">Kabupaten Tulang Bawang · Lampung</span>
		</div>

		<div class="demo-login__copy">
			<h1>Smart Regency Command Center</h1>
			<p>Sungai, hujan, kualitas air, dan infrastruktur Tulang Bawang dipantau dalam satu layar, lengkap dengan digital twin 3D dan prakiraan banjir ARGO.</p>
		</div>
		<div class="demo-login__feats">
			<span><Waves size={15} /> 44 node telemetri</span>
			<span><Box size={15} /> Digital twin 3D</span>
			<span><ShieldCheck size={15} /> EWS 4 level</span>
		</div>
	</section>

	<section class="demo-login__panel">
		<form class="demo-login__card" method="POST" onsubmit={() => (submitting = true)}>
			<div class="demo-login__brand demo-login__brand--mobile">
				<BrandMark />
			</div>
			<h2 class="demo-login__title">Masuk ke dashboard</h2>
			<p class="demo-login__sub">Executive Dashboard · Tulang Bawang, Lampung</p>

			<div class="demo-login__field">
				<label for="email">Email</label>
				<span class="demo-login__input">
					<Mail size={16} />
					<input id="email" name="email" type="email" value="operator@beacon.id" autocomplete="username" />
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
		<p class="demo-login__foot">© {year} Beacon Engineering · Pilot Pemkab Tulang Bawang</p>
	</section>
</div>
