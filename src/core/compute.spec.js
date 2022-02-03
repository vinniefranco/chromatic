import { compute, getNoteMap, getScaleConfig } from "./compute";
import { intToNote } from "./web";

test("works", () => {
	const data = compute(["E", "A", "D", "G", "B", "E"], "fret")

	expect(data.scale).toEqual("fret");
	expect(data.strings[0].size).toEqual(19);
	expect(data.strings[1].size).toEqual(19);
});


describe("getNoteMap()", () => {
	test("Cm returns expected note map", () => {
		const scale = getNoteMap(["C", "minor/aeolian"]);

		expect(scale).toEqual([3, 5, 6, 8, 10, 11, 1]);
	});

	test("Am returns expected note map", () => {
		const scale = getNoteMap(["A", "minor/aeolian"]);

		expect(scale).toEqual([0, 2, 3, 5, 7, 8, 10]);
	});

	test("A returns expected note map", () => {
		const scale = getNoteMap(["A", "major/ionian"]);

		expect(scale).toEqual([0, 2, 4, 5, 7, 9, 11]);
	});

	test("Bb, returns expected note map", () => {
		const scale = getNoteMap(["Bb", "major/ionian"]);

		expect(scale).toEqual([1, 3, 5, 6, 8, 10, 0]);
	});
});

describe("getScaleConfig", () => {
	test("it returns sharps when needed", () => {
		let { scale } = getScaleConfig(["A", "major/ionian"]);
		expect(scale).toEqual(["A", "B", "C#", "D", "E", "F#", "G#"]);

		scale = getScaleConfig(["C#", "major/ionian"]).scale;
		console.log(getScaleConfig(["C#", "major/ionian"]));
		expect(scale).toEqual(["C#", "D#", "E#", "F#", "G#", "A#", "B#"]);

		scale = getScaleConfig(["D", "major/ionian"]).scale;
		expect(scale).toEqual(["D", "E", "F#", "G", "A", "B", "C#"]);

		scale = getScaleConfig(["E", "minor/aeolian"]).scale;
		expect(scale).toEqual(["E", "F#", "G", "A", "B", "C", "D"]);
	});

	test("it returns flats when needed", () => {
		let scale;
		scale = getScaleConfig(["D", "major/ionian"]).scale;
		expect(scale).toEqual(["D", "E", "F#", "G", "A", "B", "C#"]);

		scale = getScaleConfig(["C", "minor/aeolian"]).scale;
		expect(scale).toEqual(["C", "D", "Eb", "F", "G", "Ab", "Bb"]);

		scale = getScaleConfig(["Ab", "major/ionian"]).scale;
		expect(scale).toEqual(["Ab", "Bb", "C", "Db", "Eb", "F", "G"]);
	});
});

describe("intToNote()", () => {
	test("returns expected note", () => {
		expect(intToNote("0")).toEqual("A");
		expect(intToNote("1")).toEqual("A#");
		expect(intToNote("2")).toEqual("B");
		expect(intToNote("3")).toEqual("C");
		expect(intToNote("4")).toEqual("C#");
		expect(intToNote("5")).toEqual("D");
		expect(intToNote("6")).toEqual("D#");
		expect(intToNote("7")).toEqual("E");
		expect(intToNote("8")).toEqual("F");
		expect(intToNote("9")).toEqual("F#");
		expect(intToNote("A")).toEqual("G");
		expect(intToNote("B")).toEqual("G#");
	});
});

