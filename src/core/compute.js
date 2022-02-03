const NUM_NOTES_IN_SCALE = 7;
const NUM_NOTES_IN_OCTAVE = 12;
const FRET_COUNT = 19;

export const AVAILABLE_MODES = [
		"major/ionian",
		"minor/aeolian",
		"dorian",
		"phrygian",
		"lydian",
		"mixolydian",
		"locrian"
];
export const MAIN_NOTES = ["A", "B", "C", "D", "E", "F", "G"];
export const SHARP_NOTES = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
export const FLAT_NOTES = ["A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab" ];
export const SCALE_FORMULA = [2, 2, 1, 2, 2, 2, 1];

const modeMap = {
	"major/ionian": 0,
	"dorian": 1,
	"phrygian": 2,
	"lydian": 3,
	"mixolydian": 4,
	"minor/aeolian": 5,
	"locrian": 6
};

const accidentalRemap = {
	"#": "b",
	"b": "#",
	undefined: ""
};

export const compute = (tuning, scale) => {
	const scaleConfig = getScaleConfig(scale);
	const availableNotes = (scale === "fret") ? SHARP_NOTES : scaleConfig.scale;

	return {
		availableNotes,
		scale,
		tuning,
		noteMap: scaleConfig.noteMap,
		strings: tuning.map(rootNote => buildString(rootNote, scaleConfig.noteMap))
	}
}

export const noteIndex = (i, isFlat) => (
	(isFlat) ? FLAT_NOTES.indexOf(i): SHARP_NOTES.indexOf(i)
);
export const noteName = (i) => SHARP_NOTES[i];

export const nMap = (n, cb) => {
	return [...Array(n).keys()].map((idx) => cb(idx + 1));
};

export const nTimes = (n, cb) => nMap(n, idx => cb(idx - 1));

export const getNoteMap = ([key, mode]) => {
	const noteOffset = noteIndex(key, key.endsWith("b"));
	const modeOffset = modeMap[mode];
	const scaleFormula = [
		0,
		...(nTimes(NUM_NOTES_IN_SCALE, (idx) => SCALE_FORMULA[(idx + modeOffset) % NUM_NOTES_IN_SCALE])
		.slice(0, 6))
	];
	const noteMap = [];
	let curNote = noteOffset;

	for (let i=0; i < 7; i++) {
		curNote = (curNote + scaleFormula[i]) % NUM_NOTES_IN_OCTAVE;
		noteMap.push(curNote);
	}

	return noteMap;
};

export const getScaleConfig = (scale) => {
	if (scale == "fret") {
		return {
			noteMap: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
			scale: SHARP_NOTES
		};
	} else {
		const noteMap = getNoteMap(scale);
		return {
			noteMap: noteMap,
			scale: buildScale(noteMap, scale)
		};
	}
}

/* Private */

const buildString = (rootNote, noteMap) => {
	const string = new Map();

	nTimes(NUM_NOTES_IN_OCTAVE, (idx) => {
		const noteNum = (noteIndex(rootNote) + idx) % NUM_NOTES_IN_OCTAVE;

		if (!noteMap.includes(noteNum)) {
			return;
		}

		string.set(idx, noteNum);
		// Only set note if it's visible
		if (idx + NUM_NOTES_IN_OCTAVE < FRET_COUNT) {
			string.set(idx + NUM_NOTES_IN_OCTAVE, noteNum);
		}
	});

	return string;
};

const buildScale = (noteMap, [key, _mode]) => {
	let scale = [];

	if (key.endsWith("b")) {
		scale = noteMap.map((i) => FLAT_NOTES[i]);
	}

	if (key.endsWith("#")) {
		scale = noteMap.map((i) => SHARP_NOTES[i]);
	}

	if (scale.length === 0) {
		scale = noteMap.reduce((acc, i) => {
			const interval = SHARP_NOTES[i];
			acc.push(nudgeInterval(acc[acc.length - 1] || "", interval));
			return acc;
		}, []);
	}

	return finalizeScale(scale);
};

const finalizeScale = (scale) => {
	const root = scale[0].replace(/[^A-G]/, "");
	const accidental = scale.join("").replace(/[A-G]/g, "")[0];
	const perfectScale = nMap(NUM_NOTES_IN_SCALE, (i) => (
		MAIN_NOTES[(MAIN_NOTES.indexOf(root) - 1 + i) % (NUM_NOTES_IN_SCALE)])
	);

	return scale.map((note, idx) => (
		(note[0] !== perfectScale[idx]) ? `${perfectScale[idx]}${accidental}` : note
	))
};

const nudgeInterval = (last, current) => {
	const [note, accidental] = current.split("");
	let newNote = current;

	if (last[0] === note) {
		newNote = `${MAIN_NOTES[(MAIN_NOTES.indexOf(note) + 1) % NUM_NOTES_IN_SCALE]}${accidentalRemap[accidental]}`;
	}

	return newNote;
}
