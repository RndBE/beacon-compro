<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import { PIPES_URL, ZONES_URL } from '../data';
	import { imageryTile } from '../../demo-dashboard/basemap';
	import type { TwinApi } from './scene';

	let {
		onready,
		onselect,
		compass = null,
		children
	}: {
		onready: (api: TwinApi) => void;
		onselect: (id: string) => void;
		compass?: HTMLElement | null;
		children?: Snippet;
	} = $props();

	let host = $state<HTMLDivElement | null>(null);
	let phase = $state<'load' | 'ready' | 'error'>('load');
	let tiles = $state({ loaded: 0, total: 0 });
	let errorMsg = $state('');

	onMount(() => {
		let api: TwinApi | null = null;
		let destroyed = false;
		(async () => {
			try {
				const [{ createPdamTwin }, pipes, zones] = await Promise.all([
					import('./scene'),
					fetch(PIPES_URL).then((r) => r.json()),
					fetch(ZONES_URL).then((r) => r.json())
				]);
				if (destroyed || !host) return;
				const small = Math.min(window.innerWidth, window.innerHeight) < 700;
				api = createPdamTwin({
					container: host,
					pipes,
					zones,
					tileUrl: imageryTile,
					tileZoom: small ? 13 : 14,
					compass,
					onSelect: (id) => onselect(id),
					onImagery: (loaded, total) => (tiles = { loaded, total })
				});
				phase = 'ready';
				onready(api);
			} catch (e) {
				console.error('[PdamTwin] init failed', e);
				errorMsg = e instanceof Error ? e.message : String(e);
				phase = 'error';
			}
		})();
		return () => {
			destroyed = true;
			api?.dispose();
		};
	});
</script>

<div class="twin-view" bind:this={host}>
	{#if phase === 'load'}
		<div class="twin-view__loading">
			<span class="twin-spinner"></span>
			<span>Menyusun model 3D jaringan Tirtamarta…</span>
		</div>
	{:else if phase === 'error'}
		<div class="twin-view__loading">
			<span>Model 3D gagal dimuat.</span>
			<small>{errorMsg}</small>
		</div>
	{/if}
	{#if phase === 'ready' && tiles.total && tiles.loaded < tiles.total}
		<div class="twin-view__tiles">Citra satelit {Math.round((tiles.loaded / tiles.total) * 100)}%</div>
	{/if}
	{@render children?.()}
</div>
