<script lang="ts">
	/**
	 * DetailDrawer — slide-in side panel for quick asset inspection.
	 * Consumed by WallView (Task 23) for click-to-inspect.
	 * Accepts any EWS asset + kind; renders key metrics + a mini-chart
	 * for assets with history. Minimal implementation — Task 23 may extend.
	 */
	import X from '@lucide/svelte/icons/x';
	import MapPin from '@lucide/svelte/icons/map-pin';

	import Panel from '$lib/components/ews/ui/Panel.svelte';
	import MiniChart from '$lib/components/ews/ui/MiniChart.svelte';
	import LevelBar from '$lib/components/ews/ui/LevelBar.svelte';
	import StatusBadge from '$lib/components/ews/ui/StatusBadge.svelte';
	import Gauge from '$lib/components/ews/ui/Gauge.svelte';

	import { SIAGA_COLOR } from '$lib/ews/status';
	import { num, fmtUnit, timeHM, dateShort } from '$lib/ews/format';
	import { goto } from '$app/navigation';
	import type {
		AssetKind,
		Pos,
		LandslideSensor,
		SirenNode,
		Shelter,
		OpAsset,
		Siaga,
	} from '$lib/ews/types';

	type AnyAsset = Pos | LandslideSensor | SirenNode | Shelter | OpAsset;

	interface Props {
		asset: AnyAsset | null;
		kind: AssetKind | null;
		open: boolean;
		onClose: () => void;
	}
	let { asset, kind, open, onClose }: Props = $props();

	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}

	// Derived status
	const assetStatus = $derived.by((): Siaga => {
		if (!asset || !kind) return 'normal';
		if (kind === 'pos') return (asset as Pos).status;
		if (kind === 'longsor') return (asset as LandslideSensor).status;
		if (kind === 'sirine') return (asset as SirenNode).status;
		if (kind === 'shelter') {
			const sh = asset as Shelter;
			const ratio = sh.kapasitas > 0 ? sh.terisi / sh.kapasitas : 0;
			if (ratio >= 1) return 'awas';
			if (ratio >= 0.85) return 'siaga';
			if (ratio >= 0.5) return 'waspada';
			return 'normal';
		}
		if (kind === 'op') return (asset as OpAsset).operasional ? 'normal' : 'waspada';
		return 'normal';
	});

	const kindLabel = $derived.by((): string => {
		if (!kind) return '';
		const labels: Record<AssetKind, string> = {
			pos: 'Pos Pemantauan',
			longsor: 'Sensor Longsor',
			sirine: 'Sirine',
			shelter: 'Shelter',
			op: 'Aset Operasional',
		};
		return labels[kind];
	});
</script>

<svelte:window onkeydown={onKey} />

