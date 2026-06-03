<script lang="ts">
	import { onMount } from 'svelte';
	import { PUMPS } from './data';

	let { compact = false }: { compact?: boolean } = $props();

	let blinkOn = $state(true);
	onMount(() => {
		const id = setInterval(() => (blinkOn = !blinkOn), 2200);
		return () => clearInterval(id);
	});
</script>

<div class="card" style="height:100%;overflow:hidden;padding:{compact ? 14 : 22}px">
	<div class="card-h" style="margin-bottom:{compact ? 10 : 14}px">
		<div style="display:flex;flex-direction:column;gap:4px">
			<span class="label" style="font-size:{compact ? 10 : 11}px">STATUS PERANGKAT · POMPA & PINTU AIR</span>
			<span style="font-family:var(--font-mono);font-size:{compact ? 11 : 14}px;color:var(--ink-mute)">6 unit · refresh 2s</span>
		</div>
		<span class="pill pill--green" style="font-size:11px">5/6 OPERATIONAL</span>
	</div>
	<div style="display:grid;grid-template-columns:1fr 1fr;gap:{compact ? 6 : 10}px">
		{#each PUMPS as p (p.id)}
			<div
				style="display:flex;align-items:center;gap:{compact ? 8 : 12}px;padding:{compact ? '6px 9px' : '10px 14px'};border:1px solid var(--line);border-radius:8px;background:var(--surface-2)"
			>
				<span class="status-dot {p.status}" style="width:8px;height:8px"></span>
				<div style="display:flex;flex-direction:column;min-width:0;flex:1">
					<span style="font-family:var(--font-mono);font-size:{compact ? 9 : 11}px;font-weight:700;color:var(--ink-mute);letter-spacing:.08em">{p.id}</span>
					<span style="font-size:{compact ? 12 : 14}px;font-weight:600;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{p.name}</span>
				</div>
				<span style="font-family:var(--font-mono);font-size:{compact ? 11 : 13}px;font-weight:600;color:var(--ink-2);white-space:nowrap">
					{p.flow}<span style="display:inline-block;margin-left:6px;color:var(--green);opacity:{blinkOn ? 1 : 0.4}">•</span>
				</span>
			</div>
		{/each}
	</div>
</div>
