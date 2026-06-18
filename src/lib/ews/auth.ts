import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const KEY = 'stesy-demo-auth';
const initial = browser && sessionStorage.getItem(KEY) === '1';

export const isAuthed = writable<boolean>(initial);

export function login(): void {
	if (browser) sessionStorage.setItem(KEY, '1');
	isAuthed.set(true);
}

export function logout(): void {
	if (browser) sessionStorage.removeItem(KEY);
	isAuthed.set(false);
}
