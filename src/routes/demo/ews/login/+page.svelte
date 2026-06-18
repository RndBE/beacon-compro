<script lang="ts">
	import { goto } from '$app/navigation';
	import { login } from '$lib/ews/auth';

	let user = $state('');
	let pass = $state('');

	function submit(e: Event) {
		e.preventDefault();
		login();
		goto('/demo/ews/ringkasan');
	}
</script>

<form onsubmit={submit} class="mx-auto mt-40 flex max-w-sm flex-col gap-3 p-6">
	<h1 class="text-xl font-semibold">STESY — Login</h1>
	<input bind:value={user} placeholder="Operator" class="rounded bg-white/10 p-2" />
	<input bind:value={pass} type="password" placeholder="Sandi" class="rounded bg-white/10 p-2" />
	<button type="submit" class="rounded bg-[#C8A878] p-2 font-medium text-[#1C1C41]">Masuk</button>
</form>
