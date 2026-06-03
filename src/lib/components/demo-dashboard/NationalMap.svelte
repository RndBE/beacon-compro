<script lang="ts">
	import { onMount } from 'svelte';
	import { CC_SITES, loadGeo, project, type GeoPath } from './data';

	const VW = 1000;
	const VH = 520;
	let tick = $state(0);
	let geoPaths = $state<GeoPath[] | null>(null);

	onMount(() => {
		loadGeo(VW, VH).then((p) => (geoPaths = p));
		const id = setInterval(() => (tick += 1), 1600);
		return () => clearInterval(id);
	});

	const counts = CC_SITES.reduce(
		(acc, s) => ((acc[s.s] = (acc[s.s] || 0) + 1), acc),
		{} as Record<string, number>
	);
	const colorFor = (s: string) => (s === 'alarm' ? '#FF7A66' : s === 'warn' ? '#FFB454' : '#46D78F');
	const meridians = [100, 110, 120, 130, 140];
	const parallels = [-10, -5, 0, 5];
</script>

<div class="cc-map">
	<div class="cc-map__head">
		<span class="cc-map__title">JARINGAN NASIONAL · LIVE</span>
		<span class="cc-map__sub">{CC_SITES.length} sites · 34 provinsi</span>
	</div>
	<div class="cc-map__viz">
		<svg
			width="100%"
			height="100%"
			viewBox={`0 0 ${VW} ${VH}`}
			preserveAspectRatio="xMidYMid meet"
			style="display:block"
		>
			<defs>
				<radialGradient id="ccGlow" cx="50%" cy="50%" r="50%">
					<stop offset="0%" stop-color="rgba(60,195,242,0.55)" />
					<stop offset="100%" stop-color="rgba(60,195,242,0)" />
				</radialGradient>
				<pattern id="ccDots" width="20" height="20" patternUnits="userSpaceOnUse">
					<circle cx="2" cy="2" r="1.0" fill="rgba(120,160,220,0.18)" />
				</pattern>
				<linearGradient id="ccLand" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="rgba(60,130,232,0.22)" />
					<stop offset="100%" stop-color="rgba(31,165,199,0.12)" />
				</linearGradient>
				<filter id="ccLandShadow" x="-5%" y="-5%" width="110%" height="110%">
					<feGaussianBlur stdDeviation="2.5" />
				</filter>
			</defs>

			<rect x="0" y="0" width={VW} height={VH} fill="url(#ccDots)" />

			<g stroke="rgba(120,160,220,0.10)" stroke-width="0.6" fill="none">
				{#each meridians as lon (lon)}
					{@const x = project(lon, 0, VW, VH)[0]}
					<line x1={x} y1={0} x2={x} y2={VH} />
				{/each}
				{#each parallels as lat (lat)}
					{@const y = project(0, lat, VW, VH)[1]}
					<line x1={0} y1={y} x2={VW} y2={y} />
				{/each}
			</g>

			{#if geoPaths}
				<g filter="url(#ccLandShadow)" opacity="0.55">
					{#each geoPaths as p, i (i)}
						<path d={p.d} fill="rgba(60,195,242,0.18)" />
					{/each}
				</g>
				<g
					fill="url(#ccLand)"
					stroke="rgba(140,190,240,0.45)"
					stroke-width="0.7"
					stroke-linejoin="round"
				>
					{#each geoPaths as p, i (i)}
						<path d={p.d} />
					{/each}
				</g>
			{/if}

			<g stroke="rgba(60,195,242,0.20)" stroke-width="1" stroke-dasharray="3 4" fill="none">
				{#each CC_SITES.slice(0, -1) as s, i (s.id)}
					{@const a = project(s.lon, s.lat, VW, VH)}
					{@const b = project(CC_SITES[i + 1].lon, CC_SITES[i + 1].lat, VW, VH)}
					<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
				{/each}
			</g>

			{#each CC_SITES as s, i (s.id)}
				{@const c = project(s.lon, s.lat, VW, VH)}
				{@const isHot = s.s !== 'ok'}
				{@const pulseR = 12 + ((tick + i) % 6) * 4}
				{@const pulseO = 0.55 - ((tick + i) % 6) * 0.09}
				<g>
					{#if isHot}
						<circle
							cx={c[0]}
							cy={c[1]}
							r={pulseR}
							fill="none"
							stroke={colorFor(s.s)}
							stroke-opacity={pulseO}
							stroke-width="1.5"
						/>
					{/if}
					<circle cx={c[0]} cy={c[1]} r="14" fill="url(#ccGlow)" opacity={isHot ? 0.95 : 0.55} />
					<circle cx={c[0]} cy={c[1]} r="4.5" fill={colorFor(s.s)} />
					<circle cx={c[0]} cy={c[1]} r="4.5" fill="none" stroke="#07112A" stroke-width="1.5" />
					<text
						x={c[0] + 9}
						y={c[1] - 5}
						font-family="var(--font-mono)"
						font-size="9.5"
						font-weight="700"
						fill="#EAF1FB"
						letter-spacing="0.04em">{s.id}</text
					>
					<text x={c[0] + 9} y={c[1] + 7} font-family="var(--font-mono)" font-size="8.5" fill="#93A5C7"
						>{s.name}</text
					>
				</g>
			{/each}

			<g stroke="rgba(120,160,220,0.45)" stroke-width="1.4" fill="none">
				<path d={`M10,10 L10,40 M10,10 L40,10`} />
				<path d={`M${VW - 10},10 L${VW - 10},40 M${VW - 10},10 L${VW - 40},10`} />
				<path d={`M10,${VH - 10} L10,${VH - 40} M10,${VH - 10} L40,${VH - 10}`} />
				<path d={`M${VW - 10},${VH - 10} L${VW - 10},${VH - 40} M${VW - 10},${VH - 10} L${VW - 40},${VH - 10}`} />
			</g>

			{#if !geoPaths}
				<text
					x={VW / 2}
					y={VH / 2}
					text-anchor="middle"
					font-family="var(--font-mono)"
					font-size="11"
					fill="rgba(147,165,199,0.6)"
					letter-spacing="0.14em">LOADING GEO LAYER…</text
				>
			{/if}
		</svg>
	</div>
	<div class="cc-map__legend">
		<span><i style="background:#46D78F"></i>Normal · {counts.ok || 0}</span>
		<span><i style="background:#FFB454"></i>Siaga · {counts.warn || 0}</span>
		<span><i style="background:#FF7A66"></i>Awas · {counts.alarm || 0}</span>
	</div>
</div>
