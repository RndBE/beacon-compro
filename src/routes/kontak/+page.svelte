<script lang="ts">
	import {
		Phone,
		Mail,
		MessageCircle,
		MapPin,
		Clock,
		Send,
		Building2,
		Users,
		ShieldCheck,
		CheckCircle2,
		ArrowRight,
	} from "@lucide/svelte";

	let formData = $state({
		name: "",
		email: "",
		phone: "",
		company: "",
		subject: "",
		message: "",
	});

	const partnershipWhatsAppUrl =
		"https://wa.me/628112850986?text=Halo%20Beacon%2C%20saya%20ingin%20berdiskusi%20tentang%20kemitraan%20dengan%20Beacon%20Engineering.";

	const partnershipModels = [
		{
			icon: Building2,
			title: "Integrator & EPC",
			desc: "Kolaborasi proyek hidrologi, bendungan, irigasi, dan infrastruktur monitoring yang membutuhkan perangkat lapangan serta dashboard.",
		},
		{
			icon: Users,
			title: "Channel Partner Regional",
			desc: "Kemitraan penjualan, instalasi, dan dukungan teknis untuk memperluas layanan Beacon di wilayah prioritas.",
		},
		{
			icon: ShieldCheck,
			title: "Riset & Implementasi Lapangan",
			desc: "Kerja sama validasi sensor, pengembangan data, pilot project, dan integrasi sistem dengan institusi teknis.",
		},
	];

	const partnershipReadiness = [
		"Profil perusahaan atau institusi",
		"Wilayah operasi dan jaringan proyek",
		"Skema kolaborasi yang ingin dibangun",
	];

	function handleSubmit(e: Event) {
		e.preventDefault();
		const msg = `Halo Beacon,%0A%0ANama: ${formData.name}%0AEmail: ${formData.email}%0ATelepon: ${formData.phone}%0APerusahaan: ${formData.company}%0ASubjek: ${formData.subject}%0APesan: ${formData.message}`;
		window.open(`https://wa.me/628112850986?text=${msg}`, "_blank");
	}
</script>

<svelte:head>
	<title>Kontak — Beacon Engineering</title>
	<meta
		name="description"
		content="Hubungi tim engineer Beacon Engineering untuk konsultasi gratis tentang solusi telemetri dan monitoring infrastruktur."
	/>
</svelte:head>

<!-- Hero — SKILL: Split Screen, DESIGN_VARIANCE: 8, MOTION_INTENSITY: 6 -->
<section
	class="relative pt-24 pb-0 lg:pt-32 bg-[#FAFAFA] border-b border-[#E5E5E5] overflow-hidden"
