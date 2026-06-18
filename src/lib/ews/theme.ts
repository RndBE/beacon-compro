import { writable } from 'svelte/store';
export const theme = writable<'dark' | 'light'>('dark');
export function toggleTheme() {
	theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
}
