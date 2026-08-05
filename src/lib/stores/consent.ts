import { writable } from 'svelte/store';

export type ConsentChoice = 'unset' | 'granted' | 'denied';

const STORAGE_KEY = 'cookie-consent';

function readStored(): ConsentChoice {
	if (typeof localStorage === 'undefined') return 'unset';
	const v = localStorage.getItem(STORAGE_KEY);
	return v === 'granted' || v === 'denied' ? v : 'unset';
}

/** Analytics consent choice, persisted to localStorage. 'unset' until the visitor decides. */
export const analyticsConsent = writable<ConsentChoice>('unset');

/** True only while the banner needs to be shown (no decision made yet this device). */
export const cookieBannerVisible = writable(false);

export function initConsent() {
	analyticsConsent.set(readStored());
}

function persist(choice: 'granted' | 'denied') {
	analyticsConsent.set(choice);
	cookieBannerVisible.set(false);
	try {
		localStorage.setItem(STORAGE_KEY, choice);
	} catch {
		// storage unavailable (private mode, quota) — choice still applies for this load
	}
}

export function grantConsent() {
	persist('granted');
}

export function denyConsent() {
	persist('denied');
}
