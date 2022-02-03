<script>
	import routes from "./routes";
	import Router from "svelte-spa-router";
</script>

<main>
	<Router {routes} />
</main>

<style lang="postcss" global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #BD92D2;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (max-width: 600px) {
		main {
			max-width: none;
			margin: 0 1em;
		}
	}

	@media (min-width: 800px) {
		h1 {
			font-size: 2.4rem;
		}
		main {
			max-width: none;
			margin: 0 2em;
		}
	}

	@media (min-width: 1024px) {
		main {
			max-width: 1024px;
			margin: 0 auto;
		}
	}
</style>
