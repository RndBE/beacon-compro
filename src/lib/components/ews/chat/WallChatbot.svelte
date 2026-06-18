<script lang="ts">
	import { tick } from 'svelte';
	import Bot from '@lucide/svelte/icons/bot';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import MessageSquareText from '@lucide/svelte/icons/message-square-text';
	import SendHorizontal from '@lucide/svelte/icons/send-horizontal';
	import X from '@lucide/svelte/icons/x';
	import { activeAlerts, overallStatus } from '$lib/ews/stores';
	import { SIAGA_COLOR, siagaLabel } from '$lib/ews/status';
	import { sendChat } from './chatClient';

	const NONAKTIF_MSG = 'Asisten AI sedang nonaktif pada demo ini.';

	interface ChatMessage {
		id: string;
		role: 'user' | 'assistant';
		content: string;
		at: number;
	}

	let open = $state(false);
	let draft = $state('');
	let loading = $state(false);
	let chatError = $state('');
	let messageList: HTMLDivElement | null = $state(null);
	let messages = $state<ChatMessage[]>([
		{
			id: 'welcome',
			role: 'assistant',
			content: 'Siap membantu membaca kondisi operasi STESY Command Center.',
			at: Date.now()
		}
	]);

	const chatContext = $derived({
		alerts: $activeAlerts.length,
		status: $overallStatus,
		topAlerts: $activeAlerts.slice(0, 6).map((item) => item.pesan)
	});

	function messageId(): string {
		return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
	}

	function scrollToEnd(): void {
		tick().then(() => {
			messageList?.scrollTo({ top: messageList.scrollHeight, behavior: 'smooth' });
		});
	}

	function historyFrom(items: ChatMessage[]): { role: 'user' | 'assistant'; content: string }[] {
		return items.slice(-12).map((item) => ({ role: item.role, content: item.content }));
	}

	function isNonaktif(reply: string): boolean {
		return reply === NONAKTIF_MSG;
	}

	async function sendMessage(text = draft): Promise<void> {
		const content = text.trim();
		if (!content || loading) return;

		const nextMessages: ChatMessage[] = [
			...messages,
			{ id: messageId(), role: 'user' as const, content, at: Date.now() }
		];
		messages = nextMessages;
		draft = '';
		chatError = '';
		loading = true;
		open = true;
		scrollToEnd();

		try {
			const reply = await sendChat(historyFrom(nextMessages), chatContext);
			messages = [
				...messages,
				{ id: messageId(), role: 'assistant', content: reply, at: Date.now() }
			];
		} catch (err) {
			chatError = err instanceof Error ? err.message : 'Chat AI tidak dapat dihubungi.';
		} finally {
			loading = false;
			scrollToEnd();
		}
	}

	function onSubmit(event: SubmitEvent): void {
		event.preventDefault();
		sendMessage();
	}

	function onDraftKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}
</script>

<div class="pointer-events-none absolute inset-0 z-[670]">
	<div class="pointer-events-auto absolute bottom-[148px] left-1/2 -translate-x-1/2">
		{#if open}
			<section
				class="flex h-[min(520px,calc(100vh-190px))] w-[min(440px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl"
				style="background:rgba(10,14,22,0.88);border:1px solid rgba(74,144,196,0.28);backdrop-filter:blur(20px);box-shadow:0 24px 70px -24px rgba(0,0,0,0.65);"
			>
				<header
					class="flex items-center gap-3 px-3.5 py-3"
					style="border-bottom:1px solid rgba(74,144,196,0.2);"
				>
					<div
						class="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-accent/35 bg-accent/15 text-accent-bright"
					>
						<Bot size={18} strokeWidth={1.9} />
					</div>
					<div class="min-w-0 flex-1">
						<div class="text-[13px] font-semibold text-ink-strong">GPT Operator</div>
						<div class="mt-0.5 flex items-center gap-2 text-[10.5px] text-ink-dim">
							<span
								class="h-1.5 w-1.5 rounded-full"
								style="background:{SIAGA_COLOR[$overallStatus]}"
							></span>
							<span>{siagaLabel($overallStatus)}</span>
							<span>·</span>
							<span>{$activeAlerts.length} peringatan</span>
						</div>
					</div>
					<button
						onclick={() => (open = false)}
						title="Tutup chat"
						class="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink-muted transition-colors hover:bg-white/[0.06] hover:text-ink-strong"
					>
						<X size={16} />
					</button>
				</header>

				<div
					bind:this={messageList}
					class="min-h-0 flex-1 space-y-2 overflow-y-auto px-3.5 py-3"
				>
					{#each messages as message (message.id)}
						<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
							<div
								class="max-w-[82%] rounded-xl border px-3 py-2 text-[12.5px] leading-relaxed {message.role ===
								'user'
									? 'border-accent/35 bg-accent/15 text-ink-strong'
									: isNonaktif(message.content)
										? 'border-waspada/30 bg-waspada/10 text-ink-muted italic'
										: 'border-line/70 bg-white/[0.035] text-ink'}"
							>
								{message.content}
							</div>
						</div>
					{/each}

					{#if loading}
						<div class="flex justify-start">
							<div
								class="inline-flex items-center gap-2 rounded-xl border border-line/70 bg-white/[0.035] px-3 py-2 text-[12px] text-ink-muted"
							>
								<LoaderCircle size={14} class="animate-spin" />
								Memproses
							</div>
						</div>
					{/if}
				</div>

				{#if chatError}
					<div
						class="border-t border-awas/25 bg-awas/10 px-3.5 py-2 text-[11.5px] text-awas"
					>
						{chatError}
					</div>
				{/if}

				<form
					onsubmit={onSubmit}
					class="p-3"
					style="border-top:1px solid rgba(74,144,196,0.2);"
				>
					<div class="flex items-end gap-2">
						<textarea
							bind:value={draft}
							onkeydown={onDraftKeydown}
							rows={2}
							placeholder="Tanya kondisi operasi..."
							class="min-h-11 flex-1 resize-none rounded-xl border border-line bg-black/25 px-3 py-2 text-[12.5px] leading-relaxed text-ink-strong outline-none transition-colors placeholder:text-ink-dim focus:border-accent/60"
						></textarea>
						<button
							type="submit"
							disabled={!draft.trim() || loading}
							title="Kirim pesan"
							class="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent/45 bg-accent/15 text-accent-bright transition-colors hover:bg-accent/25 disabled:cursor-not-allowed disabled:border-line disabled:bg-white/[0.03] disabled:text-ink-dim"
						>
							<SendHorizontal size={18} />
						</button>
					</div>
				</form>
			</section>
		{:else}
			<button
				onclick={() => (open = true)}
				title="Buka chat GPT"
				class="grid h-12 w-12 place-items-center rounded-xl border border-accent/35 text-accent-bright transition-colors hover:bg-accent/15"
				style="background:rgba(10,14,22,0.82);backdrop-filter:blur(16px);"
			>
				<MessageSquareText size={20} strokeWidth={1.9} />
			</button>
		{/if}
	</div>
</div>
