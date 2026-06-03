<script lang="ts">
	import { onMount } from 'svelte';

	let now = $state(new Date());
	onMount(() => {
		const id = setInterval(() => (now = new Date()), 1000);
		return () => clearInterval(id);
	});

	const pad = (n: number) => String(n).padStart(2, '0');
	let hh = $derived(pad(now.getHours()));
	let mm = $derived(pad(now.getMinutes()));
	let ss = $derived(pad(now.getSeconds()));
</script>

<div class="cc-topbar">
	<span class="cc-topbar__brand"><span class="cmdctr-pulse"></span> SYSTEM ONLINE · NATIONAL</span>
	<span class="cc-topbar__div"></span>
	<div class="cc-topbar__kv">
		<span class="cc-topbar__kv-k">Sensor aktif</span><span class="cc-topbar__kv-v">42 / 44</span>
	</div>
	<div class="cc-topbar__kv">
		<span class="cc-topbar__kv-k">Last sync</span><span class="cc-topbar__kv-v">2s ago</span>
	</div>
	<div class="cc-topbar__kv cc-topbar__kv--danger">
		<span class="cc-topbar__kv-k">Alarm aktif</span><span class="cc-topbar__kv-v">1</span>
	</div>
	<div class="cc-topbar__kv">
		<span class="cc-topbar__kv-k">Notifikasi 24h</span><span class="cc-topbar__kv-v">186</span>
	</div>
	<div class="cc-topbar__kv cc-topbar__kv--ok">
		<span class="cc-topbar__kv-k">Uptime 30d</span><span class="cc-topbar__kv-v">99.6%</span>
	</div>
	<span class="cc-topbar__clock">
		<b>{hh}:{mm}<span style="opacity:.5">:{ss}</span> WIB</b>16 Mei 2026
	</span>
</div>
