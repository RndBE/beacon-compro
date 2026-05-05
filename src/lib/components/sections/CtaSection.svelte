<script lang="ts">
	import { onMount } from 'svelte';
	import { MessageCircle, Mail, MapPin, Clock, ArrowRight } from '@lucide/svelte';

	let visible = $state(false);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => { if (entries[0].isIntersecting) visible = true; },
			{ threshold: 0.2 }
		);
		const el = document.getElementById('cta-final');
		if (el) observer.observe(el);
		return () => observer.disconnect();
	});
</script>

<!-- SKILL: Premium CTA with deep materiality, liquid glass borders, and perpetual shimmer -->
<section id="cta-final" class="relative py-24 lg:py-32 overflow-hidden bg-zinc-950">
	<!-- Deep Mesh Glows -->
	<div class="absolute top-0 left-[20%] w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 blur-[100px]" style="background: radial-gradient(circle, #C8102E, transparent 70%);"></div>
	<div class="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full pointer-events-none opacity-10 blur-[80px]" style="background: radial-gradient(circle, #C8102E, transparent 70%);"></div>

	<!-- Premium Noise Texture (multiply to blend with deep dark bg) -->
	<div class="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

	<!-- Decorative grid lines (Subtle) -->
	<div class="absolute inset-0 pointer-events-none opacity-[0.03]" style="background-image: linear-gradient(to right, #FFFFFF 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF 1px, transparent 1px); background-size: 64px 64px;"></div>

	<div class="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
		<!-- Asymmetric grid: copy left (7 cols), actions right (5 cols) -->
		<div class="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
			<!-- Left: Copy -->
			<div
				class="lg:col-span-7 relative"
				style="
					opacity: {visible ? 1 : 0};
					transform: translateX({visible ? 0 : -40}px);
					transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
				"
			>
				<!-- Premium Red Accent Badge -->
				<div class="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-8 relative overflow-hidden" style="background: rgba(200,16,46,0.1); border: 1px solid rgba(200,16,46,0.2);">
					<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer pointer-events-none"></div>
					<span class="w-2 h-2 rounded-full" style="background: #C8102E; box-shadow: 0 0 10px rgba(200,16,46,0.8);"></span>
					<span class="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-white">Mulai Sekarang</span>
				</div>

				<h2 class="font-heading text-4xl sm:text-5xl lg:text-[60px] font-extrabold text-white leading-[1.05] tracking-tighter mb-6">
					Punya Bendungan, Sungai, atau <span class="text-transparent bg-clip-text" style="background-image: linear-gradient(135deg, #FF5F56 0%, #C8102E 50%, #8A0B1F 100%);">Stasiun Cuaca</span> yang Perlu Dipantau?
				</h2>
				<p class="text-lg sm:text-xl font-medium max-w-[50ch] mb-12 leading-relaxed text-zinc-400">
					Bicara langsung dengan engineer kami. Konsultasi pertama selalu gratis — kami akan bantu memetakan kebutuhan, menyarankan konfigurasi, dan memberikan estimasi.
				</p>

				<!-- Office info (Bento Mono Style) -->
				<div class="flex flex-col sm:flex-row gap-6">
					<div class="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3.5 rounded-2xl backdrop-blur-md">
						<MapPin size={16} style="color: #C8102E;" />
						<span class="text-xs font-mono font-semibold tracking-wide text-zinc-300">Kadirojo I, Kalasan, Sleman, DIY</span>
					</div>
					<div class="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3.5 rounded-2xl backdrop-blur-md">
						<Clock size={16} style="color: #C8102E;" />
						<span class="text-xs font-mono font-semibold tracking-wide text-zinc-300">Senin–Jumat, 08:00–17:00 WIB</span>
					</div>
				</div>
			</div>

			<!-- Right: Action cards -->
			<div
				class="lg:col-span-5 flex flex-col gap-5 relative"
				style="
					opacity: {visible ? 1 : 0};
					transform: translateX({visible ? 0 : 40}px);
					transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s;
				"
			>
				<!-- WhatsApp CTA — primary (Perpetual Shimmer & Liquid Glass) -->
				<a
					href="https://wa.me/628112850986?text=Halo%20Beacon%2C%20saya%20tertarik%20dengan%20solusi%20telemetri%20Anda."
					target="_blank" rel="noopener"
					class="group relative flex items-center gap-6 p-7 rounded-[2rem] overflow-hidden transition-all duration-500 active:scale-95"
					style="background: #C8102E; box-shadow: 0 20px 40px -10px rgba(200,16,46,0.3);"
				>
					<!-- Perpetual Shimmer Effect -->
					<div class="absolute inset-0 pointer-events-none translate-x-[-100%] group-hover:animate-shimmer" style="background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent); background-size: 200% 100%;"></div>
					<!-- Liquid Glass Inner Border -->
					<div class="absolute inset-0 rounded-[2rem] border border-white/30 pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]"></div>

					<div class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 shadow-sm" style="background: rgba(255,255,255,0.2); backdrop-filter: blur(8px);">
						<MessageCircle size={26} class="text-white" />
					</div>
					<div class="flex-1 relative z-10">
						<span class="block text-xl font-bold text-white tracking-tight">Chat WhatsApp</span>
						<span class="block text-xs font-medium mt-1 text-white/70">Respons dalam waktu kurang dari 1 jam</span>
					</div>
					<ArrowRight size={22} class="text-white relative z-10 group-hover:translate-x-2 transition-transform duration-500" />
				</a>

				<!-- Email CTA — secondary (Deep Glassmorphism) -->
				<a
					href="mailto:info@bejogja.com"
					class="group relative flex items-center gap-6 p-7 rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-1 active:scale-95 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
					style="backdrop-filter: blur(12px);"
				>
					<div class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110" style="background: rgba(200,16,46,0.15);">
						<Mail size={24} style="color: #E8384F;" />
					</div>
					<div class="flex-1">
						<span class="block text-xl font-bold text-white tracking-tight">Kirim Email</span>
						<span class="block text-xs font-medium mt-1 text-zinc-400">info@bejogja.com</span>
					</div>
					<ArrowRight size={20} class="text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-500" />
				</a>
			</div>
		</div>
	</div>
</section>
