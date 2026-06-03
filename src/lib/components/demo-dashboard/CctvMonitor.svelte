<script lang="ts">
	import { onMount } from 'svelte';
	import { CCTV_FEEDS } from './data';

	const n = CCTV_FEEDS.length;
	let idx = $state(0);
	let dragging = $state(false);
	let dragX = $state(0);
	let startX = 0;

	let now = $state(new Date());
	onMount(() => {
		const id = setInterval(() => (now = new Date()), 1000);
		return () => clearInterval(id);
	});
	const pad = (x: number) => String(x).padStart(2, '0');
	let stamp = $derived(`16/05/2026 ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);

	function go(i: number) {
		idx = (i + n) % n;
	}
	function onDown(e: PointerEvent) {
		dragging = true;
		startX = e.clientX;
		dragX = 0;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}
	function onMove(e: PointerEvent) {
		if (dragging) dragX = e.clientX - startX;
	}
	function onUp() {
		if (!dragging) return;
		if (dragX < -40 && idx < n - 1) idx += 1;
		else if (dragX > 40 && idx > 0) idx -= 1;
		dragging = false;
		dragX = 0;
	}
</script>

<div class="card cctv">
	<div class="card-h">
		<div style="display:flex;flex-direction:column;gap:4px">
			<span class="label">CCTV MONITOR · LIVE</span>
			<span style="font-family:var(--font-mono);font-size:11px;color:var(--ink-mute)">{n} kanal · geser untuk pindah</span>
		</div>
		<span style="font-family:var(--font-mono);font-size:10px;color:var(--danger);font-weight:700">● REC</span>
	</div>

	<div
		class="cctv-stage"
		role="group"
		aria-roledescription="carousel"
		aria-label="CCTV — geser untuk ganti kamera"
		onpointerdown={onDown}
		onpointermove={onMove}
		onpointerup={onUp}
		onpointercancel={onUp}
	>
		<div
			class="cctv-track"
			class:cctv-track--drag={dragging}
			style="transform:translateX(calc({-idx * 100}% + {dragX}px))"
		>
			{#each CCTV_FEEDS as f (f.id)}
				<div class="cctv-slide">
					<img src={f.img} alt={f.name} draggable="false" loading="lazy" />
					<span class="cctv-slide__rec">● LIVE</span>
					<span class="cctv-slide__id">{f.id}</span>
					<div class="cctv-slide__meta">
						<span>{f.name}</span>
						<span class="cctv-slide__time">{stamp}</span>
					</div>
				</div>
			{/each}
		</div>

		<button class="cctv-nav cctv-nav--prev" onclick={() => go(idx - 1)} aria-label="Kamera sebelumnya">‹</button>
		<button class="cctv-nav cctv-nav--next" onclick={() => go(idx + 1)} aria-label="Kamera berikutnya">›</button>
	</div>

	<div class="cctv-dots">
		{#each CCTV_FEEDS as f, i (f.id)}
			<button
				class="cctv-dot"
				class:cctv-dot--active={i === idx}
				onclick={() => go(i)}
				aria-label={`Kamera ${i + 1}: ${f.name}`}
			></button>
		{/each}
	</div>
</div>
