import compute from "./compute";

test("works", () => {
	const data = compute(["E", "A", "D", "G", "B", "E"], "fret")

	expect(data.scale).toEqual("fret");
	expect(data.str0.length).toEqual(22);
	expect(data.str0).toEqual([
		"C#",
		"C",
		"B",
		"A#",
		"A",
		"G#",
		"G",
		"F#",
		"F",
		"E",
		"D#",
		"D",
		"C#",
		"C",
		"B",
		"A#",
		"A",
		"G#",
		"G",
		"F#",
		"F",
		"E",
	]);

	expect(data.str1.length).toEqual(22);
	expect(data.str1).toEqual([
		"F#",
		"F",
		"E",
		"D#",
		"D",
		"C#",
		"C",
		"B",
		"A#",
		"A",
		"G#",
		"G",
		"F#",
		"F",
		"E",
		"D#",
		"D",
		"C#",
		"C",
		"B",
		"A#",
		"A",
	]);
});
