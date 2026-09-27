<script lang="ts" module>
	export interface ChartSeries {
		values: number[];
		color: string;
		label?: string;
		dash?: string;
		/** gradient area under the line */
		fill?: boolean;
		width?: number;
		opacity?: number;
	}
</script>

<script lang="ts">
	// Small responsive SVG line chart shared by the PDAM pages: 24 h curves,
	// 60-minute realtime traces, threshold lines, highlighted x-bands and a cursor.
	let {
		series,
		x0 = 0,
		x1 = 24,
		min,
		max,
		height = 180,
		lines = [],
		bands = [],
		cursor = null,
		marks = [],
		xTicks,
		yTicks = 4,
		yFmt = (v: number) => (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1)),
		bare = false,
		inset = 1
	}: {
		series: ChartSeries[];
		x0?: number;
		x1?: number;
		min?: number;
		max?: number;
		height?: number;
		/** horizontal threshold lines */
		lines?: { v: number; c: string; t?: string }[];
		/** highlighted x ranges (e.g. the 02:00–04:00 MNF window) */
		bands?: { from: number; to: number; c: string; t?: string }[];
		/** vertical cursor at this x */
		cursor?: number | null;
		/** event ticks along the x axis */
		marks?: { x: number; c: string; t?: string }[];
		xTicks?: { v: number; t: string }[];
		yTicks?: number;
		yFmt?: (v: number) => string;
		/** no axes or labels (sparkline) */
		bare?: boolean;
		/** bare mode: horizontal padding, so the cursor can line up with a range thumb */
		inset?: number;
	} = $props();

	let W = $state(0);
	const uid = `lc${Math.random().toString(36).slice(2, 8)}`;

	let dom = $derived.by(() => {
		let lo = min ?? Infinity;
		let hi = max ?? -Infinity;
		if (min == null || max == null) {
			for (const s of series)
				for (const v of s.values) {
					if (min == null) lo = Math.min(lo, v);
					if (max == null) hi = Math.max(hi, v);
				}
			for (const l of lines) {
				if (min == null) lo = Math.min(lo, l.v);
				if (max == null) hi = Math.max(hi, l.v);
			}
			const span = hi - lo || 1;
			if (min == null) lo -= span * 0.08;
			if (max == null) hi += span * 0.08;
		}
		return { lo, hi };
	});

	let pad = $derived(bare ? { l: inset, r: inset, t: 3, b: 3 } : { l: 38, r: 10, t: 10, b: 22 });
	let iw = $derived(Math.max(1, W - pad.l - pad.r));
	let ih = $derived(Math.max(1, height - pad.t - pad.b));
	let xs = $derived((x: number) => pad.l + ((x - x0) / (x1 - x0)) * iw);
	let ys = $derived((v: number) => pad.t + (1 - (v - dom.lo) / (dom.hi - dom.lo || 1)) * ih);
	const xAt = (s: ChartSeries, i: number) => x0 + ((x1 - x0) * i) / Math.max(1, s.values.length - 1);

	function path(s: ChartSeries) {
		return s.values.map((v, i) => `${i ? 'L' : 'M'}${xs(xAt(s, i)).toFixed(1)} ${ys(v).toFixed(1)}`).join('');
	}
	function area(s: ChartSeries) {
		const base = pad.t + ih;
		return `${path(s)}L${xs(x1).toFixed(1)} ${base}L${xs(x0).toFixed(1)} ${base}Z`;
	}
	function valueAt(s: ChartSeries, x: number) {
		const t = ((x - x0) / (x1 - x0)) * (s.values.length - 1);
		const i = Math.max(0, Math.min(s.values.length - 1, Math.floor(t)));
		const j = Math.min(s.values.length - 1, i + 1);
		return s.values[i] + (s.values[j] - s.values[i]) * (t - i);
	}

	let gridVals = $derived.by(() => {
		const out: number[] = [];
		for (let k = 0; k <= yTicks; k++) out.push(dom.lo + ((dom.hi - dom.lo) * k) / yTicks);
		return out;
	});
	let ticks = $derived(
		xTicks ??
			(x1 - x0 === 24
				? [0, 6, 12, 18, 24].map((v) => ({ v: x0 + v, t: `${String(v % 24).padStart(2, '0')}:00` }))
				: [])
	);
