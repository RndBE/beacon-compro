<script lang="ts">
	import {
		Bot,
		X,
		Send,
		Command,
		Sparkles,
		Loader,
		UserCheck,
		Building2,
		Phone,
		User,
		RotateCcw,
	} from "@lucide/svelte";
	import { PUBLIC_API_BASE } from "$env/static/public";
	import { locale } from "$lib/i18n";

	let isOpen = $state(false);
	let message = $state("");
	let isLoading = $state(false);
	let sessionToken = $state<string | null>(null);
	let chatMode = $state<"ai" | "escalated" | "live" | "closed">("ai");
	let lastMessageId = $state<number | null>(null);
	let pollInterval = $state<ReturnType<typeof setInterval> | null>(null);

	// Contact form state
	let showContactForm = $state(false);
	let formName = $state("");
	let formOrganization = $state("");
	let formPhone = $state("");
	let formErrors = $state<Record<string, string>>({});
	let formSubmitting = $state(false);

	interface ChatMessage {
		id?: number;
		role: "user" | "assistant";
		senderType?: "visitor" | "ai" | "agent";
		senderName?: string;
		content: string;
		timestamp: string;
	}

	function copy(id: string, en: string): string {
		return $locale === "EN" ? en : id;
	}

	function getCurrentTime(): string {
		return new Date().toLocaleTimeString("id-ID", {
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	function createWelcomeMessage(): ChatMessage {
		return {
			role: "assistant",
			senderType: "ai",
			content: copy(
				"Halo! Saya engineer virtual Beacon. Ada pertanyaan mengenai spesifikasi, instalasi, atau kalibrasi perangkat kami?",
				"Hello! I am Beacon's virtual engineer. Do you have questions about our device specifications, installation, or calibration?",
			),
			timestamp: getCurrentTime(),
		};
	}

	let messages = $state<ChatMessage[]>([createWelcomeMessage()]);
	let welcomeLocale = $state($locale);

	let chatAreaRef: HTMLDivElement;

	$effect(() => {
		const activeLocale = $locale;
		if (
			activeLocale !== welcomeLocale &&
			messages.length === 1 &&
			messages[0]?.senderType === "ai" &&
			!sessionToken
		) {
			welcomeLocale = activeLocale;
			messages = [createWelcomeMessage()];
		}
	});

	function toggleChat() {
		isOpen = !isOpen;
		if (isOpen && isLiveMode()) {
			startPolling();
		}
	}

	function scrollToBottom() {
		if (chatAreaRef) {
			requestAnimationFrame(() => {
				chatAreaRef.scrollTop = chatAreaRef.scrollHeight;
			});
		}
	}

	function isLiveMode(): boolean {
		return chatMode === "escalated" || chatMode === "live";
	}

	function startPolling() {
		if (pollInterval) return;
		pollInterval = setInterval(pollMessages, 3000);
	}

	function stopPolling() {
		if (pollInterval) {
			clearInterval(pollInterval);
			pollInterval = null;
		}
	}

	function resetChatSession() {
		stopPolling();
		sessionToken = null;
		chatMode = "ai";
		lastMessageId = null;
		message = "";
		isLoading = false;
		showContactForm = false;
		formName = "";
		formOrganization = "";
		formPhone = "";
		formErrors = {};
		formSubmitting = false;
		messages = [createWelcomeMessage()];
		scrollToBottom();
	}

	async function pollMessages() {
		if (!sessionToken || !isLiveMode()) {
			stopPolling();
			return;
		}

		try {
			const params = new URLSearchParams({ session_token: sessionToken });
			if (lastMessageId) params.set("after_id", String(lastMessageId));

			const res = await fetch(
				`${PUBLIC_API_BASE}/chatbot/poll?${params}`,
				{
					headers: { Accept: "application/json" },
				},
			);

			if (!res.ok) return;
			const data = await res.json();

			if (data.messages?.length) {
				for (const msg of data.messages) {
					const exists = messages.some((m) => m.id === msg.id);
					if (!exists) {
						messages = [
							...messages,
							{
								id: msg.id,
								role: "assistant",
								senderType: msg.sender_type,
								senderName: msg.sender_name,
								content: msg.content,
								timestamp: msg.created_at,
							},
						];
						lastMessageId = msg.id;
					}
				}
				scrollToBottom();
			}

			if (data.mode) {
				chatMode = data.mode;
			}

			if (chatMode === "closed") {
				showContactForm = false;
				stopPolling();
			}
		} catch {
			// Silently ignore poll errors
		}
	}

	async function sendMessage() {
		const text = message.trim();
		if (!text || isLoading) return;

		const userMsg: ChatMessage = {
			role: "user",
			senderType: "visitor",
			content: text,
			timestamp: getCurrentTime(),
		};
		messages = [...messages, userMsg];
		message = "";
		isLoading = true;
		scrollToBottom();

		try {
			const res = await fetch(`${PUBLIC_API_BASE}/chatbot`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					session_token: sessionToken,
					message: text,
				}),
			});

			const data = await res.json();

			if (res.ok) {
				if (data.session_token) {
					sessionToken = data.session_token;
				}

				if (data.reply) {
					const replyMessageId =
						typeof data.reply_message_id === "number"
							? data.reply_message_id
							: undefined;
					const assistantMsg: ChatMessage = {
						id: replyMessageId,
						role: "assistant",
						senderType: "ai",
						content: data.reply,
						timestamp: getCurrentTime(),
					};
					messages = [...messages, assistantMsg];
					if (replyMessageId) {
						lastMessageId = Math.max(
							lastMessageId ?? 0,
							replyMessageId,
						);
					}
				}

				// Show contact form if AI detects escalation intent
				if (data.needs_form) {
					showContactForm = true;
				}

				if (data.mode) {
					chatMode = data.mode;
				}

				if (isLiveMode()) {
					startPolling();
				}
			} else {
				const errorMsg: ChatMessage = {
					role: "assistant",
					senderType: "ai",
					content:
						data.error ||
						"Maaf, terjadi gangguan. Silakan coba lagi.",
					timestamp: getCurrentTime(),
				};
				messages = [...messages, errorMsg];
			}
		} catch {
			const errorMsg: ChatMessage = {
				role: "assistant",
				senderType: "ai",
				content: copy(
					"Koneksi terputus. Pastikan koneksi internet Anda stabil.",
					"Connection lost. Please make sure your internet connection is stable.",
				),
				timestamp: getCurrentTime(),
			};
			messages = [...messages, errorMsg];
		} finally {
			isLoading = false;
			scrollToBottom();
		}
	}

	function validateForm(): boolean {
		const errors: Record<string, string> = {};
		if (!formName.trim()) errors.name = copy("Nama wajib diisi", "Name is required");
		if (!formOrganization.trim())
			errors.organization = copy("Instansi wajib diisi", "Organization is required");
		if (!formPhone.trim()) errors.phone = copy("Nomor telepon wajib diisi", "Phone number is required");
		else if (formPhone.trim().length < 8)
			errors.phone = copy("Nomor telepon tidak valid", "Phone number is invalid");
		formErrors = errors;
		return Object.keys(errors).length === 0;
	}

	async function submitContactForm() {
		if (!validateForm() || formSubmitting) return;

		formSubmitting = true;

		try {
			const res = await fetch(`${PUBLIC_API_BASE}/chatbot/escalate`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					session_token: sessionToken,
					name: formName.trim(),
					organization: formOrganization.trim(),
					phone: formPhone.trim(),
				}),
			});

			const data = await res.json();

			if (res.ok) {
				showContactForm = false;

				if (data.session_token) sessionToken = data.session_token;
				if (data.mode) chatMode = data.mode;

				if (data.reply) {
					const replyMessageId =
						typeof data.reply_message_id === "number"
							? data.reply_message_id
							: undefined;
					const confirmMsg: ChatMessage = {
						id: replyMessageId,
						role: "assistant",
						senderType: "ai",
						content: data.reply,
						timestamp: getCurrentTime(),
					};
					messages = [...messages, confirmMsg];
					if (replyMessageId) {
						lastMessageId = Math.max(
							lastMessageId ?? 0,
							replyMessageId,
						);
					}
				}

				startPolling();
				scrollToBottom();
			} else {
				formErrors = {
					general: data.error || copy("Gagal mengirim data. Coba lagi.", "Failed to send data. Please try again."),
				};
			}
		} catch {
			formErrors = { general: copy("Koneksi terputus. Coba lagi.", "Connection lost. Please try again.") };
		} finally {
			formSubmitting = false;
		}
	}

	function handleSuggestion(q: string) {
		message = q;
		sendMessage();
	}

	const predefinedQuestions = $derived([
		copy("Apa saja produk Beacon untuk bendungan?", "What Beacon products are available for dams?"),
		copy("Bagaimana cara kerja sensor AWLR?", "How does the AWLR sensor work?"),
		copy("Saya ingin dihubungkan dengan sales", "I want to be connected with sales"),
	]);

	let showSuggestions = $derived(messages.length <= 1);

	function getModeLabel(): string {
		switch (chatMode) {
			case "escalated":
				return copy("Menghubungkan ke CS...", "Connecting to CS...");
			case "live":
				return copy("Terhubung ke CS", "Connected to CS");
			case "closed":
				return copy("Sesi berakhir", "Session ended");
			default:
				return isLoading ? copy("Mengetik...", "Typing...") : "Online";
		}
	}

	function getModeColor(): string {
		switch (chatMode) {
			case "escalated":
				return "bg-amber-500 animate-pulse";
			case "live":
				return "bg-emerald-500";
			case "closed":
				return "bg-zinc-500";
			default:
				return "bg-emerald-500 animate-pulse";
		}
	}
