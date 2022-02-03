<script>
	import { processForm } from "./core/web";
	export let onChangeTuning;
	export let currentTuning;
	export let notes;

	let modifyingTuning = false;

	function shouldModifyTuning() {
		modifyingTuning = true;
	}

	function changeTuning(e) {
		processForm(e.target, (payload) => {
			onChangeTuning(payload);
			modifyingTuning = false;
		})
	}

</script>

{#if modifyingTuning}
	<form on:submit|preventDefault={changeTuning}>
		{#each currentTuning as root, i}
			<select name={`str${i}`} value={root}>
				{#each notes as note}
					<option value={note}>
						{note}
					</option>
				{/each}
			</select>
		{/each}
		<button>Set</button>
	</form>
{:else}
	Current tuning: {currentTuning}
	<button on:click={shouldModifyTuning}>Change Tuning </button>
{/if}
