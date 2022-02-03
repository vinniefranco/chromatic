import { AVAILABLE_MODES, SHARP_NOTES } from "./compute";

const tuningMap = {
	"a": "A",
	"af": "Ab",
	"b": "B",
	"bf": "Bb",
	"c": "C",
	"d": "D",
	"ds": "D#",
	"df": "Db",
	"e": "E",
	"ef": "Eb",
	"f": "F",
	"fs": "F#",
	"g": "G",
	"gs": "G#",
	"gf": "Gb"
};

export const parseScaleMode = ({tuning, key, scale}, cb) => {
	parseTuning(tuning, (error, newTuning) => {
		if (error) {
			cb("nope");
		}

		const selectedKey = tuningMap[key];
		const modeIndex = AVAILABLE_MODES.indexOf(scale.replace("-", "/"));

		if (!selectedKey || modeIndex === -1) {
			cb("nope");
		}

		return cb(false, newTuning, [selectedKey, AVAILABLE_MODES[modeIndex]]);
	});
};

export const processForm = (target, cb) => {
	const formData = new FormData(target);
	const newPayload = [];

	for (const field of formData) {
		const [_key, value] = field;
		newPayload.push(value);
	}

	cb(newPayload);
}

export const tuningToSlug = (tuning) => tuning.map(note => SHARP_NOTES.indexOf(note).toString(16)).join("");

export const intToNote = (int) => SHARP_NOTES[parseInt(int, 16)];

export const parseTuning = (tuning, cb) => {
	if (tuning.length !== 6) {
		cb("nope");
	}

	const tunings = tuning.split("").reduce((acc, noteInt) => {
		const note = intToNote(noteInt);

		note && acc.push(note);

		return acc;
	}, []);

	if(tunings.length === 6) {
		cb(false, tunings);
	} else {
		cb("nope");
	}
};