</script>

<!-- FAB -->
<div
	class="fixed bottom-[84px] lg:bottom-6 right-6 z-[999] flex max-w-[calc(100vw-3rem)] items-center gap-3"
>
	{#if !isOpen}
		<button
			type="button"
			class="group flex max-w-[180px] items-center gap-3 rounded-2xl border border-white/70 bg-white/95 px-3 py-3 text-left shadow-[0_18px_40px_-18px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C8102E]/30 hover:shadow-[0_20px_44px_-18px_rgba(200,16,46,0.35)] sm:max-w-[220px] sm:px-4"
			onclick={toggleChat}
			aria-label={copy("Buka chat otomatis Beacon", "Open Beacon automated chat")}
		>
			<span
				class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FBE9EC] text-[#C8102E] transition-transform duration-300 group-hover:scale-105"
			>
				<Sparkles size={15} />
			</span>
			<span class="min-w-0">
				<span
					class="block text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[#C8102E]"
					>{copy("Chat Otomatis", "Automated Chat")}</span
				>
				<span class="block truncate text-xs font-semibold text-zinc-700"
					>{copy("Tanya Beacon AI di sini", "Ask Beacon AI here")}</span
				>
			</span>
		</button>
	{/if}

	<button
		type="button"
		class="relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 hover:scale-105 active:scale-95 group shadow-2xl"
		style="
			background: {isOpen
			? '#18181B'
			: 'linear-gradient(135deg, #C8102E 0%, #910B20 100%)'};
			border: 1px solid {isOpen ? '#27272A' : '#E11D48'};
			box-shadow: {isOpen
			? 'none'
			: '0 10px 30px -10px rgba(200,16,46,0.6), inset 0 2px 4px rgba(255,255,255,0.2)'};
		"
		onclick={toggleChat}
		aria-label={isOpen ? copy("Tutup chat AI", "Close AI chat") : copy("Buka chat AI", "Open AI chat")}
		aria-expanded={isOpen}
	>
		{#if !isOpen}
			<div
				class="absolute inset-0 rounded-2xl bg-[#C8102E] opacity-50 animate-ping"
				style="animation-duration: 3s;"
			></div>
		{/if}
		<div
			class="absolute inset-0 flex items-center justify-center text-white transition-transform duration-300 {isOpen
				? 'rotate-90 scale-0 opacity-0'
				: 'rotate-0 scale-100 opacity-100'}"
		>
			<Bot size={24} />
		</div>
		<div
			class="absolute inset-0 flex items-center justify-center text-white transition-transform duration-300 {isOpen
				? 'rotate-0 scale-100 opacity-100'
				: '-rotate-90 scale-0 opacity-0'}"
		>
			<X size={24} />
		</div>
	</button>
