<script lang="ts">
	let { children } = $props();
</script>

<div class="demo-app">
	<aside class="demo-side">
		<div class="demo-side__brand"><span>Command Center</span></div>
		<form class="demo-side__logout" method="POST" action="/demo/logout">
			<button type="submit">Keluar</button>
		</form>
	</aside>
	<div class="demo-app__main">
		<div class="demo-app__content">
			{@render children()}
		</div>
	</div>
</div>