</script>

<div bind:clientWidth={W} class="lchart" style="height:{height}px">
	{#if W > 0}
		<svg viewBox={`0 0 ${W} ${height}`} width={W} height={height} role="img" aria-label="Grafik">
			<defs>
				{#each series as s, i (i)}
					{#if s.fill}
						<linearGradient id="{uid}-{i}" x1="0" x2="0" y1="0" y2="1">
							<stop offset="0%" stop-color={s.color} stop-opacity="0.32" />
							<stop offset="100%" stop-color={s.color} stop-opacity="0" />
						</linearGradient>
					{/if}
				{/each}
			</defs>

			{#each bands as b (b.from + '-' + b.to)}
				<rect x={xs(b.from)} y={pad.t} width={Math.max(0, xs(b.to) - xs(b.from))} height={ih} fill={b.c} opacity="0.12" rx="3" />
				{#if b.t && !bare}
					<text x={xs(b.from) + 4} y={pad.t + 11} class="lchart__band">{b.t}</text>
				{/if}
			{/each}

			{#if !bare}
				{#each gridVals as v, k (k)}
					<line x1={pad.l} x2={W - pad.r} y1={ys(v)} y2={ys(v)} class="lchart__grid" />
					<text x={pad.l - 6} y={ys(v) + 3.5} text-anchor="end" class="lchart__ax">{yFmt(v)}</text>
				{/each}
				{#each ticks as t (t.v)}
					<text
						x={xs(t.v)}
						y={height - 6}
						text-anchor={t.v <= x0 ? 'start' : t.v >= x1 ? 'end' : 'middle'}
						class="lchart__ax">{t.t}</text
					>
				{/each}
			{/if}

			{#each lines as l (l.v + (l.t ?? ''))}
				<line x1={pad.l} x2={W - pad.r} y1={ys(l.v)} y2={ys(l.v)} stroke={l.c} stroke-dasharray="5 4" stroke-width="1.2" />
				{#if l.t && !bare}
					<text x={W - pad.r - 2} y={ys(l.v) - 4} text-anchor="end" class="lchart__thr" fill={l.c}>{l.t}</text>
				{/if}
			{/each}

			{#each series as s, i (i)}
				{#if s.fill}<path d={area(s)} fill="url(#{uid}-{i})" />{/if}
				<path
					d={path(s)}
					fill="none"
					stroke={s.color}
					stroke-width={s.width ?? 2}
					stroke-dasharray={s.dash}
					stroke-opacity={s.opacity ?? 1}
					stroke-linejoin="round"
					stroke-linecap="round"
				/>
			{/each}

			{#each marks as m (m.x + (m.t ?? ''))}
				<line x1={xs(m.x)} x2={xs(m.x)} y1={pad.t} y2={pad.t + ih} stroke={m.c} stroke-width="1" stroke-dasharray="2 3" opacity="0.8" />
				<circle cx={xs(m.x)} cy={pad.t + ih} r="3.2" fill={m.c} stroke="#07112a" stroke-width="1.5" />
			{/each}

			{#if cursor != null}
				<line x1={xs(cursor)} x2={xs(cursor)} y1={pad.t - 2} y2={pad.t + ih} stroke="#eaf1fb" stroke-width="1" opacity="0.65" />
				{#each series as s, i (i)}
					{#if !s.dash}
						<circle cx={xs(cursor)} cy={ys(valueAt(s, cursor))} r="3.6" fill="#07112a" stroke={s.color} stroke-width="1.8" />
					{/if}
				{/each}
			{/if}
		</svg>
	{/if}
</div>
