<script lang="ts">
	let { variant = 'default' }: { variant?: 'default' | 'dense' | 'hero' } = $props();
</script>

<!-- Large circle outlines -->
<div class="absolute -top-24 -right-24 w-[450px] h-[450px] rounded-full pointer-events-none opacity-[0.04]" style="border: 2px solid #C8102E;"></div>
<div class="absolute -top-16 -right-16 w-[350px] h-[350px] rounded-full pointer-events-none opacity-[0.03]" style="border: 1.5px solid #C8102E;"></div>
<div class="absolute -bottom-20 -left-20 w-72 h-72 rounded-full pointer-events-none opacity-[0.04]" style="border: 2px solid #C8102E;"></div>

<!-- Floating diamond shapes -->
<div class="absolute top-[15%] right-[8%] w-12 h-12 rotate-45 rounded-lg pointer-events-none opacity-[0.05] animate-float" style="background: #C8102E;"></div>
<div class="absolute bottom-[20%] left-[6%] w-8 h-8 rotate-45 rounded-md pointer-events-none opacity-[0.04] animate-float-delayed" style="background: #C8102E;"></div>
<div class="absolute top-[60%] right-[3%] w-5 h-5 rotate-45 rounded-sm pointer-events-none opacity-[0.06]" style="border: 2px solid #C8102E;"></div>

<!-- Plus/cross signs -->
<svg class="absolute top-[25%] left-[4%] w-8 h-8 opacity-[0.05] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="#C8102E" stroke-width="2">
	<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
</svg>
<svg class="absolute bottom-[35%] right-[12%] w-6 h-6 opacity-[0.04] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="#C8102E" stroke-width="2">
	<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
</svg>

<!-- Dots cluster -->
<svg class="absolute top-[40%] left-[2%] w-16 h-16 opacity-[0.04] pointer-events-none" viewBox="0 0 40 40" fill="#C8102E">
	<circle cx="5" cy="5" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="25" cy="5" r="2"/>
	<circle cx="5" cy="15" r="2"/><circle cx="15" cy="15" r="2"/><circle cx="25" cy="15" r="2"/>
	<circle cx="5" cy="25" r="2"/><circle cx="15" cy="25" r="2"/><circle cx="25" cy="25" r="2"/>
</svg>
<svg class="absolute bottom-[15%] right-[6%] w-12 h-12 opacity-[0.03] pointer-events-none" viewBox="0 0 40 40" fill="#C8102E">
	<circle cx="5" cy="5" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="25" cy="5" r="2"/><circle cx="35" cy="5" r="2"/>
	<circle cx="5" cy="15" r="2"/><circle cx="15" cy="15" r="2"/><circle cx="25" cy="15" r="2"/><circle cx="35" cy="15" r="2"/>
	<circle cx="5" cy="25" r="2"/><circle cx="15" cy="25" r="2"/><circle cx="25" cy="25" r="2"/><circle cx="35" cy="25" r="2"/>
	<circle cx="5" cy="35" r="2"/><circle cx="15" cy="35" r="2"/><circle cx="25" cy="35" r="2"/><circle cx="35" cy="35" r="2"/>
</svg>

<!-- Wavy lines -->
<svg class="absolute top-[70%] left-[1%] w-24 h-8 opacity-[0.04] pointer-events-none" viewBox="0 0 100 30" fill="none">
	<path d="M0,15 Q25,0 50,15 T100,15" stroke="#C8102E" stroke-width="2" fill="none"/>
</svg>
<svg class="absolute bottom-[40%] right-[2%] w-20 h-6 opacity-[0.03] pointer-events-none" viewBox="0 0 100 30" fill="none">
	<path d="M0,15 Q25,30 50,15 T100,15" stroke="#C8102E" stroke-width="1.5" fill="none"/>
</svg>

<!-- Triangle -->
<svg class="absolute top-[50%] right-[5%] w-8 h-8 opacity-[0.04] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="#C8102E" stroke-width="1.5">
	<polygon points="12,3 22,21 2,21"/>
</svg>

<!-- Small circles scattered -->
<div class="absolute top-[30%] left-[12%] w-3 h-3 rounded-full pointer-events-none opacity-[0.06]" style="background: #C8102E;"></div>
<div class="absolute top-[55%] right-[15%] w-2 h-2 rounded-full pointer-events-none opacity-[0.05]" style="background: #C8102E;"></div>
<div class="absolute bottom-[25%] left-[18%] w-4 h-4 rounded-full pointer-events-none opacity-[0.03]" style="border: 1.5px solid #C8102E;"></div>

<!-- Hexagon -->
<svg class="absolute bottom-[10%] left-[10%] w-10 h-10 opacity-[0.03] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="#C8102E" stroke-width="1.5">
	<polygon points="12,2 21,7 21,17 12,22 3,17 3,7"/>
</svg>

{#if variant === 'dense' || variant === 'hero'}
	<!-- Extra ornaments for dense variant -->
	<div class="absolute top-[10%] left-[20%] w-16 h-16 rotate-12 rounded-xl pointer-events-none opacity-[0.03]" style="border: 1.5px solid #C8102E;"></div>
	<svg class="absolute top-[80%] right-[20%] w-6 h-6 opacity-[0.04] pointer-events-none animate-float" viewBox="0 0 24 24" fill="#C8102E">
		<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
	</svg>
	<div class="absolute top-[45%] left-[35%] w-2 h-2 rounded-full pointer-events-none opacity-[0.04]" style="background: #C8102E;"></div>
	<div class="absolute bottom-[30%] right-[25%] w-3 h-3 rotate-45 pointer-events-none opacity-[0.03]" style="background: #C8102E;"></div>

	<!-- Dotted line -->
	<svg class="absolute top-[35%] right-[1%] w-1 h-24 opacity-[0.05] pointer-events-none" viewBox="0 0 4 100" fill="none">
		<line x1="2" y1="0" x2="2" y2="100" stroke="#C8102E" stroke-width="2" stroke-dasharray="4 6"/>
	</svg>

	<!-- Arc/quarter circle -->
	<svg class="absolute bottom-[5%] right-[8%] w-16 h-16 opacity-[0.03] pointer-events-none" viewBox="0 0 50 50" fill="none">
		<path d="M0,50 A50,50 0 0,1 50,0" stroke="#C8102E" stroke-width="2" fill="none"/>
	</svg>
{/if}
