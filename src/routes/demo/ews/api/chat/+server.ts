import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import OpenAI from 'openai';
import type { RequestHandler } from './$types';

const SYSTEM = `Anda asisten STESY, pusat komando peringatan dini bencana (banjir, longsor, gempa) untuk wilayah DIY Yogyakarta. Jawab ringkas, dalam Bahasa Indonesia, berdasarkan status Siaga (Normal/Waspada/Siaga/Awas), pos pemantauan, diseminasi, dan evakuasi.`;

export const POST: RequestHandler = async ({ request }) => {
	const key = env.OPENAI_API_KEY;
	if (!key) throw error(503, 'AI nonaktif: OPENAI_API_KEY belum diset.');
	const { messages = [], context } = await request.json();
	const client = new OpenAI({ apiKey: key });
	const ctx = context ? `Konteks langsung: ${JSON.stringify(context)}` : '';
	const res = await client.chat.completions.create({
		model: env.OPENAI_MODEL || 'gpt-4o-mini',
		messages: [
			{ role: 'system', content: SYSTEM + '\n' + ctx },
			...messages
		]
	});
	return json({ reply: res.choices[0]?.message?.content ?? '' });
};
