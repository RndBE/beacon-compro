import { writable } from 'svelte/store';

/**
 * Global open/close state for the floating AI chatbot (Chatbot.svelte).
 * Any CTA across the site can open the chat by calling `openChat()`.
 */
export const chatOpen = writable(false);

export function openChat() {
	chatOpen.set(true);
}

export function closeChat() {
	chatOpen.set(false);
}

export function toggleChat() {
	chatOpen.update((v) => !v);
}
