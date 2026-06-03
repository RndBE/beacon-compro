<script lang="ts">
	import { TREND_CARDS } from './data';

	const W = 120;
	const H = 34;
	function sparkPath(spark: number[]): string {
		const min = Math.min(...spark);
		const max = Math.max(...spark);
		const span = max - min || 1;
		return spark
			.map((v, i) => {
				const x = (i / (spark.length - 1)) * W;
				const y = H - ((v - min) / span) * (H - 4) - 2;
				return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
			})
			.join(' ');
	}
</script>

<div class="trend-strip">
	{#each TREND_CARDS as c (c.label)}
		{@const d = sparkPath(c.spark)}
		<div class="card trend-card">
			<span class="trend-card__label">{c.label}</span>
			<div class="trend-card__row">
				<span class="trend-card__value">{c.value}<small>{c.unit}</small></span>
				<span class="trend-card__delta {c.up ? 'up' : 'down'}">{c.up ? '▲' : '▼'} {c.delta}</span>
			</div>
			<svg class="trend-card__spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
				<path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill={c.up ? 'rgba(70,215,143,0.14)' : 'rgba(255,122,102,0.14)'} stroke="none" />
				<path {d} fill="none" stroke={c.up ? '#46D78F' : '#FF7A66'} stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" />
			</svg>
		</div>
	{/each}
</div>
