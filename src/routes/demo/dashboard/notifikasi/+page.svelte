<script lang="ts">
	import PageHead from '$lib/components/demo-dashboard/PageHead.svelte';
	import AlertFeed from '$lib/components/demo-dashboard/AlertFeed.svelte';
</script>

<svelte:head><title>Notifikasi · Command Center</title></svelte:head>

<div class="demo-page">
	<PageHead title="Notifikasi" sub="Riwayat alert · WhatsApp · SMS · Telegram" />
	<AlertFeed />
</div>
