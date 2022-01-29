<script>
	export let config;

	import {nMap} from "./core/utils";

	let notes = [];
	const availableNotes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#" ]
	const stringPaddings = [180, 150, 120, 90, 60, 30];
	let currentScale;

	const width = 860,
				height = 260,
				padding = 180 / 6;

	const fretWidth = (width - 40) / 18;
	const fretStrings = nMap(6, (idx) => padding * idx);
	const fretPlacements = nMap(18, (idx) => Math.round(fretWidth * idx + 40));

	const scaleColors = [
		"#BD92D2",
		"#CF92C3",
		"#D6A4CA",
		"#DEB4D3",
		"#EBCEE2",
		"#F4F8F5",
		"#D4E2D7"
	];

	$: config && update(config)

	function colorForNote(note) {
		if (config.scale !== "fret") {
			return scaleColors[config.noteMap.indexOf(note)]
		}

		return "white";
	}

	function selectNote(i) {
		document.querySelector(`#note_${i}`).classList.toggle("selected");
	}

	function update(config) {
		let tempNotes = [];

		config.strings.map((stringNotes, yIdx) => {
			for (const [key, value] of config.strings[yIdx]) {
				tempNotes.push({
					label: availableNotes[value],
					num: value,
					x: fretWidth * (key + 1) - 28,
					y: stringPaddings[yIdx]
				})
			}
		});

		currentScale = config.noteMap;
		notes = tempNotes;
	}
</script>

<div id="fretContainer">
	<svg {width} {height}>
		<g id="fretBoard" width="98%" height="100%">
			<line x1="40" y1="26" x2="40" y2="184" style="stroke:rgb(55,55,0);stroke-width:8" />
			{#each fretPlacements as fretPlacement}
				<line x1={fretPlacement} y1="30" x2={fretPlacement} y2="180" style="stroke:rgb(200,200,200);stroke-width:2" />
			{/each}
			{#each fretStrings as string}
				<line x1="44" y1={string} x2="100%" y2={string} style="stroke:rgb(200,200,200);stroke-width:2" />
			{/each}
		</g>
		<g>
			<circle class="fretmarker" cx="154" cy="204" r="4" />
			<circle class="fretmarker" cx="245" cy="204" r="4" />
			<circle class="fretmarker" cx="336" cy="204" r="4" />
			<circle class="fretmarker" cx="428" cy="204" r="4" />
			<circle class="fretmarker" cx="558" cy="204" r="4" />
			<circle class="fretmarker" cx="570" cy="204" r="4" />
			<circle class="fretmarker" cx="702" cy="204" r="4" />
			<circle class="fretmarker" cx="792" cy="204" r="4" />
		</g>
		{#each notes as note, i}
		<g on:click={() => selectNote(i)} class="fretNote note_{note.num}" id="note_{i}">
			<circle stroke="black" fill={colorForNote(note.label)} cx={note.x} cy={note.y} r="12" />
			<text x={note.x} y={note.y + 3} text-anchor="middle" stroke="none" font-size="0.7em">{note.label}</text>
		</g>
		{/each}
		<g>
		{#if config.scale !== "fret"}
			{#each currentScale as degree, i}
				<g>
					<circle stroke="black" fill={colorForNote(degree)} cx={30 * i + 40} cy={230} r="10" />
					<text x={30 * i + 40} y={232} text-anchor="middle" stroke="none" font-size="0.6em">{degree}</text>
				</g>
			{/each}
		{/if}
		</g>
	</svg>
</div>
<style>
.fretmarker {
	stroke: black;
	fill: white;
}
.selected circle {
	fill: black;
}
.selected text {
	fill: white;
	cursor: pointer;
}
.fretNote {
	cursor: pointer;
}
.fretnote circle {
	transition: 1.35s ease;
	r: 12;
}
.fretNote:hover circle {
	r: 14;
}
</style>
