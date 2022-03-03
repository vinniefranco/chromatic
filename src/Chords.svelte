<script>
	export let scale;
	import { querystring } from "svelte-spa-router";

	function update() {
		console.log($querystring);
	}

	$: $querystring && update();

</script>
