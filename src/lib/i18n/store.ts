import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Locale = 'ID' | 'EN';

const stored = browser ? (localStorage.getItem('locale') as Locale) || 'ID' : 'ID';

export const locale = writable<Locale>(stored);

locale.subscribe((val) => {
	if (browser) {
		localStorage.setItem('locale', val);
		document.documentElement.lang = val === 'EN' ? 'en' : 'id';
	}
});