>
	<!-- Subtle Dot Grid -->
	<div
		class="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
		style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 24px 24px;"
	></div>
	<!-- Decorative circle top-left -->
	<div
		class="absolute -top-24 -left-24 w-80 h-80 rounded-full pointer-events-none opacity-[0.06]"
		style="border: 2px solid #C8102E;"
	></div>
	<!-- Red glow behind illustration -->
	<div
		class="absolute top-1/2 right-0 -translate-y-1/2 w-[55%] h-full pointer-events-none opacity-[0.035] rounded-full"
		style="background: radial-gradient(ellipse at center, #C8102E 0%, transparent 70%);"
	></div>

	<div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- SKILL Rule 3: Split-screen — text left, illustration right -->
		<div
			class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center"
		>
			<!-- Left: Text -->
			<div
				class="flex flex-col justify-center pb-16 lg:pb-24 lg:pr-12 xl:pr-16"
			>
				<span
					class="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-6 w-fit"
					style="background: rgba(200,16,46,0.06); color: #C8102E; border: 1px solid rgba(200,16,46,0.12);"
				>
					<Phone size={12} class="mr-2" />
					Kontak
				</span>

				<h1
					class="font-heading text-4xl md:text-5xl lg:text-[52px] xl:text-[60px] font-extrabold tracking-tighter leading-[1.06] mb-6"
					style="color: #1A1A1A;"
				>
					Bicara Langsung dengan <br />
					<span style="color: #C8102E;">Engineer Kami.</span>
				</h1>

				<p
					class="text-base md:text-lg text-gray-600 leading-relaxed max-w-[52ch] mb-4"
				>
					Konsultasi pertama selalu gratis. Kami akan bantu memetakan
					kebutuhan monitoring Anda.
				</p>
				<p
					class="text-base md:text-lg font-semibold"
					style="color: #C8102E;"
				>
					Menyarankan konfigurasi, dan memberikan estimasi.
				</p>

				<!-- Stat strip -->
				<div
					class="flex items-center gap-8 mt-10 pt-8 border-t border-[#E5E5E5]"
				>
					<div>
						<p
							class="font-heading text-2xl font-extrabold tabular-nums"
							style="color: #1A1A1A; letter-spacing: -0.03em;"
						>
							24/7
						</p>
						<p
							class="text-xs font-medium mt-0.5"
							style="color: #7A7A7A;"
						>
							Customer Support
						</p>
					</div>
					<div class="w-px h-8 bg-[#E5E5E5]"></div>
					<div>
						<p
							class="font-heading text-2xl font-extrabold tabular-nums"
							style="color: #1A1A1A; letter-spacing: -0.03em;"
						>
							08:00
						</p>
						<p
							class="text-xs font-medium mt-0.5"
							style="color: #7A7A7A;"
						>
							Jam Buka (WIB)
						</p>
					</div>
					<div class="w-px h-8 bg-[#E5E5E5]"></div>
					<div>
						<p
							class="font-heading text-2xl font-extrabold tabular-nums"
							style="color: #1A1A1A; letter-spacing: -0.03em;"
						>
							HQ
						</p>
						<p
							class="text-xs font-medium mt-0.5"
							style="color: #7A7A7A;"
						>
							Yogyakarta
						</p>
					</div>
				</div>
			</div>

			<!-- Right: Illustration — float animation -->
			<div
				class="relative flex items-center justify-center lg:justify-end -mt-8 lg:-mt-16"
			>
				<!-- Faint dashed ring -->
				<div
					class="absolute inset-0 flex items-center justify-center pointer-events-none"
				>
					<div
						class="w-[85%] h-[85%] rounded-full opacity-[0.07]"
						style="border: 1.5px dashed #C8102E;"
					></div>
				</div>
				<!-- Illustration -->
				<div
					class="ws-hero-float w-full max-w-[700px] lg:max-w-none lg:w-[145%] xl:w-[160%] lg:translate-x-12"
				>
					<img
						src="/ilustrasi_kontak.webp"
						alt="Ilustrasi kontak Beacon Engineering"
						class="w-full h-auto object-contain select-none"
						draggable="false"
					/>
				</div>

				<!-- Corner label -->
			</div>
		</div>
	</div>
</section>

