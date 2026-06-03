<script lang="ts">
	import logoBeacon from '$lib/assets/logo_be.png';
</script>

<svelte:head>
	<title>Masuk · Beacon Command Center</title>
</svelte:head>

<div class="demo-login">
	<form class="demo-login__card" method="POST">
		<div class="demo-login__brand">
			<img src={logoBeacon} alt="Beacon" />
			<span>Command Center</span>
		</div>
		<p class="demo-login__sub">Executive Dashboard · Infrastruktur Air Nasional</p>

		<div class="demo-login__field">
			<label for="email">Email</label>
			<input id="email" name="email" type="email" value="operator@beacon.id" autocomplete="username" />
		</div>
		<div class="demo-login__field">
			<label for="password">Password</label>
			<input
				id="password"
				name="password"
				type="password"
				value="demo1234"
				autocomplete="current-password"
			/>
		</div>

		<button class="demo-login__btn" type="submit">Masuk</button>
		<p class="demo-login__hint">Demo — masuk dengan kredensial apa pun</p>
	</form>
</div>
