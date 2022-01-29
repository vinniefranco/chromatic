import { getNoteMap, noteName, noteIndex, nTimes } from "./utils";

const FRET_COUNT = 19;
const OCTAVE = 12;

const buildString = (rootNote, noteMap) => {
	const string = new Map();

	nTimes(OCTAVE, (idx) => {
		const noteNum = (noteIndex(rootNote) + idx) % OCTAVE;

		if (!noteMap.includes(noteNum)) {
			return ;
		}

		string.set(idx, noteNum);
		// Only set note if it's visible
		if (idx + OCTAVE < FRET_COUNT) {
			string.set(idx + OCTAVE, noteNum);
		}
	});

	return string;
};

export default function compute(tuning, scale) {
	const noteMap = getNoteMap(scale)

	return {
		scale,
		tuning,
		noteMap: noteMap.map((nNum) => noteName(nNum)),
		strings: tuning.map(rootNote => buildString(rootNote, noteMap))
	}
}
