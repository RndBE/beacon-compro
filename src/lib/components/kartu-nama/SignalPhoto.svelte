<script lang="ts">
	/** Foto bulat dengan cincin sinyal beacon; cincin meluap keluar, jadi parent perlu `overflow-hidden`. */
	let {
		src,
		alt,
		size,
		border,
		dot,
		rings
	}: {
		src: string;
		alt: string;
		size: number;
		/** Tebal bingkai hitam di tepi foto (px). */
		border: number;
		/** Diameter titik emas di sudut kanan-bawah foto (px). */
		dot: number;
		/** Pasangan [diameter px, opasitas] dari cincin terdalam ke terluar. */
		rings: [number, number][];
	} = $props();
</script>

<div class="relative shrink-0" style="width:{size}px;height:{size}px">
	{#each rings as [d, a]}
		<span
			class="absolute top-1/2 left-1/2 rounded-full border border-solid"
			style="width:{d}px;height:{d}px;margin:{-d / 2}px 0 0 {-d / 2}px;border-color:rgba(235,212,154,{a})"
		></span>
	{/each}
	<img
		{src}
		{alt}
		width="600"
		height="600"
		class="relative size-full rounded-full bg-[#E9E3DA] object-cover"
		style="outline:{border}px solid #151212;outline-offset:{-border / 2}px"
	/>
	<!-- Titik berada di 45° tepi foto: 50% + r·cos45° = 85.36% -->
	<span
		class="absolute rounded-full bg-[#FFD27A] shadow-[0_0_12px_rgba(255,210,122,0.65)]"
		style="width:{dot}px;height:{dot}px;left:85.36%;top:85.36%;margin:{-dot / 2}px 0 0 {-dot / 2}px;outline:{dot > 16 ? 3 : 2.5}px solid #fff"
	></span>
</div>
