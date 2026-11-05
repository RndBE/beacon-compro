<script lang="ts">
	import {
		ArrowUpRight,
		Check,
		Clock3,
		Globe,
		Mail,
		MapPin,
		Phone,
		Share2,
		UserPlus
	} from '@lucide/svelte';
	import BrandIcon from '$lib/components/kartu-nama/BrandIcon.svelte';
	import Hatch from '$lib/components/kartu-nama/Hatch.svelte';
	import SignalPhoto from '$lib/components/kartu-nama/SignalPhoto.svelte';
	import { COMPANY, fullName, interpolate } from '$lib/data/kartu-nama';
	import { locale, translations as tr, type Locale, type TranslationKey } from '$lib/i18n';
	import type { Attachment } from 'svelte/attachments';

	let { data } = $props();

	const card = $derived(data.card);
	const name = $derived(fullName(card));
	const l = (key: TranslationKey) => tr[key][$locale];

	// Latar kartu merah: kilau emas tipis di atas gradasi merah Beacon.
	const glow = '#F5D58A47 0%, #F5D58A00 60%';
	const bgMobile = `radial-gradient(ellipse 55% 95% at 82% 29%, ${glow}), linear-gradient(122deg, #DA1C3B 15%, #C8102E 50%, #8F0C22 85%)`;
	const bgDesktop = `radial-gradient(ellipse 65% 37.5% at 50% 30%, ${glow}), linear-gradient(180deg, #DA1C3B 0%, #C8102E 50%, #8F0C22 100%)`;
	const bgQr = `radial-gradient(ellipse 70% 55% at 50% 36%, ${glow}), linear-gradient(155deg, #DA1C3B 12%, #C8102E 50%, #8F0C22 88%)`;

	const ringsSm: [number, number][] = [
		[100, 0.85],
		[136, 0.4],
		[184, 0.32],
		[244, 0.27],
		[316, 0.21],
		[400, 0.16],
		[496, 0.12]
	];
	const ringsLg: [number, number][] = [
		[280, 0.85],
		[336, 0.4],
		[404, 0.32],
		[484, 0.24],
		[576, 0.18],
		[680, 0.13]
	];

	const actions = $derived([
		{ label: 'card.call', href: `tel:+${card.phone}`, icon: Phone, external: false },
		{ label: 'card.whatsapp', href: `https://wa.me/${card.phone}`, icon: null, external: true },
		{ label: 'card.email', href: `mailto:${card.email}`, icon: Mail, external: false },
		{ label: 'card.location', href: COMPANY.mapsUrl, icon: MapPin, external: true }
	] as const);

	// Urutan mobile; di desktop jam operasional naik di atas kantor pusat (lihat `order`).
	const rows = $derived([
		{ label: 'card.phone', value: card.phoneDisplay, href: `tel:+${card.phone}`, icon: Phone, cls: '' },
		{ label: 'card.email', value: card.email, href: `mailto:${card.email}`, icon: Mail, cls: '' },
		{ label: 'card.web', value: COMPANY.website, href: `https://${COMPANY.website}`, icon: Globe, cls: '' },
		{
			label: 'card.hq',
			value: COMPANY.address,
			href: COMPANY.mapsUrl,
			icon: MapPin,
			cls: 'lg:order-5 lg:col-span-2'
		},
		{ label: 'card.hours', value: l('card.hours.value'), href: undefined, icon: Clock3, cls: 'lg:order-4' }
	] as const);

	const socials = [
		{ name: 'Instagram', icon: 'instagram', href: COMPANY.instagram.url },
		{ name: 'LinkedIn', icon: 'linkedin', href: COMPANY.linkedin },
		{ name: 'YouTube', icon: 'youtube', href: COMPANY.youtube }
	] as const;

	// Kartu desktop miring mengikuti kursor, dengan kilap yang ikut posisi kursor.
	const tilt: Attachment<HTMLElement> = (node) => {
		const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
		if (!fine || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const move = (e: PointerEvent) => {
			const r = node.getBoundingClientRect();
			const x = (e.clientX - r.left) / r.width;
			const y = (e.clientY - r.top) / r.height;
			node.style.setProperty('--rx', `${(0.5 - y) * 6}deg`);
			node.style.setProperty('--ry', `${(x - 0.5) * 8}deg`);
			node.style.setProperty('--gx', `${x * 100}%`);
			node.style.setProperty('--gy', `${y * 100}%`);
		};
		const leave = () => {
			node.style.setProperty('--rx', '0deg');
			node.style.setProperty('--ry', '0deg');
		};

		node.addEventListener('pointermove', move);
		node.addEventListener('pointerleave', leave);
		return () => {
			node.removeEventListener('pointermove', move);
			node.removeEventListener('pointerleave', leave);
		};
	};

	let copied = $state(false);

	async function share() {
		try {
			if (navigator.share) {
				await navigator.share({ title: name, text: `${name} — ${card.role[$locale]}`, url: location.href });
				return;
			}
			await navigator.clipboard.writeText(location.href);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// Pengguna menutup lembar bagikan, atau clipboard diblokir: tidak ada yang perlu dilakukan.
		}
	}
</script>

<svelte:head>
	<title>{interpolate(l('card.meta.title'), card, $locale)}</title>
	<meta name="description" content={interpolate(l('card.meta.desc'), card, $locale)} />
</svelte:head>

<!-- Tombol aksi cepat: v = 'm' (mobile, di luar kartu) | 'd' (desktop, di dalam kartu merah) -->
{#snippet quickActions(v: 'm' | 'd')}
	<div class="relative flex {v === 'm' ? 'px-1.5 py-1' : ''}">
		{#each actions as a}
			<a
				href={a.href}
				target={a.external ? '_blank' : undefined}
				rel={a.external ? 'noopener' : undefined}
				class="group flex flex-1 flex-col items-center gap-2"
			>
				<span
					class="flex size-14 items-center justify-center rounded-full border transition-transform group-hover:-translate-y-0.5 {v ===
					'm'
						? 'border-[#E7DFD2] bg-white text-[#C8102E]'
						: 'border-[#EBD49A]/40 bg-white/[0.12] text-white'}"
				>
					{#if a.icon}
						<a.icon class="size-[22px]" />
					{:else}
						<BrandIcon name="whatsapp" class="size-[22px]" />
					{/if}
				</span>
				<span class={v === 'm' ? 'text-[12.5px] text-[#5E554B]' : 'text-[13px] text-[#F8D7DC]'}>
					{l(a.label)}
				</span>
			</a>
		{/each}
	</div>
{/snippet}

<!-- Simpan kontak (.vcf) + bagikan tautan -->
{#snippet saveShare(v: 'm' | 'd')}
	<div class="relative flex gap-2.5">
		<a
			href="/kartu-nama/{card.slug}/vcard?lang={$locale.toLowerCase()}"
			data-sveltekit-reload
			class="font-heading flex flex-1 items-center justify-center gap-2.5 font-semibold transition hover:opacity-90 active:scale-[0.98] {v ===
			'm'
				? 'h-[52px] rounded-[14px] bg-[#C8102E] text-[15px] text-white'
				: 'h-14 rounded-2xl bg-white text-base text-[#C8102E]'}"
		>
			<UserPlus class={v === 'm' ? 'size-[19px]' : 'size-5'} />
			{l('card.save')}
		</a>
		<button
			type="button"
			onclick={share}
			aria-label={l('card.share')}
			class="flex shrink-0 items-center justify-center border border-[#C9A04A] bg-[#151212] text-[#E3C47A] transition-colors hover:bg-black {v ===
			'm'
				? 'size-[52px] rounded-[14px]'
				: 'size-14 rounded-2xl'}"
		>
			{#if copied}
				<Check class={v === 'm' ? 'size-[19px]' : 'size-5'} />
			{:else}
				<Share2 class={v === 'm' ? 'size-[19px]' : 'size-5'} />
			{/if}
		</button>
		<span class="sr-only" role="status">{copied ? l('card.copied') : ''}</span>
	</div>
{/snippet}

{#snippet socialLinks(v: 'm' | 'd')}
	<div class="relative flex gap-2">
		{#each socials as s}
			<a
				href={s.href}
				target="_blank"
				rel="noopener"
				class="flex flex-1 items-center justify-center gap-2 border text-[13.5px] transition-colors {v ===
				'm'
					? 'h-12 rounded-[14px] border-[#E7DFD2] bg-white text-[#1C1714] hover:border-[#C8102E]/40'
					: 'h-11 rounded-xl border-[#C9A04A]/35 bg-white/[0.06] text-[#F2EDE6] hover:bg-white/10'}"
			>
				<BrandIcon
					name={s.icon}
					class={v === 'm' ? 'size-[18px] text-[#C8102E]' : 'size-[17px] text-[#E3C47A]'}
				/>
				{s.name}
			</a>
		{/each}
	</div>
{/snippet}

<div class="kartu min-h-screen bg-[#F6F2EB] text-[#1C1714]">
	<header class="lg:border-b lg:border-[#E7DFD2]">
		<div
			class="mx-auto flex max-w-[480px] items-center justify-between px-5 pt-[18px] lg:h-[76px] lg:max-w-[1440px] lg:px-10 lg:pt-0 xl:px-16 min-[1440px]:px-[120px]"
		>
			<a href="/" class="hidden lg:block" aria-label="Beacon Engineering">
				<img src="/kartu-nama/logo.png" alt="Beacon Engineering" width="140" height="37" class="h-[37px] w-[140px]" />
			</a>
			<div class="flex w-full items-center justify-between lg:w-auto lg:gap-7">
				<div
					class="flex items-center gap-[7px] rounded-full bg-[#151212] px-2.5 py-[5px] lg:gap-2 lg:bg-transparent lg:p-0"
				>
					<span class="size-1.5 rounded-full bg-[#C8102E]"></span>
					<span
						class="font-mono text-[10px] tracking-[1.4px] whitespace-nowrap text-[#E3C47A] lg:text-[11px] lg:tracking-[1.5px] lg:text-[#776D61]"
						>{l('card.label')}</span
					>
				</div>
				<div
					role="group"
					aria-label={l('card.lang')}
					class="flex gap-0.5 rounded-full border border-[#E7DFD2] bg-white p-[3px]"
				>
					{#each ['ID', 'EN'] as const as code}
						<button
							type="button"
							onclick={() => locale.set(code as Locale)}
							aria-pressed={$locale === code}
							class="rounded-full px-[11px] py-[5px] font-mono text-[11px] transition-colors {$locale ===
							code
								? 'bg-[#151212] text-[#E3C47A]'
								: 'text-[#776D61] hover:text-[#1C1714]'}">{code}</button
						>
					{/each}
				</div>
				<a
					href="https://{COMPANY.website}"
					class="hidden items-center gap-1.5 text-[15px] font-medium text-[#1C1714] lg:flex"
				>
					{COMPANY.website}
					<ArrowUpRight class="size-4 text-[#C8102E]" />
				</a>
			</div>
		</div>
	</header>

	<main
		class="mx-auto max-w-[480px] px-4 pt-5 pb-8 lg:max-w-[1440px] lg:px-10 lg:pt-10 lg:pb-14 xl:px-16 min-[1440px]:px-[120px]"
	>
		<div class="flex flex-col gap-5 lg:grid lg:grid-cols-[440px_1fr] lg:items-start lg:gap-x-8 lg:gap-y-7">
			<!-- Mobile: kartu ringkas + aksi -->
			<div class="flex flex-col gap-5 lg:hidden">
				<section
					class="card-in overflow-hidden rounded-[20px] shadow-[0_16px_36px_rgba(139,10,31,0.25)]"
					style="background-image:{bgMobile}"
				>
					<div class="sheen relative flex min-h-[180px] flex-col justify-between overflow-hidden p-6 pb-4">
						<Hatch size={96} step={7} corner="br" />
						<div class="absolute top-6 right-6">
							<SignalPhoto
								src={card.photo}
								alt={name}
								size={80}
								border={3}
								dot={14}
								rings={ringsSm}
							/>
						</div>
						<img
							src="/kartu-nama/logo-white.png"
							alt="Beacon Engineering"
							width="132"
							height="35"
							class="relative h-[35px] w-[132px]"
						/>
						<div class="relative mt-6 flex flex-col gap-1">
							<h1 class="font-heading text-2xl font-bold tracking-[-0.4px] text-balance text-white">{name}</h1>
							<p class="text-sm text-[#F8D7DC]">{card.role[$locale]} · {COMPANY.name}</p>
						</div>
					</div>
					<div class="flex h-10 items-center gap-2 border-t border-[#C9A04A] bg-[#151212] px-6">
						<span class="h-0.5 w-3.5 bg-[#E0213F]"></span>
						<span class="font-mono text-[9.5px] tracking-[1.4px] text-[#E3C47A]"
							>{card.field[$locale]}</span
						>
					</div>
				</section>
				{@render quickActions('m')}
				{@render saveShare('m')}
			</div>

			<!-- Desktop: kartu profil -->
			<section
				{@attach tilt}
				class="card-in sheen tilt relative hidden overflow-hidden rounded-[28px] shadow-[0_24px_48px_rgba(139,10,31,0.25)] lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:block"
				style="background-image:{bgDesktop}"
			>
				<Hatch size={130} step={8} corner="tr" />
				<div class="relative flex flex-col gap-7 px-8 pt-8 pb-7">
					<img
						src="/kartu-nama/logo-white.png"
						alt="Beacon Engineering"
						width="132"
						height="35"
						class="h-[35px] w-[132px]"
					/>
					<div class="flex h-[326px] items-center justify-center">
						<SignalPhoto
							src={card.photo}
							alt={name}
							size={244}
							border={4}
							dot={22}
							rings={ringsLg}
						/>
					</div>
					<div class="relative flex flex-col items-center gap-1.5 text-center">
						<h1 class="font-heading text-[34px] font-bold tracking-[-0.6px] text-balance text-white">{name}</h1>
						<p class="text-[17px] text-[#F8D7DC]">{card.role[$locale]} · {COMPANY.name}</p>
						<div class="flex items-center gap-2.5 pt-2">
							<span class="h-0.5 w-4 bg-[#E3C47A]"></span>
							<span class="font-mono text-[10.5px] tracking-[1.5px] text-[#EBD49A]"
								>{card.field[$locale]}</span
							>
							<span class="h-0.5 w-4 bg-[#E3C47A]"></span>
						</div>
					</div>
					{@render saveShare('d')}
					{@render quickActions('d')}
				</div>
				<div class="relative border-t border-[#C9A04A] bg-[#151212] px-8 pt-5 pb-6">
					{@render socialLinks('d')}
				</div>
			</section>

			<!-- Desktop: pembuka -->
			<div class="hidden flex-col gap-3.5 pt-2 pb-1 lg:col-start-2 lg:flex">
				<p class="font-mono text-[11px] tracking-[1.6px] text-[#C8102E]">{l('card.eyebrow')}</p>
				<h2 class="font-heading text-[44px]/[51px] font-bold tracking-[-1.2px]">
					{l('card.title')}<br /><span class="text-[#C8102E]">{COMPANY.brand}.</span>
				</h2>
				<p class="max-w-[580px] text-[17px]/[26px] text-[#5E554B]">{l('card.subtitle')}</p>
			</div>

			<!-- Detail kontak: satu kolom di mobile, dua kolom di desktop (garis pemisah dari gap-px) -->
			<section
				class="grid gap-px overflow-hidden rounded-[18px] border border-[#E7DFD2] bg-[#E7DFD2] lg:col-start-2 lg:grid-cols-2 lg:rounded-[20px]"
			>
				{#each rows as r}
					<svelte:element
						this={r.href ? 'a' : 'div'}
						href={r.href}
						target={r.href?.startsWith('http') ? '_blank' : undefined}
						rel={r.href?.startsWith('http') ? 'noopener' : undefined}
						class="group flex items-center gap-3.5 bg-white p-[14px_16px] lg:gap-3 lg:p-4 xl:gap-4 xl:p-[20px_24px] {r.cls} {r.href
							? 'transition-colors hover:bg-[#FDFAF6]'
							: ''}"
					>
						<span
							class="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#FBE9EC] lg:size-10 lg:rounded-xl"
						>
							<r.icon class="size-[17px] text-[#C8102E] lg:size-[18px]" />
						</span>
						<span class="flex min-w-0 flex-1 flex-col gap-[3px] lg:gap-1">
							<span
								class="font-mono text-[9.5px] tracking-[1.2px] text-[#776D61] uppercase lg:text-[10px] lg:tracking-[1.3px]"
								>{l(r.label)}</span
							>
							<span class="text-[15px]/5 break-words lg:text-base/[22px]"
								>{r.value}</span
							>
						</span>
						{#if r.href}
							<ArrowUpRight
								class="size-4 shrink-0 text-[#C8102E] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 lg:hidden"
							/>
						{/if}
						{#if r.label === 'card.hq'}
							<span
								class="hidden shrink-0 items-center gap-1.5 rounded-full border border-[#E7DFD2] px-3.5 py-[9px] text-sm font-medium transition-colors group-hover:border-[#C8102E]/40 lg:flex"
							>
								{l('card.map')}
								<ArrowUpRight class="size-[15px] text-[#C8102E]" />
							</span>
						{/if}
					</svelte:element>
				{/each}
			</section>

			<div class="flex flex-col gap-5 lg:col-start-2 lg:gap-7 xl:grid xl:grid-cols-[1fr_300px] xl:items-start">
				<section class="flex flex-col gap-2.5 px-1 pt-3 lg:gap-3 lg:p-0 lg:pt-1.5">
					<p class="font-mono text-[10px] tracking-[1.6px] text-[#C8102E] lg:text-[11px]">
						{l('card.about.label')}
					</p>
					<h2
						class="font-heading text-[22px]/[28px] font-bold tracking-[-0.4px] lg:text-2xl/[30px] lg:tracking-[-0.5px]"
					>
						{l('card.about.title')}
					</h2>
					<p class="text-[15px]/[23px] text-[#5E554B] lg:text-[15.5px]/6">{l('card.about.desc')}</p>
					<ul class="flex flex-wrap gap-2 pt-1.5">
						{#each COMPANY.solutions as s}
							<li
								class="rounded-full border border-[#DCC48A] px-3 py-[7px] text-[13px] lg:px-[13px] lg:text-[13.5px]"
							>
								{s}
							</li>
						{/each}
					</ul>
				</section>

				<!-- Mobile: ikuti kami (di desktop sudah ada di kartu merah) -->
				<section class="flex flex-col gap-3 pt-2 lg:hidden">
					<div class="flex items-center justify-between px-1">
						<p class="font-mono text-[10px] tracking-[1.6px] text-[#C8102E]">{l('card.follow')}</p>
						<p class="font-mono text-[10.5px] text-[#776D61]">{COMPANY.instagram.handle}</p>
					</div>
					{@render socialLinks('m')}
				</section>

				<section
					class="relative overflow-hidden rounded-[20px] lg:max-w-[300px] lg:rounded-3xl"
					style="background-image:{bgQr}"
				>
					<span class="lg:hidden"><Hatch size={72} step={7} corner="tl" /></span>
					<span class="hidden lg:block"><Hatch size={60} step={7} corner="tl" /></span>
					<div class="relative flex justify-center px-6 pt-7 pb-[22px] lg:pb-5">
						<div
							class="flex size-[196px] items-center justify-center rounded-2xl border-[1.5px] border-[#E3C47A] bg-white lg:size-[176px]"
						>
							<img
								src="/kartu-nama/qr-{card.slug}.png"
								alt="QR {name}"
								width="164"
								height="164"
								class="size-[164px] lg:size-[148px]"
							/>
						</div>
					</div>
					<div
						class="relative flex flex-col items-center gap-1.5 border-t border-[#C9A04A] bg-[#151212] px-6 pt-[18px] pb-[22px] text-center lg:px-5 lg:pt-4 lg:pb-5"
					>
						<p class="font-heading text-[17px] font-semibold text-white lg:text-base">
							{l('card.qr.title')}
						</p>
						<p class="text-[13.5px]/5 text-[#CFC6BA] lg:text-[13px]/[19px]">
							{interpolate(l('card.qr.desc'), card, $locale)}
						</p>
					</div>
				</section>
			</div>
		</div>

		<!-- Footer mobile -->
		<footer class="flex flex-col items-center gap-2.5 pt-10 lg:hidden">
			<img src="/kartu-nama/logo.png" alt="Beacon Engineering" width="106" height="28" class="h-7 w-[106px]" />
			<p class="font-mono text-[10px] tracking-[0.4px] text-[#776D61]">
				© {new Date().getFullYear()}
				{COMPANY.name}
			</p>
		</footer>
	</main>

	<!-- Footer desktop -->
	<footer class="hidden border-t border-[#C9A04A] bg-[#151212] lg:block">
		<div
			class="mx-auto flex max-w-[1440px] items-center justify-between px-10 pt-[22px] pb-7 font-mono text-[11px] tracking-[0.4px] xl:px-16 min-[1440px]:px-[120px]"
		>
			<p class="text-[#CFC6BA]">© {new Date().getFullYear()} {COMPANY.name} · {COMPANY.brand}</p>
			<p class="text-[#E3C47A]">{COMPANY.address}</p>
		</div>
	</footer>
</div>

<style>
	/* Momen utama saat dimuat: kartu naik, lalu (di SignalPhoto/Hatch) beacon menyala,
	   lalu kilau emas menyapu kartu. Kilau mengulang tiap 9 detik. */
	.card-in {
		animation: card-in 1.1s cubic-bezier(0.22, 1, 0.36, 1) backwards;
	}

	.sheen::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: linear-gradient(
			112deg,
			transparent 38%,
			rgba(255, 232, 178, 0.26) 48%,
			rgba(255, 255, 255, 0.1) 52%,
			transparent 62%
		);
		translate: -100% 0;
		animation: sheen 9s cubic-bezier(0.45, 0, 0.25, 1) 1.5s infinite;
	}

	/* Pakai `transform`, sedangkan animasi masuk memakai `translate`/`scale`, jadi tidak bertabrakan. */
	.tilt {
		transform: perspective(1200px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
		transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.tilt::before {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: radial-gradient(
			480px circle at var(--gx, 50%) var(--gy, 30%),
			rgba(255, 236, 196, 0.2),
			transparent 60%
		);
		opacity: 0;
		transition: opacity 0.5s;
	}

	.tilt:hover::before {
		opacity: 1;
	}

	@keyframes card-in {
		from {
			opacity: 0;
			translate: 0 24px;
			scale: 0.97;
		}
	}

	@keyframes sheen {
		0% {
			translate: -100% 0;
		}
		16%,
		100% {
			translate: 100% 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.kartu :global(*),
		.kartu :global(*::before),
		.kartu :global(*::after) {
			animation: none !important;
			transition: none !important;
		}
	}
</style>
