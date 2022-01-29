<script>
	import compute from "./core/compute";
	import { AVAILABLE_NOTES, AVAILABLE_MODES, processForm } from "./core/utils";

	let fretModes = [
		"fret",
		"scale",
	];

	let selectedFretMode = "fret";

	let selectedScale;
	let selectedMode;
	let modifyingTuning = false;

	let config = compute(["E", "A", "D", "G", "B", "E"], "fret");
	function shouldModifyTuning() {
		modifyingTuning = true;
	}

	function clearMode() {
		selectedMode = false;
	}

	function changeMode(e) {
		processForm(e.target, selectedMode, (payload) => {
			config = compute(config.tuning, payload);
			selectedMode = payload;
		})
	}

	function changeTuning(e) {
		processForm(e.target, config.tuning, (payload) => {
			config = compute(payload, config.scale);
			modifyingTuning = false;
		});
	}

	import Fretboard from './Fretboard.svelte';
</script>

<main>
	<h1>Chromatic</h1>
	<select bind:value={selectedFretMode}>
		{#each fretModes as mode}
			<option value={mode}>
				{mode}
			</option>
		{/each}
	</select>
	{#if selectedFretMode == "scale"}
		{#if selectedMode}
			Rocking <a on:click={clearMode}>{selectedMode[0]} {selectedMode[1]}</a>
		{:else}
			<form on:submit|preventDefault={changeMode}>
				<select name="key">
					{#each AVAILABLE_NOTES as key}
						<option value={key}>
							{key}
						</option>
					{/each}
				</select>
				<select name="mode">
					{#each AVAILABLE_MODES as mode}
						<option value={mode}>
							{mode}
						</option>
					{/each}
				</select>
				<button>Set</button>
			</form>
		{/if}
	{/if}

	{#if modifyingTuning}
		<form on:submit|preventDefault={changeTuning}>
			{#each config.tuning as root, i}
				<select name={`str${i}`} value={root}>
					{#each AVAILABLE_NOTES as note}
						<option value={note}>
							{note}
						</option>
					{/each}
				</select>
			{/each}
			<button>Set</button>
		</form>
	{:else}
		with tuning: {config.tuning}
		<button on:click={shouldModifyTuning}>Change Tuning </button>
	{/if}

	<Fretboard {config} />
</main>

<style>
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

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
