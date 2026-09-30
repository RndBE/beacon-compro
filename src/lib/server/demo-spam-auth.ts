// Real sign-in for /demo/spam. Unlike the other demos it shows a client's live field
// data, so the password is checked: DEMO_SPAM_PASSWORD lives in private env. The session
// cookie is an HMAC over its expiry, keyed with that password and the API secret, so
// changing either one signs everybody out. Web Crypto only: the repo has no Node types.

import type { Cookies } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

export const SPAM_COOKIE = 'demo_spam_session';
const SESSION_S = 8 * 3600;
const enc = new TextEncoder();

async function hmac(key: string, msg: string) {
	const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
	const sig = new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(msg)));
	return btoa(String.fromCharCode(...sig))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

/** constant-time compare of equal-length strings (the length itself is not secret) */
function same(a: string, b: string) {
	if (a.length !== b.length) return false;
	let d = 0;
	for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return d === 0;
}

const key = () => `${env.DEMO_SPAM_PASSWORD ?? ''}:${env.MINI_STESY_PASS ?? ''}`;
const sign = (exp: number) => hmac(key(), `demo-spam:${exp}`);

export const loginReady = () => Boolean(env.DEMO_SPAM_PASSWORD);

export async function passwordOk(input: string) {
	if (!loginReady()) return false;
	// hash both sides first so the comparison does not leak the password length
	const [a, b] = await Promise.all([hmac('eq', input), hmac('eq', env.DEMO_SPAM_PASSWORD!)]);
	return same(a, b);
}

export async function startSession(cookies: Cookies) {
	const exp = Math.floor(Date.now() / 1000) + SESSION_S;
	cookies.set(SPAM_COOKIE, `${exp}.${await sign(exp)}`, { path: '/demo/spam', httpOnly: true, sameSite: 'lax', secure: !dev, maxAge: SESSION_S });
}

export function endSession(cookies: Cookies) {
	cookies.delete(SPAM_COOKIE, { path: '/demo/spam' });
}

export async function hasSession(cookies: Cookies): Promise<boolean> {
	if (!loginReady()) return false;
	const [exp, sig] = (cookies.get(SPAM_COOKIE) ?? '').split('.');
	const n = Number(exp);
	if (!Number.isFinite(n) || n <= Date.now() / 1000 || !sig) return false;
	return same(sig, await sign(n));
}

/* ---- failed sign-ins per client, to slow down guessing ---- */
const MAX_FAILS = 8;
const WINDOW_MS = 15 * 60_000;
const fails = new Map<string, { n: number; until: number }>();

export const tooManyAttempts = (client: string) => {
	const f = fails.get(client);
	return Boolean(f && f.until > Date.now() && f.n >= MAX_FAILS);
};

export function noteFailure(client: string) {
	const now = Date.now();
	if (fails.size > 1000) for (const [k, f] of fails) if (f.until < now) fails.delete(k);
	const f = fails.get(client);
	fails.set(client, f && f.until > now ? { n: f.n + 1, until: f.until } : { n: 1, until: now + WINDOW_MS });
}
