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

	const num = Number(value);
	let pct = $derived(Math.max(0, Math.min(1, (num - min) / (max - min))));
	let inOk = $derived(num >= ok[0] && num <= ok[1]);
	let color = $derived(inOk ? 'var(--green)' : 'var(--amber)');
	let R = $derived(compact ? 44 : 56);
	let C = $derived(2 * Math.PI * R);
	const arc = 0.7;
	let offsetRot = $derived(180 + (1 - arc) * 180);
</script>

<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:{compact ? 3 : 8}px;min-width:0;min-height:0;flex:1">
	<svg width="100%" height="100%" viewBox="-72 -72 144 144" preserveAspectRatio="xMidYMid meet" style="display:block;flex:1 1 auto;min-height:0">
		<circle r={R} fill="none" stroke="var(--line)" stroke-width={compact ? 8 : 10} stroke-dasharray={`${C * arc} ${C}`} transform={`rotate(${offsetRot})`} stroke-linecap="round" />
		<circle r={R} fill="none" stroke={color} stroke-width={compact ? 8 : 10} stroke-dasharray={`${C * arc * pct} ${C}`} transform={`rotate(${offsetRot})`} stroke-linecap="round" />
		<text x="0" y="0" text-anchor="middle" font-family="var(--font-mono)" font-size={compact ? 19 : 22} font-weight="600" fill="var(--ink)">{value}</text>
		<text x="0" y="18" text-anchor="middle" font-family="var(--font-mono)" font-size={compact ? 9 : 11} fill="var(--ink-mute)">{unit}</text>
	</svg>
	<span style="font-family:var(--font-mono);font-size:{compact ? 10 : 12}px;font-weight:600;color:var(--ink-mute);letter-spacing:.06em;text-transform:uppercase">{label}</span>
</div>