</div>

<!-- Chatbot Window -->
<div
	class="fixed bottom-[150px] lg:bottom-24 right-6 z-[998] w-[380px] max-w-[calc(100vw-3rem)] rounded-[2rem] overflow-hidden origin-bottom-right transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] bg-zinc-950"
	style="
		opacity: {isOpen ? 1 : 0};
		transform: scale({isOpen ? 1 : 0.95}) translateY({isOpen ? 0 : 20}px);
		pointer-events: {isOpen ? 'auto' : 'none'};
		box-shadow: 0 40px 80px -20px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1);
		border: 1px solid rgba(255,255,255,0.08);
	"
>
	<div
		class="absolute top-0 right-0 w-64 h-64 bg-[#C8102E]/10 rounded-full blur-[80px] pointer-events-none"
	></div>

	<!-- Header -->
	<div
		class="relative z-10 p-5 border-b border-white/5 flex items-start justify-between bg-zinc-950/50 backdrop-blur-md"
	>
		<div class="flex items-center gap-3">
			<div
				class="relative w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-900 border border-white/10 shadow-inner"
			>
				{#if isLiveMode()}
					<UserCheck size={18} class="text-emerald-500" />
				{:else}
					<Sparkles size={18} class="text-[#C8102E]" />
				{/if}
				<div
					class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-zinc-950 flex items-center justify-center"
				>
					<div
						class="w-1.5 h-1.5 rounded-full {getModeColor()}"
					></div>
				</div>
			</div>
			<div>
				<h3 class="text-sm font-bold text-white tracking-tight">
					{isLiveMode() ? "Beacon CS" : "Beacon Assistant"}
				</h3>
				<span
					class="text-[10px] font-mono font-semibold uppercase tracking-widest {isLiveMode()
						? 'text-emerald-500'
						: 'text-zinc-500'}"
				>
					{getModeLabel()}
				</span>
			</div>
		</div>
	</div>

	<!-- Chat Area -->
	<div
		class="relative z-10 p-5 h-[360px] overflow-y-auto flex flex-col gap-4 bg-zinc-950/80 scroll-smooth"
		bind:this={chatAreaRef}
	>
		{#each messages as msg}
			{#if msg.role === "assistant"}
				<div class="flex flex-col gap-1 items-start max-w-[85%]">
					{#if msg.senderType === "agent"}
						<span
							class="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest pl-1 mb-0.5"
						>
							{msg.senderName || "CS Agent"}
						</span>
					{/if}
					<div
						class="p-3.5 rounded-2xl rounded-tl-sm border text-sm leading-relaxed shadow-sm whitespace-pre-wrap
						{msg.senderType === 'agent'
							? 'bg-emerald-950/50 border-emerald-800/30 text-emerald-200'
							: 'bg-zinc-900 border-white/5 text-zinc-300'}"
					>
						{msg.content}
					</div>
					<span class="text-[10px] font-mono text-zinc-600 pl-1"
						>{msg.timestamp}</span
					>
				</div>
			{:else}
				<div class="flex flex-col gap-1 items-end max-w-[85%] self-end">
					<div
						class="p-3.5 rounded-2xl rounded-tr-sm text-sm text-white leading-relaxed shadow-sm whitespace-pre-wrap"
						style="background: linear-gradient(135deg, #C8102E 0%, #910B20 100%);"
					>
						{msg.content}
					</div>
					<span class="text-[10px] font-mono text-zinc-600 pr-1"
						>{msg.timestamp}</span
					>
				</div>
			{/if}
		{/each}

		{#if isLoading}
			<div class="flex flex-col gap-1 items-start max-w-[85%]">
				<div
					class="p-3.5 rounded-2xl rounded-tl-sm bg-zinc-900 border border-white/5 shadow-sm flex items-center gap-2"
				>
					<Loader size={14} class="text-[#C8102E] animate-spin" />
					<span class="text-xs text-zinc-500 font-medium">
						{isLiveMode()
							? copy("Mengirim pesan...", "Sending message...")
							: copy("Beacon sedang mengetik...", "Beacon is typing...")}
					</span>
				</div>
			</div>
		{/if}

		<!-- Contact Form (inline in chat) -->
		{#if showContactForm}
			<div class="w-full">
				<div
					class="rounded-2xl border border-white/10 bg-zinc-900 p-4 space-y-3"
				>
					<div class="flex items-center gap-2 mb-1">
						<UserCheck size={14} class="text-[#C8102E]" />
						<span
							class="text-xs font-bold text-white uppercase tracking-wider"
							>{copy("Data Kontak", "Contact Details")}</span
						>
					</div>
					<p class="text-[11px] text-zinc-500 leading-relaxed">
						{copy(
							"Lengkapi data berikut agar tim kami bisa segera membantu Anda.",
							"Complete the details below so our team can help you quickly.",
						)}
					</p>

					{#if formErrors.general}
						<div
							class="px-3 py-2 rounded-lg bg-red-950/50 border border-red-800/30 text-xs text-red-400"
						>
							{formErrors.general}
						</div>
					{/if}

					<!-- Name -->
					<div class="space-y-1">
						<label
							class="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"
						>
							<User size={10} />
							{copy("Nama Lengkap", "Full Name")}
						</label>
						<input
							type="text"
							bind:value={formName}
							placeholder={copy("Masukkan nama Anda", "Enter your name")}
							aria-label={copy("Nama lengkap", "Full name")}
							class="w-full px-3 py-2 bg-zinc-800 border rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C8102E]/50 transition-colors
								{formErrors.name ? 'border-red-500/50' : 'border-white/10'}"
						/>
						{#if formErrors.name}
							<span class="text-[10px] text-red-400"
								>{formErrors.name}</span
							>
						{/if}
					</div>

					<!-- Organization -->
					<div class="space-y-1">
						<label
							class="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"
						>
							<Building2 size={10} />
							{copy("Instansi / Perusahaan", "Organization / Company")}
						</label>
						<input
							type="text"
							bind:value={formOrganization}
							placeholder="BBWS, Dinas SDA, PT..."
							aria-label={copy("Instansi atau perusahaan", "Organization or company")}
							class="w-full px-3 py-2 bg-zinc-800 border rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C8102E]/50 transition-colors
								{formErrors.organization ? 'border-red-500/50' : 'border-white/10'}"
						/>
						{#if formErrors.organization}
							<span class="text-[10px] text-red-400"
								>{formErrors.organization}</span
							>
						{/if}
					</div>

					<!-- Phone -->
					<div class="space-y-1">
						<label
							class="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"
						>
							<Phone size={10} />
							{copy("No. HP / WhatsApp", "Mobile / WhatsApp")}
						</label>
						<input
							type="tel"
							bind:value={formPhone}
							placeholder="0812-xxxx-xxxx"
							aria-label={copy("Nomor HP atau WhatsApp", "Mobile phone or WhatsApp number")}
							class="w-full px-3 py-2 bg-zinc-800 border rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C8102E]/50 transition-colors
								{formErrors.phone ? 'border-red-500/50' : 'border-white/10'}"
						/>
						{#if formErrors.phone}
							<span class="text-[10px] text-red-400"
								>{formErrors.phone}</span
							>
						{/if}
					</div>

					<!-- Submit -->
					<button
						type="button"
						onclick={submitContactForm}
						disabled={formSubmitting}
						class="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
						style="background: linear-gradient(135deg, #C8102E 0%, #910B20 100%);"
					>
						{#if formSubmitting}
							<span
								class="flex items-center justify-center gap-2"
							>
								<Loader size={14} class="animate-spin" />
								{copy("Menghubungkan...", "Connecting...")}
							</span>
						{:else}
							{copy("Hubungkan dengan CS", "Connect with CS")}
						{/if}
					</button>
				</div>
			</div>
		{/if}

		<!-- Escalation waiting -->
		{#if chatMode === "escalated" && !showContactForm}
			<div
				class="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-950/30 border border-amber-800/30"
			>
				<Loader size={14} class="text-amber-500 animate-spin" />
				<span class="text-xs text-amber-400 font-medium"
					>{copy("Menunggu CS tersedia...", "Waiting for CS availability...")}</span
				>
			</div>
		{/if}

		{#if showSuggestions}
			<div class="flex flex-col gap-2 mt-2">
				<span
					class="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest pl-1 mb-1"
					>{copy("Saran Topik", "Suggested Topics")}</span
				>
				{#each predefinedQuestions as q}
					<button
						type="button"
						class="text-left px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#C8102E]/30 text-xs font-medium text-zinc-400 hover:text-white transition-all duration-300 hover:translate-x-1 group"
						onclick={() => handleSuggestion(q)}
					>
						{q}
						<span
							class="float-right opacity-0 group-hover:opacity-100 text-[#C8102E] transition-opacity"
						>
							<Send size={12} />
						</span>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Input Area -->
	<div class="relative z-10 p-4 border-t border-white/5 bg-zinc-950">
		{#if chatMode === "closed"}
			<div class="flex flex-col items-center gap-3 py-2">
				<span class="text-xs text-zinc-500"
					>{copy("Sesi telah berakhir. Terima kasih!", "The session has ended. Thank you!")}</span
				>
				<button
					type="button"
					onclick={resetChatSession}
					class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 hover:border-[#C8102E]/40 text-xs font-semibold text-white transition-colors"
				>
					<RotateCcw size={13} />
					{copy("Mulai chat baru", "Start a new chat")}
				</button>
			</div>
		{:else if showContactForm}
			<div class="text-center py-2">
				<span class="text-xs text-zinc-500"
					>{copy("Lengkapi form di atas untuk terhubung dengan CS", "Complete the form above to connect with CS")}</span
				>
			</div>
		{:else}
			<form
				onsubmit={(e) => {
					e.preventDefault();
					sendMessage();
				}}
				class="relative group"
			>
				<div
					class="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-[#C8102E]/50 to-[#910B20]/50 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-[2px]"
				></div>
				<div
					class="relative flex items-center bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-inner"
				>
					<div class="pl-3 pr-2 py-3">
						<Command size={14} class="text-zinc-500" />
					</div>
					<input
						type="text"
						bind:value={message}
						placeholder={isLoading
							? copy("Menunggu...", "Waiting...")
							: isLiveMode()
								? copy("Ketik pesan ke CS...", "Type a message to CS...")
								: copy("Ketik pertanyaan...", "Type your question...")}
						disabled={isLoading}
						aria-label={copy("Pesan chat", "Chat message")}
						class="w-full bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none py-3 disabled:opacity-50"
					/>
					<button
						type="submit"
						disabled={!message.trim() || isLoading}
						class="p-2 mr-1 rounded-lg transition-colors {message.trim() &&
						!isLoading
							? 'bg-[#C8102E] text-white hover:bg-[#910B20]'
							: 'bg-transparent text-zinc-600'}"
						aria-label={copy("Kirim pesan chat", "Send chat message")}
					>
						<Send size={14} />
					</button>
				</div>
			</form>
		{/if}
		<div class="text-center mt-3">
			<span
				class="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-600"
				>Powered by Beacon AI</span
			>
		</div>
	</div>
</div>