<!-- Contact Section — SKILL: Asymmetric 5/7 grid -->
<section class="py-20 lg:py-28 bg-white">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid lg:grid-cols-12 gap-12">
			<!-- Left: Contact Info — 5 cols -->
			<div class="lg:col-span-5 space-y-8">
				<div>
					<h2
						class="font-heading text-2xl font-bold mb-6"
						style="color: #1A1A1A;"
					>
						Informasi Kontak
					</h2>

					<div class="space-y-5">
						{#each [{ icon: MapPin, label: "Alamat", value: "Kadirojo I, Purwomartani, Kalasan, Sleman, DIY 55571" }, { icon: Phone, label: "Telepon", value: "(0274) 4986899", href: "tel:02744986899" }, { icon: Mail, label: "Email", value: "info@bejogja.com", href: "mailto:info@bejogja.com" }, { icon: Clock, label: "Jam Operasional", value: "Senin – Jumat, 08:00 – 17:00 WIB" }] as item}
							{@const ContactIcon = item.icon}
							<div class="flex items-start gap-4">
								<div
									class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
									style="background: #FBE9EC;"
								>
									<ContactIcon
										size={18}
										style="color: #C8102E;"
									/>
								</div>
								<div>
									<span
										class="text-sm font-semibold block"
										style="color: #1A1A1A;"
										>{item.label}</span
									>
									{#if item.href}
										<a
											href={item.href}
											class="text-sm hover:text-[#C8102E] transition-colors"
											style="color: #5C5C5C;"
											>{item.value}</a
										>
									{:else}
										<span
											class="text-sm"
											style="color: #5C5C5C;"
											>{item.value}</span
										>
									{/if}
								</div>
							</div>
						{/each}

						<!-- WhatsApp numbers -->
						<div class="flex items-start gap-4">
							<div
								class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
								style="background: #FBE9EC;"
							>
								<MessageCircle
									size={18}
									style="color: #C8102E;"
								/>
							</div>
							<div>
								<span
									class="text-sm font-semibold block"
									style="color: #1A1A1A;">WhatsApp</span
								>
								<a
									href="https://wa.me/628112850986"
									class="text-sm hover:text-[#C8102E] transition-colors block"
									style="color: #5C5C5C;">0811-2850-9986</a
								>
								<a
									href="https://wa.me/628112632151"
									class="text-sm hover:text-[#C8102E] transition-colors block"
									style="color: #5C5C5C;">+62 811 2632 151</a
								>
							</div>
						</div>
					</div>
				</div>

				<!-- Quick CTA — SKILL: btn-tactile -->
				<a
					href="https://wa.me/628112850986?text=Halo%20Beacon%2C%20saya%20ingin%20konsultasi%20tentang%20solusi%20telemetri."
					target="_blank"
					rel="noopener"
					class="group flex items-center gap-4 p-5 rounded-[20px] btn-tactile"
					style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 8px 24px rgba(200,16,46,0.2);"
				>
					<div
						class="w-12 h-12 rounded-xl flex items-center justify-center"
						style="background: rgba(255,255,255,0.15);"
					>
						<MessageCircle size={20} class="text-white" />
					</div>
					<div>
						<span class="text-sm font-semibold block text-white"
							>Langsung Chat WhatsApp</span
						>
						<span
							class="text-xs"
							style="color: rgba(255,255,255,0.6);"
							>Respons cepat di jam kerja</span
						>
					</div>
					<ArrowRight
						size={16}
						class="text-white/50 group-hover:translate-x-1 transition-transform ml-auto"
					/>
				</a>
			</div>

			<!-- Right: Form — 7 cols -->
			<div class="lg:col-span-7">
				<div
					class="p-8 lg:p-10 rounded-[24px]"
					style="background: #FAFAFA; border: 1px solid #E5E5E5; box-shadow: 0 4px 16px rgba(0,0,0,0.03);"
				>
					<h3
						class="font-heading text-xl font-bold mb-6"
						style="color: #1A1A1A;"
					>
						Kirim Permintaan Konsultasi
					</h3>

					<form onsubmit={handleSubmit} class="space-y-5">
						<div class="grid sm:grid-cols-2 gap-4">
							<div>
								<label
									for="name"
									class="block text-sm font-medium mb-1.5"
									style="color: #1A1A1A;"
									>Nama Lengkap *</label
								>
								<input
									id="name"
									type="text"
									required
									bind:value={formData.name}
									class="w-full px-4 py-3 rounded-[14px] text-sm outline-none focus:ring-2 focus:ring-[#C8102E]/20 transition-all"
									style="background: white; border: 1px solid #E5E5E5; color: #1A1A1A;"
									placeholder="Nama Anda"
								/>
							</div>
							<div>
								<label
									for="email"
									class="block text-sm font-medium mb-1.5"
									style="color: #1A1A1A;">Email *</label
								>
								<input
									id="email"
									type="email"
									required
									bind:value={formData.email}
									class="w-full px-4 py-3 rounded-[14px] text-sm outline-none focus:ring-2 focus:ring-[#C8102E]/20 transition-all"
									style="background: white; border: 1px solid #E5E5E5; color: #1A1A1A;"
									placeholder="email@perusahaan.com"
								/>
							</div>
						</div>

						<div class="grid sm:grid-cols-2 gap-4">
							<div>
								<label
									for="phone"
									class="block text-sm font-medium mb-1.5"
									style="color: #1A1A1A;"
									>Telepon / WhatsApp</label
								>
								<input
									id="phone"
									type="tel"
									bind:value={formData.phone}
									class="w-full px-4 py-3 rounded-[14px] text-sm outline-none focus:ring-2 focus:ring-[#C8102E]/20 transition-all"
									style="background: white; border: 1px solid #E5E5E5; color: #1A1A1A;"
									placeholder="081xxxxxxxxx"
								/>
							</div>
							<div>
								<label
									for="company"
									class="block text-sm font-medium mb-1.5"
									style="color: #1A1A1A;"
									>Perusahaan / Instansi</label
								>
								<input
									id="company"
									type="text"
									bind:value={formData.company}
									class="w-full px-4 py-3 rounded-[14px] text-sm outline-none focus:ring-2 focus:ring-[#C8102E]/20 transition-all"
									style="background: white; border: 1px solid #E5E5E5; color: #1A1A1A;"
									placeholder="BBWS / BUMN / Swasta"
								/>
							</div>
						</div>

						<div>
							<label
								for="subject"
								class="block text-sm font-medium mb-1.5"
								style="color: #1A1A1A;">Subjek *</label
							>
							<select
								id="subject"
								required
								bind:value={formData.subject}
								class="w-full px-4 py-3 rounded-[14px] text-sm outline-none focus:ring-2 focus:ring-[#C8102E]/20 transition-all"
								style="background: white; border: 1px solid #E5E5E5; color: #1A1A1A;"
							>
								<option value="">Pilih subjek...</option>
								<option value="AWLR">Konsultasi AWLR</option>
								<option value="EWS">Konsultasi EWS</option>
								<option value="ADR">Konsultasi ADR</option>
								<option value="STESY">Demo STESY</option>
								<option value="Kemitraan"
									>Kemitraan / Partnership</option
								>
								<option value="Water Security"
									>Water Security</option
								>
								<option value="Weather Forecast"
									>Weather Forecast</option
								>
								<option value="Pressure"
									>Pressure Measurement</option
								>
								<option value="Lainnya">Lainnya</option>
							</select>
						</div>

						<div>
							<label
								for="message"
								class="block text-sm font-medium mb-1.5"
								style="color: #1A1A1A;">Pesan *</label
							>
							<textarea
								id="message"
								required
								bind:value={formData.message}
								rows="4"
								class="w-full px-4 py-3 rounded-[14px] text-sm outline-none focus:ring-2 focus:ring-[#C8102E]/20 transition-all resize-none"
								style="background: white; border: 1px solid #E5E5E5; color: #1A1A1A;"
								placeholder="Ceritakan kebutuhan monitoring Anda..."
							></textarea>
						</div>

						<button
							type="submit"
							class="btn-tactile inline-flex items-center gap-2 px-7 py-3.5 rounded-[14px] text-sm font-semibold text-white"
							style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 4px 12px rgba(200,16,46,0.25);"
						>
							<Send size={16} />
							Kirim Permintaan Konsultasi
						</button>

						<p class="text-xs" style="color: #9A9A9A;">
							* Form ini akan mengarahkan Anda ke WhatsApp untuk
							komunikasi lebih cepat.
						</p>
					</form>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Partnership Section — SKILL: Asymmetric Open Partnership CTA -->
<section
	id="kemitraan"
	class="relative py-20 lg:py-28 bg-[#FAFAFA] border-y border-[#E5E5E5] overflow-hidden"
>
	<div
		class="absolute inset-0 opacity-[0.035] pointer-events-none"
		style="background-image: linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px); background-size: 40px 40px;"
	></div>
	<div
		class="absolute -right-28 top-16 w-[420px] h-[420px] rounded-full pointer-events-none opacity-[0.06]"
		style="border: 1px solid #C8102E;"
	></div>

	<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
			<div class="lg:col-span-5">
				<span
					class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-5"
					style="background: rgba(200,16,46,0.06); color: #C8102E; border: 1px solid rgba(200,16,46,0.12);"
				>
					<Building2 size={12} class="mr-2" />
					Open Partnership
				</span>

				<h2
					class="font-heading text-3xl md:text-4xl lg:text-[44px] font-extrabold leading-[1.08] mb-5"
					style="color: #1A1A1A;"
				>
					Kemitraan untuk proyek monitoring yang siap masuk lapangan.
				</h2>

				<p
					class="text-base leading-relaxed mb-8 max-w-[55ch]"
					style="color: #5C5C5C;"
				>
					Beacon membuka kerja sama dengan integrator, kontraktor,
					konsultan, distributor regional, dan institusi teknis yang
					ingin membawa solusi telemetri ke proyek strategis.
				</p>

				<div class="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 mb-8">
					{#each partnershipReadiness as item}
						<div
							class="flex items-center gap-3 rounded-[14px] px-4 py-3 bg-white"
							style="border: 1px solid #E5E5E5;"
						>
							<CheckCircle2
								size={16}
								class="shrink-0 text-[#1B7F3A]"
							/>
							<span class="text-sm font-medium" style="color: #1A1A1A;"
								>{item}</span
							>
						</div>
					{/each}
				</div>

				<div class="flex flex-col sm:flex-row gap-3">
					<a
						href={partnershipWhatsAppUrl}
						target="_blank"
						rel="noopener"
						class="btn-tactile inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[14px] text-sm font-semibold text-white"
						style="background: linear-gradient(135deg, #C8102E, #A50D25); box-shadow: 0 8px 20px rgba(200,16,46,0.18);"
					>
						<MessageCircle size={16} />
						Ajukan Kemitraan
					</a>
					<a
						href="mailto:info@bejogja.com?subject=Pengajuan%20Kemitraan%20Beacon%20Engineering"
						class="btn-tactile inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[14px] text-sm font-semibold bg-white"
						style="color: #1A1A1A; border: 1px solid #E5E5E5;"
					>
						<Mail size={16} />
						Kirim Profil
					</a>
				</div>
			</div>

			<div class="lg:col-span-7">
				<div
					class="relative bg-white rounded-[24px] overflow-hidden"
					style="border: 1px solid #E5E5E5; box-shadow: 0 24px 48px -28px rgba(26,26,26,0.18);"
				>
					<div class="grid md:grid-cols-7">
						<div class="md:col-span-4 p-6 sm:p-8 lg:p-10">
							<p
								class="font-mono text-[11px] font-bold uppercase tracking-[0.18em] mb-5"
								style="color: #C8102E;"
							>
								Model Kolaborasi
							</p>

							<div class="space-y-6">
								{#each partnershipModels as model}
									{@const ModelIcon = model.icon}
									<div class="group flex gap-4">
										<div
											class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
											style="background: #FBE9EC; border: 1px solid rgba(200,16,46,0.12);"
										>
											<ModelIcon
												size={18}
												style="color: #C8102E;"
											/>
										</div>
										<div class="pb-6 border-b border-[#E5E5E5] last:border-b-0 last:pb-0">
											<h3
												class="font-heading text-lg font-bold mb-2"
												style="color: #1A1A1A;"
											>
												{model.title}
											</h3>
											<p
												class="text-sm leading-relaxed"
												style="color: #5C5C5C;"
											>
												{model.desc}
											</p>
										</div>
									</div>
								{/each}
							</div>
						</div>

						<div
							class="md:col-span-3 p-6 sm:p-8 lg:p-10 bg-[#1A1A1A] text-white"
						>
							<p
								class="font-mono text-[11px] font-bold uppercase tracking-[0.18em] mb-6"
								style="color: rgba(255,255,255,0.55);"
							>
								Alur Awal
							</p>

							<div class="space-y-7">
								<div>
									<span class="font-mono text-xs text-white/40">01</span>
									<h4 class="font-heading text-base font-bold mt-2 mb-1">
										Screening kecocokan
									</h4>
									<p class="text-sm leading-relaxed text-white/60">
										Tim kami meninjau area, portofolio, dan kebutuhan
										kolaborasi.
									</p>
								</div>

								<div class="h-px bg-white/10"></div>

								<div>
									<span class="font-mono text-xs text-white/40">02</span>
									<h4 class="font-heading text-base font-bold mt-2 mb-1">
										Mapping teknis
									</h4>
									<p class="text-sm leading-relaxed text-white/60">
										Kita petakan perangkat, dashboard, instalasi, dan
										dukungan pascaproyek.
									</p>
								</div>

								<div class="h-px bg-white/10"></div>

								<div>
									<span class="font-mono text-xs text-white/40">03</span>
									<h4 class="font-heading text-base font-bold mt-2 mb-1">
										Pilot atau tender support
									</h4>
									<p class="text-sm leading-relaxed text-white/60">
										Lanjut ke demo, dokumen teknis, atau pendampingan
										penawaran proyek.
									</p>
								</div>
							</div>

							<a
								href={partnershipWhatsAppUrl}
								target="_blank"
								rel="noopener"
								class="group mt-9 inline-flex items-center gap-2 text-sm font-semibold text-white"
							>
								Mulai diskusi
								<ArrowRight
									size={15}
									class="group-hover:translate-x-1 transition-transform"
								/>
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Map — SKILL: Premium Liquid Glass Overlay & Monospace Coordinates -->
<section class="relative bg-[#FAFAFA] py-20 lg:py-28">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Section Header -->
		<div class="text-center mb-12 sm:mb-16">
			<span
				class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
				style="background: rgba(200,16,46,0.06); color: #C8102E; border: 1px solid rgba(200,16,46,0.12);"
			>
				<span class="w-1.5 h-1.5 rounded-full bg-[#C8102E] mr-2"></span>
				Headquarters
			</span>
			<h2
				class="font-heading text-3xl md:text-4xl font-extrabold mb-4"
				style="letter-spacing: -0.02em; color: #1A1A1A;"
			>
				Kunjungi Fasilitas <span style="color: #C8102E;">Kami</span>
			</h2>
			<p
				class="text-sm sm:text-base max-w-[55ch] mx-auto leading-relaxed"
				style="color: #5C5C5C;"
			>
				Pusat riset, perakitan, dan pengujian kalibrasi seluruh
				perangkat telemetri Beacon Engineering berada di Yogyakarta.
			</p>
		</div>

		<div
			class="relative w-full h-[500px] sm:h-[600px] rounded-[2.5rem] overflow-hidden group"
			style="border: 1px solid #E5E5E5; box-shadow: 0 30px 60px -15px rgba(0,0,0,0.05);"
		>
			<!-- Map Iframe with Premium Grayscale Filter -->
			<iframe
				src="https://maps.google.com/maps?q=-7.7741691,110.4498592+(PT.+Arta+Teknologi+Comunindo)&t=&z=17&ie=UTF8&iwloc=&output=embed"
				class="absolute inset-0 w-full h-full transition-all duration-700"
				style="border: 0; filter: grayscale(100%) contrast(1.1) opacity(0.85);"
				allowfullscreen
				loading="lazy"
				referrerpolicy="no-referrer-when-downgrade"
				title="Lokasi Beacon Engineering"
			></iframe>

			<!-- Gradient Overlay to blend map edges -->
			<div
				class="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_rgba(250,250,250,0.8)]"
			></div>

			<!-- Technical Overlay Panel (Bento / Cockpit Style) -->
			<div
				class="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 p-6 rounded-[1.5rem] bg-white/80 backdrop-blur-2xl max-w-[320px] w-full transition-transform duration-500 hover:-translate-y-2 cursor-default pointer-events-auto"
				style="border: 1px solid rgba(255,255,255,1); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.8);"
			>
				<div class="flex items-center gap-4 mb-5">
					<div
						class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
						style="background: rgba(200,16,46,0.08); border: 1px solid rgba(200,16,46,0.15);"
					>
						<MapPin size={20} style="color: #C8102E;" />
					</div>
					<div>
						<span
							class="block text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
							style="color: #C8102E;">HQ Location</span
						>
						<span
							class="block text-base font-extrabold text-zinc-950 font-heading"
							>Beacon Engineering</span
						>
					</div>
				</div>

				<div
					class="space-y-3 pt-5"
					style="border-top: 1px dashed rgba(200,16,46,0.2);"
				>
					<div class="flex justify-between items-center">
						<span class="text-xs font-semibold text-zinc-500"
							>Status Fasilitas</span
						>
						<span
							class="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md"
							style="background: rgba(34,197,94,0.1); color: #16A34A;"
						>
							<span
								class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot"
							></span>
							Active
						</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-xs font-semibold text-zinc-500"
							>Koordinat</span
						>
						<span
							class="text-xs font-mono font-bold text-zinc-950 bg-zinc-100 px-2 py-1 rounded-md"
							>7.7741°S 110.4498°E</span
						>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-xs font-semibold text-zinc-500"
							>Elevasi (AMSL)</span
						>
						<span
							class="text-xs font-mono font-bold text-zinc-950 bg-zinc-100 px-2 py-1 rounded-md"
							>~ 150m</span
						>
					</div>
				</div>

				<a
					href="https://www.google.com/maps/place/PT.+Arta+Teknologi+Comunindo+(Beacon+Engineering)/@-7.7741691,110.4498592,17z/data=!3m1!4b1!4m6!3m5!1s0x2e7a5a4b345e07f3:0x512d4db928ceedd!8m2!3d-7.7741691!4d110.4498592!16s%2Fg%2F1pzpp1qd0?entry=ttu"
					target="_blank"
					rel="noopener"
					class="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all btn-tactile group"
					style="background: white; border: 1px solid #E5E5E5; color: #1A1A1A; box-shadow: 0 4px 12px rgba(0,0,0,0.03);"
				>
					Buka di Google Maps
					<ArrowRight
						size={14}
						class="text-zinc-400 group-hover:text-[#C8102E] group-hover:translate-x-1 transition-all"
					/>
				</a>
			</div>
		</div>
	</div>
</section>

<style>
	/* SKILL MOTION_INTENSITY: 6 — Hero illustration gentle float */
	.ws-hero-float {
		animation: wsFloat 6s ease-in-out infinite;
		will-change: transform;
	}

	@keyframes wsFloat {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-12px);
		}
	}

	@media (max-width: 1023px) {
		.ws-hero-float {
			transform: none !important;
		}
		@keyframes wsFloat {
			0%,
			100% {
				transform: translateY(0px);
			}
			50% {
				transform: translateY(-10px);
			}
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ws-hero-float {
			animation: none !important;
		}
	}
</style>
