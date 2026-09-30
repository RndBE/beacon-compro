<script lang="ts">
	import { goto } from '$app/navigation';
	import { Info } from '@lucide/svelte';
	import WosusokasTwin from '$lib/components/demo-spam/WosusokasTwin.svelte';
	import LoggerCards from '$lib/components/demo-spam/LoggerCards.svelte';
	import { LOGGERS, RESERVOIRS, SUPPLY, decodeFault, type ReservoirId } from '$lib/components/demo-spam/wosusokas';
	import { field, reading, statusOf, supplyFlow } from '$lib/components/demo-spam/field.svelte';
	import { ago, fmtClock, fmtNum } from '$lib/components/demo-spam/util';

	const RES = Object.keys(RESERVOIRS) as ReservoirId[];
	const pick = (id: string) => goto(`/demo/spam/realtime?id=${id}`);

	let rows = $derived(LOGGERS.map((l) => ({ l, r: reading(l), s: statusOf(reading(l)) })));
	let flowing = $derived(rows.filter((x) => x.s.st === 'ok'));
	let online = $derived(rows.filter((x) => x.r.online).length);
	let faulty = $derived(rows.filter((x) => (x.r.v.fault ?? 0) > 0));
	let topFault = $derived.by(() => {
		const n = new Map<string, number>();
		for (const x of faulty) for (const f of decodeFault(x.r.v.fault!)) n.set(f, (n.get(f) ?? 0) + 1);
		return [...n.entries()].sort((a, b) => b[1] - a[1])[0];
	});
	/** the pressure a station hands on: P2 downstream where there is one */
	const pOut = (x: (typeof rows)[number]) => x.r.v.p2 ?? x.r.v.p1;
	let pressed = $derived(rows.filter((x) => (pOut(x) ?? 0) > 0.2));
	let last = $derived(Math.max(...rows.map((x) => x.r.t ?? -Infinity)));
	const perRes = (r: ReservoirId) => {
		const xs = rows.filter((x) => x.l.reservoir === r);
		const supply = SUPPLY.filter((l) => l.reservoir === r).reduce((a, l) => a + Math.max(0, reading(l).v.flow ?? 0), 0);
		return { xs, supply, flowing: xs.filter((x) => x.s.st === 'ok').length, online: xs.filter((x) => x.r.online).length };
	};
</script>

<svelte:head><title>Beranda · STESY Smart Water SPAM</title></svelte:head>

<div class="pdam-home">
	<div class="sites-stats leak-stats">
		<div class="card demo-stat">
			<span class="demo-stat__k">Debit ke DMA</span>
			<span class="demo-stat__v">{fmtNum(supplyFlow(), 1)}<small>L/s</small></span>
			<span class="demo-stat__s">≈ {fmtNum(supplyFlow() * 3.6)} m³/jam · {SUPPLY.length} meter outlet</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Titik mengalir</span>
			<span class="demo-stat__v" style:color={flowing.length < LOGGERS.length ? 'var(--amber)' : 'var(--green)'}>{flowing.length}<small>/ {LOGGERS.length}</small></span>
			<span class="demo-stat__s">{flowing.length ? flowing.slice(0, 3).map((x) => x.l.name.replace(' Plesungan', '').replace(' Mojolaban', ' MJL')).join(' · ') : 'belum ada yang mengalir'}</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Fault flowmeter</span>
			<span class="demo-stat__v" style:color={faulty.length ? 'var(--amber)' : 'var(--green)'}>{faulty.length}<small>logger</small></span>
			<span class="demo-stat__s">{topFault ? `${topFault[0].replace(' warning', '')} · ${topFault[1]} logger` : 'tidak ada fault aktif'}</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Tekanan hilir rata-rata</span>
			<span class="demo-stat__v">{pressed.length ? fmtNum(pressed.reduce((a, x) => a + (pOut(x) ?? 0), 0) / pressed.length, 2) : '—'}<small>bar</small></span>
			<span class="demo-stat__s">{pressed.length} titik bertekanan</span>
		</div>
		<div class="card demo-stat">
			<span class="demo-stat__k">Data terakhir</span>
			<span class="demo-stat__v">{Number.isFinite(last) ? fmtClock(last / 60) : '—'}</span>
			<span class="demo-stat__s">{online}/{LOGGERS.length} online{Number.isFinite(last) && field.mode === 'lapangan' ? ` · ${ago(field.now - last)}` : ''}</span>
		</div>
	</div>

	<div class="pdam-main">
		<div class="pdam-main__map"><WosusokasTwin compact /></div>
		<div class="cc-col">
			{#each RES as r (r)}
				{@const x = perRes(r)}
				<div class="card demo-stat">
					<span class="demo-stat__k"><span class="spam-res" style="--c:{RESERVOIRS[r].color}"><i></i>{RESERVOIRS[r].name}</span></span>
					<span class="demo-stat__v">{fmtNum(x.supply, 1)}<small>L/s ke DMA</small></span>
					<span class="demo-stat__s">{x.xs.length} logger · {x.flowing} mengalir · {x.online} online · {RESERVOIRS[r].area}</span>
				</div>
			{/each}
			<div class="card spam-note">
				<Info size={16} />
				<span>
					{#if field.mode === 'lapangan'}
						Semua logger mengirim data, tetapi sebagian besar DMA <b>belum dialiri</b>. Flowmeter-nya melaporkan <i>empty pipe</i>. Hanya DMA 1 Mojolaban
						yang rutin mengalir (±12 L/s sepanjang September). Pilih <b>Skenario operasi</b> untuk melihat jaringan saat seluruh DMA beroperasi.
					{:else}
						Skenario: 12 logger yang sama saat semua DMA beroperasi. Pola harian diambil dari rata-rata per jam DMA 1 Mojolaban (1–29 Sep 2026),
						level tiap titik dari data saat titik itu sempat mengalir.
					{/if}
				</span>
			</div>
		</div>
	</div>

	{#each RES as r (r)}
		<section class="pdam-sec">
			<div class="pdam-sec__h">
				<span class="label"><span class="spam-res" style="--c:{RESERVOIRS[r].color}"><i></i>{RESERVOIRS[r].name} · {RESERVOIRS[r].area}</span></span>
				<span class="pdam-muted">debit · totalizer · tekanan · status flowmeter — klik kartu untuk realtime</span>
			</div>
			<LoggerCards reservoir={r} onpick={pick} />
		</section>
	{/each}
</div>
