<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthed } from '$lib/ews/auth';
	import { get } from 'svelte/store';

	onMount(() => {
		goto(get(isAuthed) ? '/demo/ews/ringkasan' : '/demo/ews/login', { replaceState: true });
	});
</script>
