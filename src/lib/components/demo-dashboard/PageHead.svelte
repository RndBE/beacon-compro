<script lang="ts">
	let { title, sub }: { title: string; sub: string } = $props();
</script>

<div class="demo-page__head">
	<h1 class="demo-page__title">{title}</h1>
	<span class="demo-page__sub">{sub}</span>
</div>
