<script lang="ts">
	let {
		label,
		value,
		unit,
		min,
		max,
		ok = [0, 100],
		compact = false
	}: {
		label: string;
		value: string;
		unit: string;
		min: number;
		max: number;
		ok?: [number, number];
		compact?: boolean;
	} = $props();

	let num = $derived(Number(value));
	let pct = $derived(Math.max(0, Math.min(1, (num - min) / (max - min))));
	let inOk = $derived(num >= ok[0] && num <= ok[1]);
	let color = $derived(inOk ? 'var(--green)' : 'var(--danger)');
	let R = $derived(compact ? 44 : 56);
	let C = $derived(2 * Math.PI * R);
	const arc = 0.7;
	let offsetRot = $derived(180 + (1 - arc) * 180);
	// safe band drawn as a thin inner arc
	let okFrom = $derived(Math.max(0, Math.min(1, (ok[0] - min) / (max - min))));
	let okTo = $derived(Math.max(0, Math.min(1, (ok[1] - min) / (max - min))));
	let r2 = $derived(R - (compact ? 9 : 11));
	let C2 = $derived(2 * Math.PI * r2);
</script>

<div class="wq-gauge" class:wq-gauge--bad={!inOk} style="gap:{compact ? 3 : 8}px">
	<svg width="100%" height="100%" viewBox="-72 -72 144 144" preserveAspectRatio="xMidYMid meet" style="display:block;flex:1 1 auto;min-height:0">
		<circle r={R} fill="none" stroke="var(--line)" stroke-width={compact ? 8 : 10} stroke-dasharray={`${C * arc} ${C}`} transform={`rotate(${offsetRot})`} stroke-linecap="round" />
		<circle r={R} fill="none" stroke={color} stroke-width={compact ? 8 : 10} stroke-dasharray={`${C * arc * pct} ${C}`} transform={`rotate(${offsetRot})`} stroke-linecap="round" style="transition:stroke-dasharray .6s ease" />
		<circle
			r={r2}
			fill="none"
			stroke="rgba(70,215,143,0.45)"
			stroke-width="2"
			stroke-dasharray={`${C2 * arc * (okTo - okFrom)} ${C2}`}
			transform={`rotate(${offsetRot + 360 * arc * okFrom})`}
		/>
		<text x="0" y="0" text-anchor="middle" font-family="var(--font-mono)" font-size={compact ? 19 : 22} font-weight="600" fill={inOk ? 'var(--ink)' : 'var(--danger)'}>{value}</text>
		<text x="0" y="18" text-anchor="middle" font-family="var(--font-mono)" font-size={compact ? 9 : 11} fill="var(--ink-mute)">{unit}</text>
	</svg>
	<span class="wq-gauge__label" style="font-size:{compact ? 10 : 12}px">{label}</span>
</div>
