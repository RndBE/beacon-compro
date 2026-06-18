<script lang="ts">
	let { children } = $props();
</script>

<div class="stesy min-h-screen bg-[#1C1C41] text-white">
	{@render children()}
</div>
