<script lang="ts">
	// Switch between the live field data and the simulated operating scenario.
	import { LOGGERS } from './wosusokas';
	import { field, reading, setMode, statusOf } from './field.svelte';
	import { ago } from './util';

	let flowing = $derived(LOGGERS.filter((l) => statusOf(reading(l)).st === 'ok').length);
	let age = $derived(field.fetchedAt ? (Date.now() - field.fetchedAt) / 60_000 : null);
</script>

<div class="spam-mode" class:spam-mode--sim={field.mode === 'skenario'}>
	<span class="label">Mode data</span>
	<div class="demo-seg" role="group" aria-label="Mode data">
		<button class:is-on={field.mode === 'lapangan'} onclick={() => setMode('lapangan')}>Lapangan</button>
		<button class:is-on={field.mode === 'skenario'} onclick={() => setMode('skenario')}>Skenario operasi</button>
	</div>
	<span class="spam-mode__txt">
		{#if field.mode === 'lapangan'}
			<span class="spam-badge">LAPANGAN</span> Nilai asli dari {LOGGERS.length} logger terpasang lewat mini-stesy. <b>{flowing} dari {LOGGERS.length}</b> titik sedang mengalir.
		{:else}
			<span class="spam-badge spam-badge--sim">SIMULASI</span> Operasi normal di {LOGGERS.length} logger yang sama, pola harian dari data asli DMA 1 Mojolaban. <b>Bukan data lapangan.</b>
		{/if}
	</span>
	{#if field.mode === 'lapangan'}
		{#if field.error}
			<span class="spam-mode__fresh is-err">Data lapangan gagal dimuat: {field.error}</span>
		{:else}
			<span class="spam-mode__fresh">{age == null ? 'memuat…' : `diperbarui ${ago(age)}`}</span>
		{/if}
	{/if}
</div>
