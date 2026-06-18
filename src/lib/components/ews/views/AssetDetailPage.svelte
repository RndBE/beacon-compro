<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import ChartColumn from '@lucide/svelte/icons/chart-column';
	import TableProperties from '@lucide/svelte/icons/table-properties';
	import Map from '@lucide/svelte/icons/map';
	import Siren from '@lucide/svelte/icons/siren';
	import Users from '@lucide/svelte/icons/users';
	import Wrench from '@lucide/svelte/icons/wrench';
	import Mountain from '@lucide/svelte/icons/mountain';

	import Panel from '$lib/components/ews/ui/Panel.svelte';
	import Button from '$lib/components/ews/ui/Button.svelte';
	import MiniChart from '$lib/components/ews/ui/MiniChart.svelte';
	import LevelBar from '$lib/components/ews/ui/LevelBar.svelte';
	import StatusBadge from '$lib/components/ews/ui/StatusBadge.svelte';
	import Gauge from '$lib/components/ews/ui/Gauge.svelte';
	import InstrumentCard from '$lib/components/ews/panels/InstrumentCard.svelte';
	import BasinMap from '$lib/components/ews/map/BasinMap.svelte';

	import { markers } from '$lib/ews/stores';
	import { SIAGA_COLOR, siagaLabel } from '$lib/ews/status';
	import { num, fmtUnit, timeHM, dateShort } from '$lib/ews/format';
	import { lastN, riseRatePerHour, minMax } from '$lib/ews/series';
	import { etaToNextSiagaHours } from '$lib/ews/derive';
	import { goto } from '$app/navigation';
	import type {
		AssetKind,
		Pos,
		LandslideSensor,
		SirenNode,
		Shelter,
		OpAsset,
		MapMarker,
		Siaga,
	} from '$lib/ews/types';

	type AnyAsset = Pos | LandslideSensor | SirenNode | Shelter | OpAsset;

	interface Props {
		asset: AnyAsset;
		kind: AssetKind;
	}
	let { asset, kind }: Props = $props();

	// Time range selector (in history-point count: history is hourly, so n=hours)
	let period = $state(48);
	const periods: { h: number; label: string }[] = [
		{ h: 6, label: '6 jam' },
		{ h: 24, label: '24 jam' },
		{ h: 48, label: '48 jam' },
	];

	// Single-asset marker for the mini-map
	const singleMarker = $derived<MapMarker[]>(
		$markers.filter((m) => m.id === asset.id)
	);

	// Back route by kind
	const backRoute = $derived.by((): string => {
		if (kind === 'pos') return '/demo/ews/ringkasan';
		if (kind === 'longsor') return '/demo/ews/longsor';
		if (kind === 'sirine') return '/demo/ews/peringatan-dini';
		if (kind === 'shelter') return '/demo/ews/evakuasi';
		if (kind === 'op') return '/demo/ews/ringkasan';
		return '/demo/ews/ringkasan';
	});

	// Kind label
	const kindLabel = $derived.by((): string => {
		const labels: Record<AssetKind, string> = {
			pos: 'Pos Pemantauan',
			longsor: 'Sensor Longsor',
			sirine: 'Sirine Peringatan',
			shelter: 'Shelter Evakuasi',
			op: 'Aset Operasional',
		};
		return labels[kind];
	});

	// Derived status for kinds that may not have explicit status
	const assetStatus = $derived.by((): Siaga => {
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

	// Location string
	const locationLabel = $derived.by((): string => {
		if (kind === 'pos') return (asset as Pos).sungai;
		if (kind === 'longsor') return (asset as LandslideSensor).lokasi;
		if (kind === 'sirine') return (asset as SirenNode).sungai;
		if (kind === 'shelter') return (asset as Shelter).lokasi;
		if (kind === 'op') return (asset as OpAsset).jenis;
		return '';
	});

	// ── Pos-specific derived ─────────────────────────────────────
	const posSlice = $derived.by((): { points: ReturnType<typeof lastN>; mm: ReturnType<typeof minMax> } | null => {
		if (kind !== 'pos') return null;
		const p = asset as Pos;
		const points = lastN(p.history, period);
		const mm = minMax(points);
		return { points, mm };
	});

	const posRiseRate = $derived.by((): number => {
		if (kind !== 'pos') return 0;
		const p = asset as Pos;
		return riseRatePerHour(lastN(p.history, period));
	});

	const posEta = $derived.by((): number | null => {
		if (kind !== 'pos') return null;
		const p = asset as Pos;
		return etaToNextSiagaHours(p.value, p.thresholds, p.history);
	});

	const posReadings = $derived.by(() => {
		if (kind !== 'pos') return [];
		const p = asset as Pos;
		return [...lastN(p.history, Math.min(period, 12))].reverse();
	});

	// ── Longsor-specific derived ──────────────────────────────────
	const longsorSlice = $derived.by((): ReturnType<typeof lastN> | null => {
		if (kind !== 'longsor') return null;
		const s = asset as LandslideSensor;
		return lastN(s.history, period);
	});

	const longsorMovementRatio = $derived.by((): number => {
		if (kind !== 'longsor') return 0;
		const s = asset as LandslideSensor;
		return s.movementThreshold > 0 ? s.movementMm / s.movementThreshold : 0;
	});

	const longsorRainRatio = $derived.by((): number => {
		if (kind !== 'longsor') return 0;
		const s = asset as LandslideSensor;
		return s.rainThreshold > 0 ? s.rainAccumMm / s.rainThreshold : 0;
	});

	function nextSiagaLabel(level: Siaga): string {
		const labels: Record<Siaga, string> = {
			normal: 'Normal',
			waspada: 'Waspada',
			siaga: 'Siaga',
			awas: 'Awas',
		};
		return labels[level];
	}

	function etaNextLevel(value: number, status: Siaga): Siaga {
		if (status === 'normal') return 'waspada';
		if (status === 'waspada') return 'siaga';
		if (status === 'siaga') return 'awas';
		return 'awas';
	}
</script>

<div class="flex flex-col gap-3">
	<!-- Header -->
	<div class="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
		<Button variant="ghost" size="sm" onclick={() => goto(backRoute)}>
			<ArrowLeft size={15} /> Kembali
		</Button>
		<div class="h-6 w-px bg-line"></div>
		<div class="min-w-0">
			<div class="text-[10px] font-semibold uppercase tracking-widest text-accent-bright">
				{kindLabel}
			</div>
			<h2 class="truncate text-[18px] font-semibold leading-tight text-ink-strong">
				{asset.nama}
			</h2>
		</div>
		<div class="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-dim">
			<span class="flex items-center gap-1">
				<MapPin size={12} />{locationLabel}
			</span>
			<span class="flex items-center gap-1 font-mono text-[10.5px]">
				{num(asset.lat, 4)}, {num(asset.lng, 4)}
			</span>
			<StatusBadge status={assetStatus} pulse={assetStatus !== 'normal'} />
		</div>
	</div>

	<!-- Period selector (only for assets with history) -->
	{#if kind === 'pos' || kind === 'longsor'}
		<div class="flex items-center gap-2">
			<span class="text-[11px] text-ink-dim">Periode analisa:</span>
			{#each periods as p}
				<Button size="sm" variant="ghost" active={period === p.h} onclick={() => (period = p.h)}>
					{p.label}
				</Button>
			{/each}
		</div>
	{/if}

	<!-- ── POS HIDROLOGI ───────────────────────────────────────── -->
	{#if kind === 'pos'}
		{@const pos = asset as Pos}
		{@const slice = posSlice!}
		{@const color = pos.kind === 'arr' ? '#c9a227' : '#4f9bee'}

		<div class="grid grid-cols-1 gap-3 lg:grid-cols-3">
			<div class="lg:col-span-2">
				<Panel
					title="{pos.kind === 'arr' ? 'Curah Hujan' : 'Tinggi Muka Air'} · {pos.sungai}"
					subtitle="{period} jam terakhir"
					icon={ChartColumn}
					accent
					class="h-full"
					bodyClass="flex flex-col justify-center"
				>
					<MiniChart
						points={slice.points}
						height={240}
						{color}
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
			</div>

			<div class="flex flex-col gap-3">
				<!-- KPI cards -->
				<div class="grid grid-cols-2 gap-2">
					<div class="rounded-lg border border-line bg-panel-2 px-3 py-2">
						<div class="text-[10px] uppercase tracking-wide text-ink-dim">Terkini</div>
						<div class="font-mono text-[18px] font-semibold text-ink-strong tnum">
							{num(pos.value, 2)}<span class="text-[10px] text-ink-muted"> {pos.unit}</span>
						</div>
					</div>
					<div class="rounded-lg border border-line bg-panel-2 px-3 py-2">
						<div class="text-[10px] uppercase tracking-wide text-ink-dim">Maks {period}j</div>
						<div class="font-mono text-[18px] font-semibold text-awas tnum">
							{num(slice.mm.max, 2)}<span class="text-[10px] text-ink-muted"> {pos.unit}</span>
						</div>
					</div>
					<div class="rounded-lg border border-line bg-panel-2 px-3 py-2">
						<div class="text-[10px] uppercase tracking-wide text-ink-dim">Min {period}j</div>
						<div class="font-mono text-[18px] font-semibold text-normal tnum">
							{num(slice.mm.min, 2)}<span class="text-[10px] text-ink-muted"> {pos.unit}</span>
						</div>
					</div>
					{#if pos.kind === 'tma'}
						<div class="rounded-lg border border-line bg-panel-2 px-3 py-2">
							<div class="text-[10px] uppercase tracking-wide text-ink-dim">Laju naik</div>
							<div class="font-mono text-[18px] font-semibold text-ink-strong tnum">
								{num(posRiseRate, 2)}<span class="text-[10px] text-ink-muted"> {pos.unit}/jam</span>
							</div>
						</div>
					{/if}
				</div>

				<!-- LevelBar (TMA only) -->
				{#if pos.kind === 'tma'}
					<Panel title="Level Siaga" subtitle="Posisi saat ini terhadap ambang batas">
						<LevelBar value={pos.value} thresholds={pos.thresholds} height={12} />

						<!-- ETA -->
						{#if posEta !== null && posEta > 0}
							{@const nextLevel = etaNextLevel(pos.value, pos.status)}
							<div
								class="mt-3 flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-medium"
								style="background:{SIAGA_COLOR[nextLevel]}14;border:1px solid {SIAGA_COLOR[nextLevel]}44;color:{SIAGA_COLOR[nextLevel]}"
							>
								<span class="h-1.5 w-1.5 rounded-full" style="background:{SIAGA_COLOR[nextLevel]}"></span>
								≈ {num(posEta, 1)} jam menuju {nextSiagaLabel(nextLevel)}
							</div>
						{:else}
							<div class="mt-3 text-[10.5px] text-ink-dim">Tidak ada tren kenaikan saat ini</div>
						{/if}
					</Panel>
				{/if}
			</div>
		</div>

		<!-- InstrumentCard (using InstrumentCard which accepts Pos) -->
		<Panel title="Kartu Instrumen" subtitle="Pos {pos.nama} · {pos.sungai}" icon={ChartColumn} accent>
			<div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
				<InstrumentCard pos={pos} riseRateLabel={posRiseRate !== 0 ? `${num(posRiseRate, 2)} ${pos.unit}/jam` : undefined} etaLabel={posEta !== null && posEta > 0 ? `≈ ${num(posEta, 1)} jam menuju ${nextSiagaLabel(etaNextLevel(pos.value, pos.status))}` : undefined} etaLevel={posEta !== null && posEta > 0 ? etaNextLevel(pos.value, pos.status) : undefined} />
			</div>
		</Panel>

		<!-- Readings table -->
		{#if posReadings.length > 1}
			<Panel title="Pembacaan Terkini" subtitle="{pos.kind === 'arr' ? 'Curah Hujan' : 'Tinggi Muka Air'} ({pos.unit})" icon={TableProperties} flush>
				<div class="overflow-x-auto">
					<table class="w-full text-left text-[12px]">
						<thead>
							<tr class="border-b border-line text-[10px] uppercase tracking-wide text-ink-dim">
								<th class="px-3.5 py-2 font-medium">Waktu</th>
								<th class="px-3.5 py-2 text-right font-medium">Nilai ({pos.unit})</th>
								<th class="px-3.5 py-2 text-right font-medium">Selisih</th>
							</tr>
						</thead>
						<tbody>
							{#each posReadings.slice(0, 12) as r, i (r.t)}
								{@const prev = posReadings[i + 1]?.v}
								{@const diff = prev !== undefined ? r.v - prev : 0}
								<tr class="border-b border-line-soft">
									<td class="px-3.5 py-2 font-mono text-ink tnum">{timeHM(r.t)}</td>
									<td class="px-3.5 py-2 text-right font-mono font-medium text-ink-strong tnum">{num(r.v, 2)}</td>
									<td
										class="px-3.5 py-2 text-right font-mono tnum"
										style="color:{diff > 0 ? SIAGA_COLOR.awas : diff < 0 ? SIAGA_COLOR.normal : 'var(--color-ink-dim)'}"
									>
										{diff > 0 ? '+' : diff < 0 ? '−' : ''}{num(Math.abs(diff), 2)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</Panel>
		{/if}

	<!-- ── SENSOR LONGSOR ──────────────────────────────────────── -->
	{:else if kind === 'longsor'}
		{@const sensor = asset as LandslideSensor}
		{@const lSlice = longsorSlice ?? []}

		<div class="grid grid-cols-1 gap-3 lg:grid-cols-3">
			<div class="lg:col-span-2">
				<Panel
					title="Riwayat Pergerakan Tanah"
					subtitle="{sensor.lokasi} · {period} jam"
					icon={Mountain}
					accent
					class="h-full"
					bodyClass="flex flex-col justify-center"
				>
					<MiniChart
						points={lSlice}
						height={240}
						color={SIAGA_COLOR[sensor.status]}
						unit="mm"
						thresholds={[
							{ value: sensor.movementThreshold, color: SIAGA_COLOR.awas, label: 'Batas Pergerakan' },
						]}
					/>
				</Panel>
			</div>

			<div class="flex flex-col gap-3">
				<!-- Gauges -->
				<Panel title="Rasio Bahaya" subtitle="Pergerakan &amp; hujan vs ambang batas">
					<div class="flex items-start justify-around gap-3">
						<Gauge
							value={sensor.movementMm}
							max={Math.max(1, sensor.movementThreshold)}
							label="Pergerakan"
							sublabel="{num(sensor.movementMm, 1)} / {num(sensor.movementThreshold, 0)} mm"
							color={SIAGA_COLOR[sensor.status]}
							size={88}
							digits={1}
							unit=" mm"
						/>
						<Gauge
							value={sensor.rainAccumMm}
							max={Math.max(1, sensor.rainThreshold)}
							label="Akum. Hujan"
							sublabel="{num(sensor.rainAccumMm, 0)} / {num(sensor.rainThreshold, 0)} mm"
							color={SIAGA_COLOR[sensor.status]}
							size={88}
							digits={0}
							unit=" mm"
						/>
					</div>
				</Panel>

				<!-- Level bars -->
				<Panel title="Indikator Level">
					<div class="space-y-3">
						<div>
							<div class="mb-1 flex justify-between text-[11px]">
								<span class="text-ink-muted">Pergerakan tanah</span>
								<span class="font-mono font-semibold text-ink-strong">{num(longsorMovementRatio * 100, 0)}%</span>
							</div>
							<LevelBar
								value={sensor.movementMm}
								min={0}
								max={sensor.movementThreshold * 1.1}
								color={SIAGA_COLOR[sensor.status]}
								height={10}
							/>
						</div>
						<div>
							<div class="mb-1 flex justify-between text-[11px]">
								<span class="text-ink-muted">Akumulasi hujan</span>
								<span class="font-mono font-semibold text-ink-strong">{num(longsorRainRatio * 100, 0)}%</span>
							</div>
							<LevelBar
								value={sensor.rainAccumMm}
								min={0}
								max={sensor.rainThreshold * 1.1}
								color={SIAGA_COLOR[sensor.status]}
								height={10}
							/>
						</div>
					</div>
				</Panel>
			</div>
		</div>

		<!-- Detail metrics grid -->
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
			<div class="rounded-xl border border-line bg-panel p-3">
				<div class="text-[10px] uppercase tracking-wide text-ink-dim">Pergerakan Kini</div>
				<div class="mt-1 font-mono text-[17px] font-semibold tnum" style="color:{SIAGA_COLOR[sensor.status]}">
					{fmtUnit(sensor.movementMm, 'mm', 1)}
				</div>
				<div class="text-[10px] text-ink-dim">Batas: {num(sensor.movementThreshold, 0)} mm</div>
			</div>
			<div class="rounded-xl border border-line bg-panel p-3">
				<div class="text-[10px] uppercase tracking-wide text-ink-dim">Akum. Hujan</div>
				<div class="mt-1 font-mono text-[17px] font-semibold tnum" style="color:{SIAGA_COLOR[sensor.status]}">
					{fmtUnit(sensor.rainAccumMm, 'mm', 0)}
				</div>
				<div class="text-[10px] text-ink-dim">Batas: {num(sensor.rainThreshold, 0)} mm</div>
			</div>
			<div class="rounded-xl border border-line bg-panel p-3">
				<div class="text-[10px] uppercase tracking-wide text-ink-dim">Rasio Pergerakan</div>
				<div class="mt-1 font-mono text-[17px] font-semibold text-ink-strong tnum">
					{num(longsorMovementRatio * 100, 1)}%
				</div>
			</div>
			<div class="rounded-xl border border-line bg-panel p-3">
				<div class="text-[10px] uppercase tracking-wide text-ink-dim">Rasio Hujan</div>
				<div class="mt-1 font-mono text-[17px] font-semibold text-ink-strong tnum">
					{num(longsorRainRatio * 100, 1)}%
				</div>
			</div>
		</div>

	<!-- ── SIRINE ──────────────────────────────────────────────── -->
	{:else if kind === 'sirine'}
		{@const siren = asset as SirenNode}

		<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
			<div class="rounded-xl border border-line bg-panel p-3">
				<div class="text-[10px] uppercase tracking-wide text-ink-dim">Status Sirine</div>
				<div class="mt-1 flex items-center gap-2">
					<span
						class="h-2.5 w-2.5 rounded-full"
						style="background:{siren.armed ? SIAGA_COLOR.awas : SIAGA_COLOR.normal}"
					></span>
					<span class="text-[14px] font-semibold text-ink-strong">
						{siren.armed ? 'Aktif / Armed' : 'Siap Siaga'}
					</span>
				</div>
			</div>
			<div class="rounded-xl border border-line bg-panel p-3">
				<div class="text-[10px] uppercase tracking-wide text-ink-dim">Sungai</div>
				<div class="mt-1 text-[14px] font-semibold text-ink-strong">{siren.sungai}</div>
			</div>
			<div class="rounded-xl border border-line bg-panel p-3">
				<div class="text-[10px] uppercase tracking-wide text-ink-dim">Status Siaga</div>
				<div class="mt-1">
					<StatusBadge status={siren.status} pulse={siren.status !== 'normal'} />
				</div>
			</div>
			<div class="rounded-xl border border-line bg-panel p-3">
				<div class="text-[10px] uppercase tracking-wide text-ink-dim">Uji Terakhir</div>
				<div class="mt-1 font-mono text-[14px] font-semibold text-ink-strong">
					{timeHM(siren.lastTest)}
				</div>
				<div class="text-[10px] text-ink-dim">{dateShort(siren.lastTest)}</div>
			</div>
		</div>

		<Panel title="Info Sirine" subtitle={siren.nama} icon={Siren}>
			<div class="space-y-2 text-[12px]">
				<div class="flex justify-between border-b border-line-soft py-2">
					<span class="text-ink-muted">Nama</span>
					<span class="font-semibold text-ink-strong">{siren.nama}</span>
				</div>
				<div class="flex justify-between border-b border-line-soft py-2">
					<span class="text-ink-muted">Sungai</span>
					<span class="font-semibold text-ink-strong">{siren.sungai}</span>
				</div>
				<div class="flex justify-between border-b border-line-soft py-2">
					<span class="text-ink-muted">Status siaga</span>
					<StatusBadge status={siren.status} size="xs" />
				</div>
				<div class="flex justify-between border-b border-line-soft py-2">
					<span class="text-ink-muted">Armed</span>
					<span class="font-semibold" style="color:{siren.armed ? SIAGA_COLOR.awas : SIAGA_COLOR.normal}">
						{siren.armed ? 'Ya — Aktif' : 'Tidak — Standby'}
					</span>
				</div>
				<div class="flex justify-between py-2">
					<span class="text-ink-muted">Uji sirine terakhir</span>
					<span class="font-mono text-ink-strong">{timeHM(siren.lastTest)}, {dateShort(siren.lastTest)}</span>
				</div>
			</div>
		</Panel>

	<!-- ── SHELTER ─────────────────────────────────────────────── -->
	{:else if kind === 'shelter'}
		{@const shelter = asset as Shelter}
		{@const occRatio = shelter.kapasitas > 0 ? shelter.terisi / shelter.kapasitas : 0}

		<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
			<div class="rounded-xl border border-line bg-panel p-3">
				<div class="text-[10px] uppercase tracking-wide text-ink-dim">Kapasitas</div>
				<div class="mt-1 font-mono text-[17px] font-semibold text-ink-strong tnum">{num(shelter.kapasitas, 0)}</div>
				<div class="text-[10px] text-ink-dim">jiwa maks</div>
			</div>
			<div class="rounded-xl border border-line bg-panel p-3">
				<div class="text-[10px] uppercase tracking-wide text-ink-dim">Terisi</div>
				<div class="mt-1 font-mono text-[17px] font-semibold tnum" style="color:{SIAGA_COLOR[assetStatus]}">
					{num(shelter.terisi, 0)}
				</div>
				<div class="text-[10px] text-ink-dim">jiwa saat ini</div>
			</div>
			<div class="rounded-xl border border-line bg-panel p-3">
				<div class="text-[10px] uppercase tracking-wide text-ink-dim">Persentase</div>
				<div class="mt-1 font-mono text-[17px] font-semibold tnum" style="color:{SIAGA_COLOR[assetStatus]}">
					{num(occRatio * 100, 0)}%
				</div>
			</div>
			<div class="rounded-xl border border-line bg-panel p-3">
				<div class="text-[10px] uppercase tracking-wide text-ink-dim">Lokasi</div>
				<div class="mt-1 text-[12px] font-semibold text-ink-strong">{shelter.lokasi}</div>
			</div>
		</div>

		<Panel title="Kapasitas Shelter" subtitle="{shelter.nama} · {shelter.lokasi}" icon={Users}>
			<div class="flex items-center gap-4">
				<Gauge
					value={shelter.terisi}
					max={Math.max(1, shelter.kapasitas)}
					label="Hunian"
					sublabel="{num(shelter.terisi, 0)} / {num(shelter.kapasitas, 0)} jiwa"
					color={SIAGA_COLOR[assetStatus]}
					size={96}
					digits={0}
					unit=" jiwa"
				/>
				<div class="flex-1 space-y-2">
					<div class="flex justify-between text-[11px]">
						<span class="text-ink-muted">Tingkat hunian</span>
						<span class="font-mono font-semibold text-ink-strong">{num(occRatio * 100, 1)}%</span>
					</div>
					<LevelBar
						value={shelter.terisi}
						min={0}
						max={shelter.kapasitas}
						color={SIAGA_COLOR[assetStatus]}
						height={10}
					/>
					<div class="text-[11px] text-ink-dim">
						Sisa kapasitas: <span class="font-semibold text-ink-strong">{num(Math.max(0, shelter.kapasitas - shelter.terisi), 0)} jiwa</span>
					</div>
				</div>
			</div>
		</Panel>

	<!-- ── OP ASSET ────────────────────────────────────────────── -->
	{:else if kind === 'op'}
		{@const op = asset as OpAsset}

		<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
			<div class="rounded-xl border border-line bg-panel p-3">
				<div class="text-[10px] uppercase tracking-wide text-ink-dim">Jenis</div>
				<div class="mt-1 text-[14px] font-semibold capitalize text-ink-strong">{op.jenis}</div>
			</div>
			<div class="rounded-xl border border-line bg-panel p-3">
				<div class="text-[10px] uppercase tracking-wide text-ink-dim">Kondisi</div>
				<div class="mt-1 font-mono text-[17px] font-semibold tnum" style="color:{SIAGA_COLOR[assetStatus]}">
					{num(op.kondisi, 0)}%
				</div>
			</div>
			<div class="rounded-xl border border-line bg-panel p-3">
				<div class="text-[10px] uppercase tracking-wide text-ink-dim">Operasional</div>
				<div class="mt-1 flex items-center gap-2">
					<span class="h-2 w-2 rounded-full" style="background:{op.operasional ? SIAGA_COLOR.normal : SIAGA_COLOR.waspada}"></span>
					<span class="text-[13px] font-semibold text-ink-strong">{op.operasional ? 'Beroperasi' : 'Non-Operasional'}</span>
				</div>
			</div>
			<div class="rounded-xl border border-line bg-panel p-3">
				<div class="text-[10px] uppercase tracking-wide text-ink-dim">Status</div>
				<div class="mt-1">
					<StatusBadge status={assetStatus} />
				</div>
			</div>
		</div>

		<Panel title="Kondisi Aset" subtitle="{op.nama} · {op.jenis}" icon={Wrench}>
			<div class="flex items-center gap-4">
				<Gauge
					value={op.kondisi}
					max={100}
					label="Kondisi"
					color={SIAGA_COLOR[assetStatus]}
					size={96}
					digits={0}
					unit="%"
				/>
				<div class="flex-1 space-y-2">
					<div class="flex justify-between text-[11px]">
						<span class="text-ink-muted">Kondisi aset</span>
						<span class="font-mono font-semibold text-ink-strong">{num(op.kondisi, 0)}%</span>
					</div>
					<LevelBar value={op.kondisi} min={0} max={100} color={SIAGA_COLOR[assetStatus]} height={10} />
					<div class="text-[11px] text-ink-muted">
						Jenis: <span class="text-ink capitalize">{op.jenis}</span> ·
						Status: <span class="font-semibold" style="color:{SIAGA_COLOR[assetStatus]}">{op.operasional ? 'Beroperasi' : 'Non-Operasional'}</span>
					</div>
				</div>
			</div>
		</Panel>
	{/if}

	<!-- Mini-map (all asset kinds) -->
	<Panel
		title="Lokasi Aset"
		subtitle="{num(asset.lat, 4)}, {num(asset.lng, 4)}"
		icon={Map}
		flush
		class="min-h-[300px]"
	>
		<div class="relative h-[300px] overflow-hidden rounded-b-xl">
			<BasinMap
				markers={singleMarker}
				center={[asset.lat, asset.lng]}
				zoom={14}
			/>
		</div>
	</Panel>
</div>
