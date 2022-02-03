<script>
	export let params = {};

	let config;
	let selectedMode;

	import { push, replace } from "svelte-spa-router";

	import ScaleSelector from "../ScaleSelector.svelte";
	import TuningSelector from "../TuningSelector.svelte";
	import Fretboard from "../Fretboard.svelte";
	import TabNav from "../TabNav.svelte";
	import { compute } from "../core/compute";
	import { AVAILABLE_MODES, SHARP_NOTES } from "../core/compute";
	import { parseScaleMode, tuningToSlug } from "../core/web";

	parseScaleMode(params, (error, newTuning, newScaleMode) => {
		if (error) {
			return replace("/scale/705A27/c/major-ionian");
		}

		config = compute(newTuning, newScaleMode);
		selectedMode = newScaleMode;
	});

	function handleModeChange([key, scale]) {
		const newKey = key.replace("b", "f").replace("#", "s").toLowerCase()
		const newScale = scale.replace("/", "-");

		selectedMode = [key, scale];
		push(`/scale/${params.tuning}/${newKey}/${newScale}`);
		config = compute(config.tuning, selectedMode);
	}

	function changeTuning(newTuning) {
		push(`/scale/${tuningToSlug(newTuning)}/${params.key}/${params.scale}`);
		config = compute(newTuning, selectedMode);
	}

</script>
<TabNav {params} selected="scale"/>
<ScaleSelector
	onChangeMode={handleModeChange}
	selectedMode={selectedMode}
	modes={AVAILABLE_MODES} />
<TuningSelector
	onChangeTuning={changeTuning}
	currentTuning={config.tuning} 
	notes={SHARP_NOTES} />
<Fretboard {config} />
