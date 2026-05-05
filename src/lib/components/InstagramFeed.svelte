<script lang="ts">
	import { ArrowUpRight, Camera, ImageOff, RefreshCw } from '@lucide/svelte';
	import { onMount } from 'svelte';

	type InstagramPost = {
		id: string;
		caption: string;
		mediaType: string;
		mediaUrl: string;
		thumbnailUrl: string;
		permalink: string;
		timestamp: string;
	};

	let posts = $state<InstagramPost[]>([]);
	let loading = $state(true);
	let configured = $state(true);
	let error = $state('');

	const instagramProfile = 'https://instagram.com/beacon_engineering';

	function summarizeCaption(caption: string) {
		const firstLine = caption.trim().split('\n').find(Boolean);
		return firstLine || 'Aktivitas lapangan Beacon Engineering';
	}

	function formatDate(timestamp: string) {
		if (!timestamp) return 'Instagram';

		const date = new Date(timestamp);

		if (Number.isNaN(date.getTime())) return 'Instagram';

		return new Intl.DateTimeFormat('id-ID', {
			day: '2-digit',
			month: 'short'
		}).format(date);
	}

	async function loadPosts() {
		loading = true;
		error = '';

		try {
			const response = await fetch('/api/instagram-posts');

			if (!response.ok) {
				throw new Error(`Instagram feed failed: ${response.status}`);
			}

			const data = (await response.json()) as {
				configured?: boolean;
				posts?: InstagramPost[];
			};

			configured = data.configured ?? true;
			posts = data.posts ?? [];
		} catch (err) {
			console.error(err);
			error = 'Feed Instagram belum bisa dimuat.';
			posts = [];
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadPosts();
	});
</script>

<section class="mt-16 lg:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
	<div class="lg:col-span-4 border-t border-white/10 pt-6 flex flex-col justify-between gap-8">
		<div class="space-y-4">
			<div class="flex items-center gap-3">
				<div class="h-[1px] w-8 bg-[#C8102E]"></div>
				<span class="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Instagram</span>
			</div>

			<div class="space-y-3">
				<h3 class="font-heading text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-white">
					Cuplikan terbaru dari lapangan.
				</h3>
				<p class="max-w-[36ch] text-sm font-medium leading-relaxed text-zinc-500">
					Dokumentasi instalasi, inspeksi perangkat, dan aktivitas tim Beacon Engineering di berbagai titik telemetri.
				</p>
			</div>
		</div>

		<a
			href={instagramProfile}
			target="_blank"
			rel="noopener"
			class="btn-tactile group inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-widest text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
		>
			Lihat Profil
			<ArrowUpRight size={14} class="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
		</a>
	</div>

	<div class="lg:col-span-8">
		{#if loading}
			<div class="grid grid-cols-2 sm:grid-cols-4 auto-rows-[8.5rem] sm:auto-rows-[9.5rem] gap-3">
				{#each Array(4) as _, i}
					<div
						class={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
						style={`animation-delay: ${i * 90}ms;`}
					>
						<div class="absolute inset-0 animate-shimmer opacity-20"></div>
						<div class="absolute left-4 top-4 h-2 w-16 rounded-full bg-white/10"></div>
						<div class="absolute bottom-4 left-4 h-2 w-3/5 rounded-full bg-white/10"></div>
					</div>
				{/each}
			</div>
		{:else if error}
			<div class="min-h-[18rem] rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
				<div class="flex items-start gap-4">
					<div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
						<ImageOff size={18} class="text-zinc-300" />
					</div>
					<div class="space-y-2">
						<h4 class="text-base font-bold text-white">Instagram belum tersambung</h4>
						<p class="max-w-[46ch] text-sm leading-relaxed text-zinc-500">
							{error} Tampilan ini sudah siap membaca post dari endpoint Meta ketika kredensial aktif.
						</p>
					</div>
				</div>
				<button
					type="button"
					class="btn-tactile inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-widest text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
					onclick={loadPosts}
				>
					<RefreshCw size={14} />
					Coba Lagi
				</button>
			</div>
		{:else if !configured}
			<div class="min-h-[18rem] rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 flex items-center">
				<div class="max-w-[48ch] space-y-4">
					<div class="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
						<Camera size={18} class="text-zinc-300" />
					</div>
					<div class="space-y-2">
						<h4 class="text-base font-bold text-white">Feed Instagram siap dipasang</h4>
						<p class="text-sm leading-relaxed text-zinc-500">
							Setelah kredensial Meta Graph API diisi, post terbaru akan otomatis tampil di grid footer ini.
						</p>
					</div>
				</div>
			</div>
		{:else if posts.length === 0}
			<div class="min-h-[18rem] rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 flex items-center">
				<div class="max-w-[42ch] space-y-4">
					<div class="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
						<ImageOff size={18} class="text-zinc-300" />
					</div>
					<div class="space-y-2">
						<h4 class="text-base font-bold text-white">Belum ada post yang terbaca</h4>
						<p class="text-sm leading-relaxed text-zinc-500">
							Endpoint Meta aktif, tetapi belum mengirim media yang bisa ditampilkan di footer.
						</p>
					</div>
				</div>
			</div>
		{:else}
			<div class="grid grid-cols-2 sm:grid-cols-4 auto-rows-[8.5rem] sm:auto-rows-[9.5rem] gap-3">
				{#each posts.slice(0, 4) as post, i (post.id)}
					<a
						href={post.permalink}
						target="_blank"
						rel="noopener"
						class={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
						style={`animation-delay: ${i * 90}ms;`}
						aria-label={`Buka post Instagram: ${summarizeCaption(post.caption)}`}
					>
						{#if post.thumbnailUrl || post.mediaUrl}
							<img
								src={post.thumbnailUrl || post.mediaUrl}
								alt={summarizeCaption(post.caption)}
								loading="lazy"
								class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
							/>
						{:else}
							<div class="absolute inset-0 flex items-center justify-center bg-zinc-900">
								<Camera size={22} class="text-zinc-500" />
							</div>
						{/if}

						<div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/25 to-transparent opacity-75 transition-opacity group-hover:opacity-90"></div>
						<div class="absolute left-3 top-3 rounded-full border border-white/15 bg-zinc-950/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-200 backdrop-blur-md">
							{post.mediaType === 'VIDEO' ? 'Video' : formatDate(post.timestamp)}
						</div>
						<div class="absolute bottom-0 left-0 right-0 p-4">
							<p class={`${i === 0 ? 'text-sm' : 'text-xs'} font-semibold leading-snug text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden`}>
								{summarizeCaption(post.caption)}
							</p>
						</div>
						<div class="absolute right-3 top-3 flex h-8 w-8 translate-x-2 items-center justify-center rounded-full border border-white/15 bg-zinc-950/50 text-white opacity-0 backdrop-blur-md transition-all group-hover:translate-x-0 group-hover:opacity-100">
							<ArrowUpRight size={14} />
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</section>
