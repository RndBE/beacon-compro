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
		if (res.status === 503) return 'Asisten AI sedang nonaktif pada demo ini.';
		throw new Error('chat gagal');
	}
	const data = await res.json();
	return data.reply as string;
}
