<script lang="ts">
	type Corner = 'tl' | 'tr' | 'bl' | 'br';

	/** Garis arsir emas di satu sudut parent (segitiga siku-siku), parent harus `relative`. */
	let {
		size,
		step,
		corner,
		unit = '1px'
	}: { size: number; step: number; corner: Corner; unit?: string } = $props();

	// Digambar sekali untuk sudut kanan-atas, sudut lain didapat dengan memutar.
	const d = $derived(
		Array.from(
			{ length: Math.floor(size / step) },
			(_, i) => `M${(i + 1) * step} 0L${size} ${size - (i + 1) * step}`
		).join('')
	);

	const place = {
		tr: 'right-0 top-0',
		br: 'right-0 bottom-0 rotate-90',
		bl: 'left-0 bottom-0 rotate-180',
		tl: 'left-0 top-0 -rotate-90'
	};
</script>

<svg
	viewBox="0 0 {size} {size}"
	width={size}
	height={size}
	class="pointer-events-none absolute z-10 {place[corner]}"
	style="width:calc({size} * {unit});height:calc({size} * {unit})"
	aria-hidden="true"
>
	<path {d} class="draw" fill="none" stroke="#F0D38A" stroke-width="1.5" stroke-linecap="round" />
</svg>

<style>
	/* Garis tergambar sekali saat dimuat. Pola dash berulang per sub-path, jadi semua garis
	   (maks. size·√2 ≈ 184px) tergambar bersamaan; di luar animasi path tetap utuh. */
	.draw {
		animation: draw 1.4s cubic-bezier(0.65, 0, 0.35, 1) 0.6s backwards;
	}

	@keyframes draw {
		from {
			stroke-dasharray: 190;
			stroke-dashoffset: 190;
		}
		to {
			stroke-dasharray: 190;
			stroke-dashoffset: 0;
		}
	}
</style>
