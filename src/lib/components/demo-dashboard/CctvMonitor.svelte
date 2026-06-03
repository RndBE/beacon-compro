<script lang="ts">
	import { onMount } from 'svelte';
	import { CCTV_FEEDS } from './data';

	let now = $state(new Date());
	onMount(() => {
		const id = setInterval(() => (now = new Date()), 1000);
		return () => clearInterval(id);
	});

	const pad = (n: number) => String(n).padStart(2, '0');
	let stamp = $derived(`16/05/2026 ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
</script>

<div class="card cctv">
	<div class="card-h">
		<div style="display:flex;flex-direction:column;gap:4px">
			<span class="label">CCTV MONITOR · LIVE</span>
			<span style="font-family:var(--font-mono);font-size:11px;color:var(--ink-mute)">{CCTV_FEEDS.length} kanal · streaming</span>
		</div>
		<span style="font-family:var(--font-mono);font-size:10px;color:var(--danger);font-weight:700">● REC</span>
	</div>
	<div class="cctv-grid">
		{#each CCTV_FEEDS as f (f.id)}
			<div class="cctv-tile">
				<span class="cctv-tile__rec">● LIVE</span>
				<span class="cctv-tile__id">{f.id}</span>
				<div class="cctv-tile__meta">
					<span>{f.name}</span>
					<span class="cctv-tile__time">{stamp}</span>
				</div>
			</div>
		{/each}
	</div>
</div>