{#snippet metricCard(label: string, value: string, unit?: string)}
	<div class="rounded-lg border border-line bg-panel-2 px-3 py-2">
		<div class="text-[10px] uppercase tracking-wide text-ink-dim">{label}</div>
		<div class="mt-1 font-mono text-[16px] font-semibold text-ink-strong tnum">
			{value}<span class="ml-0.5 text-[10px] font-normal text-ink-muted">{unit ?? ''}</span>
		</div>
	</div>
{/snippet}

{#if open && asset && kind}
	<!-- Backdrop -->
	<button
		class="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-[2px]"
		onclick={onClose}
		aria-label="Tutup panel"
	></button>

	<!-- Drawer -->
	<div
		class="fixed inset-y-0 right-0 z-[1001] flex w-full max-w-[480px] flex-col border-l border-line bg-surface shadow-2xl"
		style="animation:ews-drawer-in .3s cubic-bezier(.22,1,.36,1)"
		role="dialog"
		aria-modal="true"
		aria-label="Detail aset"
	>
		<!-- Header -->
		<header class="flex items-start gap-3 border-b border-line px-4 py-3.5">
			<div class="min-w-0 flex-1">
				<div class="text-[10px] font-semibold uppercase tracking-widest text-accent-bright">
					{kindLabel}
				</div>
				<h2 class="mt-0.5 truncate text-[17px] font-semibold text-ink-strong">
					{asset.nama}
				</h2>
				<div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-dim">
					<span class="flex items-center gap-1">
						<MapPin size={11} />{num(asset.lat, 4)}, {num(asset.lng, 4)}
					</span>
				</div>
			</div>
			<StatusBadge status={assetStatus} pulse={assetStatus !== 'normal'} />
			<button
				onclick={onClose}
				class="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-ink-muted hover:bg-panel hover:text-ink-strong"
				aria-label="Tutup"
			>
				<X size={16} />
			</button>
		</header>

		<!-- Scrollable body -->
		<div class="flex-1 space-y-3 overflow-y-auto p-4">

			{#if kind === 'pos'}
				{@const pos = asset as Pos}
				<div class="grid grid-cols-3 gap-2">
					{@render metricCard('Nilai Kini', num(pos.value, 2), pos.unit)}
					{@render metricCard('Jenis', pos.kind === 'arr' ? 'Hujan' : 'TMA')}
					{@render metricCard('Status', pos.status.charAt(0).toUpperCase() + pos.status.slice(1))}
				</div>
				<Panel title="{pos.kind === 'arr' ? 'Curah Hujan' : 'Tinggi Muka Air'} · 48 jam" subtitle={pos.sungai}>
					<MiniChart
						points={pos.history}
						color={pos.kind === 'arr' ? '#c9a227' : '#4f9bee'}
						unit={pos.unit}
						bars={pos.kind === 'arr'}
						yMin={pos.kind === 'arr' ? 0 : undefined}
						thresholds={pos.kind === 'tma'
							? [
									{ value: pos.thresholds.waspada, color: SIAGA_COLOR.waspada, label: 'Waspada' },
									{ value: pos.thresholds.siaga, color: SIAGA_COLOR.siaga, label: 'Siaga' },
									{ value: pos.thresholds.awas, color: SIAGA_COLOR.awas, label: 'Awas' },
								]
							: []}
					/>
				</Panel>
				{#if pos.kind === 'tma'}
					<Panel title="Level Siaga">
						<LevelBar value={pos.value} thresholds={pos.thresholds} height={10} />
					</Panel>
				{/if}

			{:else if kind === 'longsor'}
				{@const sensor = asset as LandslideSensor}
				<div class="grid grid-cols-2 gap-2">
					{@render metricCard('Pergerakan', num(sensor.movementMm, 1), 'mm')}
					{@render metricCard('Akum. Hujan', num(sensor.rainAccumMm, 0), 'mm')}
				</div>
				<Panel title="Riwayat Pergerakan · 48 jam" subtitle={sensor.lokasi}>
					<MiniChart
						points={sensor.history}
						color={SIAGA_COLOR[sensor.status]}
						unit="mm"
						thresholds={[
							{ value: sensor.movementThreshold, color: SIAGA_COLOR.awas, label: 'Batas' },
						]}
					/>
				</Panel>
				<Panel title="Indikator Risiko">
					<div class="flex items-start justify-around gap-3">
						<Gauge
							value={sensor.movementMm}
							max={Math.max(1, sensor.movementThreshold)}
							label="Pergerakan"
							color={SIAGA_COLOR[sensor.status]}
							size={80}
							digits={1}
							unit=" mm"
						/>
						<Gauge
							value={sensor.rainAccumMm}
							max={Math.max(1, sensor.rainThreshold)}
							label="Hujan"
							color={SIAGA_COLOR[sensor.status]}
							size={80}
							digits={0}
							unit=" mm"
						/>
					</div>
				</Panel>

			{:else if kind === 'sirine'}
				{@const siren = asset as SirenNode}
				<div class="grid grid-cols-2 gap-2">
					{@render metricCard('Status', siren.armed ? 'Armed' : 'Standby')}
					{@render metricCard('Sungai', siren.sungai)}
				</div>
				<Panel title="Info Sirine">
					<div class="space-y-2 text-[12px]">
						<div class="flex justify-between py-1.5 border-b border-line-soft">
							<span class="text-ink-muted">Armed</span>
							<span class="font-semibold" style="color:{siren.armed ? SIAGA_COLOR.awas : SIAGA_COLOR.normal}">
								{siren.armed ? 'Ya' : 'Tidak'}
							</span>
						</div>
						<div class="flex justify-between py-1.5 border-b border-line-soft">
							<span class="text-ink-muted">Siaga</span>
							<StatusBadge status={siren.status} size="xs" />
						</div>
						<div class="flex justify-between py-1.5">
							<span class="text-ink-muted">Uji terakhir</span>
							<span class="font-mono text-ink-strong">{timeHM(siren.lastTest)}, {dateShort(siren.lastTest)}</span>
						</div>
					</div>
				</Panel>

			{:else if kind === 'shelter'}
				{@const shelter = asset as Shelter}
				{@const occRatio = shelter.kapasitas > 0 ? shelter.terisi / shelter.kapasitas : 0}
				<div class="grid grid-cols-2 gap-2">
					{@render metricCard('Kapasitas', num(shelter.kapasitas, 0), 'jiwa')}
					{@render metricCard('Terisi', num(shelter.terisi, 0), 'jiwa')}
				</div>
				<Panel title="Hunian Shelter">
					<div class="flex items-center gap-4">
						<Gauge
							value={shelter.terisi}
							max={Math.max(1, shelter.kapasitas)}
							label="Hunian"
							color={SIAGA_COLOR[assetStatus]}
							size={80}
							digits={0}
							unit=" jiwa"
						/>
						<div class="flex-1">
							<div class="mb-1 flex justify-between text-[11px]">
								<span class="text-ink-muted">Tingkat hunian</span>
								<span class="font-mono font-semibold text-ink-strong">{num(occRatio * 100, 0)}%</span>
							</div>
							<LevelBar value={shelter.terisi} min={0} max={shelter.kapasitas} color={SIAGA_COLOR[assetStatus]} />
							<div class="mt-1 text-[10px] text-ink-dim">{shelter.lokasi}</div>
						</div>
					</div>
				</Panel>

			{:else if kind === 'op'}
				{@const op = asset as OpAsset}
				<div class="grid grid-cols-2 gap-2">
					{@render metricCard('Jenis', op.jenis)}
					{@render metricCard('Kondisi', num(op.kondisi, 0), '%')}
				</div>
				<Panel title="Kondisi Aset">
					<div class="flex items-center gap-4">
						<Gauge
							value={op.kondisi}
							max={100}
							label="Kondisi"
							color={SIAGA_COLOR[assetStatus]}
							size={80}
							digits={0}
							unit="%"
						/>
						<div class="flex-1 space-y-1.5">
							<div class="flex justify-between text-[11px]">
								<span class="text-ink-muted">Kondisi</span>
								<span class="font-mono font-semibold text-ink-strong">{num(op.kondisi, 0)}%</span>
							</div>
							<LevelBar value={op.kondisi} min={0} max={100} color={SIAGA_COLOR[assetStatus]} />
							<div class="text-[11px]">
								<span class="text-ink-muted">Operasional: </span>
								<span class="font-semibold capitalize" style="color:{SIAGA_COLOR[assetStatus]}">
									{op.operasional ? 'Ya' : 'Tidak'}
								</span>
							</div>
						</div>
					</div>
				</Panel>
			{/if}

			<!-- Link to full detail page -->
			{#if asset && kind}
				<button
					onclick={() => { onClose(); goto('/demo/ews/' + kind + '/' + asset!.id); }}
					class="w-full rounded-lg border border-line bg-panel px-4 py-2.5 text-[12px] font-medium text-ink-muted transition-colors hover:border-accent/40 hover:text-ink-strong"
				>
					Buka halaman detail lengkap →
				</button>
			{/if}
		</div>
	</div>
{/if}

<style>
	@keyframes ews-drawer-in {
		from { transform: translateX(100%); opacity: 0; }
		to { transform: translateX(0); opacity: 1; }
	}
</style>
