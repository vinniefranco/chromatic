<script>
	export let modes;
	export let onChangeMode;
	export let selectedMode;

	import { processForm } from "./core/web";

	const nonTheoreticalKeys = [
		"A",
		"Ab",
		"B",
		"Bb",
		"C",
		"C#",
		"D",
		"D#",
		"Db",
		"E",
		"Eb",
		"F",
		"F#",
		"G",
		"Gb"
	]


	function clearMode() {
		selectedMode = false;
	}

	function changeMode(e) {
		processForm(e.target, (payload) => {
			onChangeMode(payload);
			selectedMode = false;
		});
	}
</script>

{#if selectedMode}
	Rocking <a on:click={clearMode}>{selectedMode[0]} {selectedMode[1]}</a>
{:else}
	<form on:submit|preventDefault={changeMode}>
		<select name="key">
			{#each nonTheoreticalKeys as key}
				<option value={key}>
					{key}
				</option>
			{/each}
		</select>
		<select name="mode">
			{#each modes as mode}
				<option value={mode}>
					{mode}
				</option>
			{/each}
		</select>
		<button>Set</button>
	</form>
{/if}
