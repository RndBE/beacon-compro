<script lang="ts">
	import { onMount } from 'svelte';
	import { TELEMETRY_ROWS } from './data';

	// subtle "live" flicker on the sync indicator
	let beat = $state(true);
	onMount(() => {
		const id = setInterval(() => (beat = !beat), 1400);
		return () => clearInterval(id);
	});
</script>

<div class="card tele">
	<div class="card-h">
		<div style="display:flex;flex-direction:column;gap:4px">
			<span class="label">TELEMETRY HEALTH</span>
			<span style="font-family:var(--font-mono);font-size:11px;color:var(--ink-mute)">MQTT · 44 node</span>
		</div>
		<span style="font-family:var(--font-mono);font-size:10px;color:var(--green);font-weight:700;opacity:{beat ? 1 : 0.45}">● SYNC</span>
	</div>

	<div class="tele-rows">
		{#each TELEMETRY_ROWS as r (r.label)}
			<div class="tele-row">
				<span class="tele-row__k">{r.label}</span>
				<span class="tele-row__v tele-row__v--{r.tone}">{r.value}</span>
				<span class="tele-bar"><span class="tele-bar__fill tele-bar__fill--{r.tone}" style="width:{r.pct}%"></span></span>
			</div>
		{/each}
	</div>
</div>
