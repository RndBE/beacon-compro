<script lang="ts">
	type Corner = 'tl' | 'tr' | 'bl' | 'br';

	/** Garis arsir emas di satu sudut parent (segitiga siku-siku), parent harus `relative`. */
	let { size, step, corner }: { size: number; step: number; corner: Corner } = $props();

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
	class="pointer-events-none absolute {place[corner]}"
	aria-hidden="true"
>
	<path {d} fill="none" stroke="#F0D38A" stroke-width="1.5" stroke-linecap="round" />
</svg>
