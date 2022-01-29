const NUM_NOTES_IN_SCALE = 7;
const NUM_NOTES_IN_OCTAVE = 12;

const modeMap = {
	"major/ionian": 0,
	"dorian": 1,
	"phrygian": 2,
	"lydian": 3,
	"mixolydian": 4,
	"minor/aeolian": 5,
	"locrian": 6
}

export const AVAILABLE_NOTES = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#" ];
export const AVAILABLE_MODES = [
		"major/ionian",
		"minor/aeolian",
		"dorian",
		"phrygian",
		"lydian",
		"mixolydian",
		"locrian"
];
export const SCALE_FORMULA = [2, 2, 1, 2, 2, 2, 1];

export const noteIndex = (i) => AVAILABLE_NOTES.indexOf(i);
export const noteName = (i) => AVAILABLE_NOTES[i];

export const nMap = (n, cb) => {
	return [...Array(n).keys()].map((idx) => cb(idx + 1));
};

export const nTimes = (n, cb) => nMap(n, idx => cb(idx - 1));

const getModeNoteMap =(key, mode) => {
	const noteOffset = noteIndex(key);
	const modeOffset = modeMap[mode];

	const scaleFormula =
		nTimes(NUM_NOTES_IN_SCALE, (idx) => SCALE_FORMULA[(idx + modeOffset) % NUM_NOTES_IN_SCALE])
		.slice(0, 6);

	const noteMap = [noteOffset];

	let curNote = noteOffset;

	for (let i=0; i < 6; i++) {
		curNote = (curNote + scaleFormula[i]) % NUM_NOTES_IN_OCTAVE;
		noteMap.push(curNote);
	}

	return noteMap;
};

export const getNoteMap = (scale) => {
	if (scale === "fret") {
		return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
	} else {
		const [key, mode] = scale;
		return getModeNoteMap(key, mode);
	}
};

export const processForm = (target, oldPayload, cb) => {
	const formData = new FormData(target);
	const newPayload = [];

	for (const field of formData) {
		const [_key, value] = field;
		newPayload.push(value);
	}

	if (JSON.stringify(newPayload) !== JSON.stringify(oldPayload)) {
		cb(newPayload)
	}
}
