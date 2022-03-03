<script>
	export let params = {};

	import { SHARP_NOTES } from "../core/compute";
	import { parseTuning, tuningToSlug } from "../core/web";
	import { compute } from "../core/compute";
	import Fretboard from '../Fretboard.svelte';
	import TabNav from '../TabNav.svelte';
	import TuningSelector from '../TuningSelector.svelte';
	import { push, replace } from "svelte-spa-router";

	let config;

	parseTuning(params.tuning, (error, tuning) => {
		if (error) {
			return replace("/");
		}

		config = compute(tuning, "fret");
	});

	function changeTuning(newTuning) {
		config = compute(newTuning, "fret");
		push(`/fret/${tuningToSlug(newTuning)}`);

	}


</script>
<TabNav {params} selected="fret"/>
<TuningSelector
	onChangeTuning={changeTuning}
	currentTuning={config.tuning}
	notes={SHARP_NOTES} />
<Fretboard {config} />
