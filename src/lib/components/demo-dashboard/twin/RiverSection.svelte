<script lang="ts">
	// Cross-section twin of a river gauge: channel profile, embankment, live water
	// level and the SIAGA/AWAS thresholds, all on one metre scale.
	import type { GaugeModel } from './scenario';

	let {
		gauge,
		level,
		title = 'Penampang Sungai',
		sub = ''
	}: { gauge: GaugeModel; level: number; title?: string; sub?: string } = $props();

	const W = 340;
	const H = 190;
	const top = 16;
	const bottom = 160;
	let maxM = $derived(gauge.bank + 0.8);
	let y = $derived((m: number) => bottom - (m / maxM) * (bottom - top));

	// channel profile as (x, metres) — floodplain, levee, slope, bed, and back up
	let profile = $derived.by(() => {
		const b = gauge.bank;
		return [
			[0, b + 0.25],
			[34, b + 0.25],
			[52, b],
			[74, b * 0.5],
			[102, b * 0.1],
			[170, 0],
			[238, b * 0.1],
			[266, b * 0.5],
			[288, b],
			[306, b + 0.2],
			[W, b + 0.2]
		] as [number, number][];
	});
	let groundPath = $derived(
		`M0 ${H} ` + profile.map(([x, m]) => `L${x} ${y(m).toFixed(1)}`).join(' ') + ` L${W} ${H} Z`
	);

	let clamped = $derived(Math.max(0, Math.min(maxM, level)));
	let wy = $derived(y(clamped));
	let status = $derived(level >= gauge.awas ? 'alarm' : level >= gauge.siaga ? 'warn' : 'ok');
	let freeboard = $derived(gauge.bank - level);
	// water stays blue; the status colour goes on the level marker and surface line
	const waterTop = '#5fd8ff';
	let statusColor = $derived(status === 'alarm' ? '#ff7a66' : status === 'warn' ? '#ffb454' : '#5fd8ff');
	const ticks = [0, 1, 2, 3, 4, 5];
</script>

<div class="card rsec">
	<div class="card-h">
		<div style="display:flex;flex-direction:column;gap:4px;min-width:0">
			<span class="label">{title}</span>
			{#if sub}<span class="rsec__sub">{sub}</span>{/if}
		</div>
		<span class="pill pill--{status === 'alarm' ? 'danger' : status === 'warn' ? 'amber' : 'green'}">
			<span class="status-dot {status}" style="width:7px;height:7px"></span>
			{status === 'alarm' ? 'AWAS' : status === 'warn' ? 'SIAGA' : 'NORMAL'}
		</span>
	</div>

	<svg class="rsec__svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Tinggi muka air ${level.toFixed(2)} meter`}>
		<defs>
			<linearGradient id="rsecWater" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0%" stop-color={waterTop} stop-opacity="0.85" />
				<stop offset="100%" stop-color="#0c3f8a" stop-opacity="0.9" />
			</linearGradient>
			<linearGradient id="rsecGround" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0%" stop-color="#27406b" />
				<stop offset="100%" stop-color="#0b1730" />
			</linearGradient>
			<pattern id="rsecHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
				<line x1="0" y1="0" x2="0" y2="6" stroke="rgba(120,160,220,0.14)" stroke-width="2" />
			</pattern>
			<clipPath id="rsecClip"><rect x="0" y="0" width={W} height={H} /></clipPath>
		</defs>

		<g clip-path="url(#rsecClip)">
			<!-- water body, then ground drawn over it so only the channel shows water -->
			<rect x="0" y={wy} width={W} height={H - wy} fill="url(#rsecWater)" style="transition:y .6s ease, height .6s ease" />
			<g class="rsec__wave" style="transform:translateY({wy}px)">
				<path d={`M-40 0 ${Array.from({ length: 12 }, (_, i) => `Q ${-40 + i * 40 + 10} -3 ${-40 + i * 40 + 20} 0 T ${-40 + (i + 1) * 40} 0`).join(' ')}`} fill="none" stroke={waterTop} stroke-width="1.6" opacity="0.9" />
			</g>
			<path d={groundPath} fill="url(#rsecGround)" stroke="#4f78b8" stroke-width="1.4" />
			<path d={groundPath} fill="url(#rsecHatch)" />
		</g>

		<!-- thresholds -->
		{#each [{ m: gauge.awas, c: 'var(--danger)', t: 'AWAS' }, { m: gauge.siaga, c: 'var(--amber)', t: 'SIAGA' }] as th (th.t)}
			<line x1="46" x2={W - 40} y1={y(th.m)} y2={y(th.m)} stroke={th.c} stroke-dasharray="5 4" stroke-width="1.2" />
			<text x={W - 6} y={y(th.m) + 3.5} text-anchor="end" font-size="9" font-family="var(--font-mono)" font-weight="700" fill={th.c}>{th.t} {th.m.toFixed(1)}</text>
		{/each}
		<text x="6" y={y(gauge.bank + 0.25) - 5} font-size="9" font-family="var(--font-mono)" fill="var(--ink-mute)">Tanggul {gauge.bank.toFixed(1)} m</text>

		<!-- gauge staff -->
		<line x1="200" x2="200" y1={y(0)} y2={y(5)} stroke="#c9d5ec" stroke-width="1.5" opacity="0.7" />
		{#each ticks as t (t)}
			<line x1="196" x2="204" y1={y(t)} y2={y(t)} stroke="#c9d5ec" stroke-width="1.2" opacity="0.7" />
			<text x="208" y={y(t) + 3} font-size="8.5" font-family="var(--font-mono)" fill="#93a5c7">{t}</text>
		{/each}

		<!-- current level marker -->
		<line x1="120" x2="196" y1={wy} y2={wy} stroke={statusColor} stroke-width="1.4" />
		<g transform={`translate(96 ${wy})`}>
			<rect x="-40" y="-10" width="64" height="20" rx="6" fill="#07112a" stroke={statusColor} stroke-width="1.4" />
			<text x="-8" y="4" text-anchor="middle" font-size="11" font-family="var(--font-mono)" font-weight="700" fill="#eaf1fb">{level.toFixed(2)} m</text>
		</g>
	</svg>

	<div class="rsec__stats">
		<div><span>TMA</span><b>{level.toFixed(2)} m</b></div>
		<div><span>Jagaan</span><b class:neg={freeboard < 0.5}>{freeboard.toFixed(2)} m</b></div>
		<div><span>Ke AWAS</span><b>{Math.max(0, gauge.awas - level).toFixed(2)} m</b></div>
	</div>
</div>
