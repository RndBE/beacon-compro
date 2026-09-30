<script lang="ts">
	import '$lib/components/demo-pdam/pdam.css';
	import { ArrowRight, Eye, EyeOff, History, Lock, Radio, ToggleRight } from '@lucide/svelte';
	import BrandMark from '$lib/components/demo-dashboard/BrandMark.svelte';
	import { SPAM } from '$lib/components/demo-spam/data';
	import { LOGGERS, PAIRS, RESERVOIRS, type ReservoirId } from '$lib/components/demo-spam/wosusokas';

	let { data, form } = $props();
	let showPass = $state(false);
	let submitting = $state(false);

	// plate carrée is fine for a decorative outline this close to the equator
	const BOX = { w: 110.812, e: 110.902, n: -7.522, s: -7.604 };
	const VW = 600;
	const VH = Math.round((VW * (BOX.n - BOX.s)) / ((BOX.e - BOX.w) * Math.cos((7.56 * Math.PI) / 180)));
	const px = (lon: number) => ((lon - BOX.w) / (BOX.e - BOX.w)) * VW;
	const py = (lat: number) => ((BOX.n - lat) / (BOX.n - BOX.s)) * VH;
	const labels = (Object.keys(RESERVOIRS) as ReservoirId[]).map((r) => {
		const ls = LOGGERS.filter((l) => l.reservoir === r);
		return { r, x: ls.reduce((a, l) => a + px(l.lng), 0) / ls.length, y: Math.min(...ls.map((l) => py(l.lat))) - 22 };
	});
	const year = new Date().getFullYear();
</script>

<svelte:head>
	<title>Masuk · STESY Smart Water {SPAM.short}</title>
</svelte:head>

<div class="demo-login">
	<section class="demo-login__hero" aria-hidden="true">
		<div class="demo-login__hero-top">
			<BrandMark size={44} eyebrow="BEACON · SPAM" title="Smart Water" />
			<span class="demo-login__chip"><span class="cc-live-dot"></span> Studi kasus · {LOGGERS.length} logger lapangan</span>
		</div>

		<div class="demo-login__map">
			<svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet">
				<defs>
					<radialGradient id="lgGlowS" cx="50%" cy="45%" r="60%">
						<stop offset="0%" stop-color="#2876e8" stop-opacity="0.28" />
						<stop offset="100%" stop-color="#2876e8" stop-opacity="0" />
					</radialGradient>
					<pattern id="lgGridS" width="24" height="24" patternUnits="userSpaceOnUse">
						<path d="M24 0H0V24" fill="none" stroke="rgba(120,160,220,0.08)" stroke-width="1" />
					</pattern>
				</defs>
				<rect width={VW} height={VH} fill="url(#lgGridS)" />
				<ellipse cx={VW / 2} cy={VH / 2} rx={VW * 0.55} ry={VH * 0.6} fill="url(#lgGlowS)" />
				{#each PAIRS as p (p.dma)}
					<line class="lg-pipe" x1={px(p.inlet.lng)} y1={py(p.inlet.lat)} x2={px(p.outlet.lng)} y2={py(p.outlet.lat)} />
				{/each}
				{#each labels as lb (lb.r)}
					<text x={lb.x} y={lb.y} text-anchor="middle" fill={RESERVOIRS[lb.r].color} font-family="var(--font-mono)" font-size="13" font-weight="700" letter-spacing="1.5">
						{RESERVOIRS[lb.r].short.toUpperCase()}
					</text>
				{/each}
				{#each LOGGERS as l, i (l.id)}
					<g transform={`translate(${px(l.lng)} ${py(l.lat)})`}>
						<circle class="lg-ping" r="5" style="--c:{RESERVOIRS[l.reservoir].color};animation-delay:{i * 0.3}s" />
						<circle r="4.2" fill={l.role === 'in' ? '#A08BFF' : '#3CC3F2'} stroke="#07112a" stroke-width="2" />
					</g>
				{/each}
			</svg>
			<span class="demo-login__map-cap">{LOGGERS.length} logger SPAM Regional Wosusokas · Mojolaban & Plesungan</span>
		</div>

		<div class="demo-login__copy">
			<h1>Smart Water Monitoring</h1>
			<p>
				Debit, tekanan, totalizer dan status flowmeter 12 titik DMA SPAM Regional Wosusokas, langsung dari logger yang terpasang di lapangan, lengkap dengan
				riwayat dan skenario operasi.
			</p>
		</div>
		<div class="demo-login__feats">
			<span><Radio size={15} /> Data lapangan live</span>
			<span><History size={15} /> Riwayat 90 hari</span>
			<span><ToggleRight size={15} /> Skenario operasi</span>
		</div>
	</section>

	<section class="demo-login__panel">
		<form class="demo-login__card" method="POST" onsubmit={() => (submitting = true)}>
			<div class="demo-login__brand demo-login__brand--mobile">
				<BrandMark eyebrow="BEACON · SPAM" title="Smart Water" />
			</div>
			<h2 class="demo-login__title">Masuk ke dashboard</h2>
			<p class="demo-login__sub">STESY Smart Water · {SPAM.name}</p>

			<div class="demo-login__field">
				<label for="password">Password demo</label>
				<span class="demo-login__input">
					<Lock size={16} />
					<!-- svelte-ignore a11y_autofocus -->
					<input
						id="password"
						name="password"
						type={showPass ? 'text' : 'password'}
						autocomplete="current-password"
						required
						autofocus
						disabled={!data.ready}
					/>
					<button type="button" class="demo-login__eye" aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'} onclick={() => (showPass = !showPass)}>
						{#if showPass}<EyeOff size={16} />{:else}<Eye size={16} />{/if}
					</button>
				</span>
			</div>

			{#if form?.message}
				<p class="demo-login__hint" role="alert" style="color:var(--amber)">{form.message}</p>
			{:else if !data.ready}
				<p class="demo-login__hint" role="alert" style="color:var(--amber)">Login demo SPAM belum diaktifkan di server.</p>
			{/if}

			<button class="demo-login__btn" type="submit" disabled={submitting || !data.ready}>
				{#if submitting}<span class="twin-spinner twin-spinner--sm"></span> Memuat…{:else}Masuk <ArrowRight size={17} />{/if}
			</button>
			<p class="demo-login__hint">Menampilkan data operasional klien. Minta password demo ke tim Beacon.</p>
		</form>
		<p class="demo-login__foot">© {year} Beacon Engineering · Studi kasus {SPAM.name}</p>
	</section>
</div>
