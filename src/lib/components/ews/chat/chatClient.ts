export const NONAKTIF_MSG = 'Asisten AI sedang nonaktif pada demo ini.';

export async function sendChat(
	messages: { role: 'user' | 'assistant'; content: string }[],
	context?: unknown
): Promise<string> {
	const res = await fetch('/demo/ews/api/chat', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ messages, context })
	});
	if (!res.ok) {
		if (res.status === 503) return NONAKTIF_MSG;
		throw new Error('chat gagal');
	}
	const data = await res.json();
	return data.reply as string;
}
