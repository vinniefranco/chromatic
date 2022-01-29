import { getNoteMap } from "./utils";

describe("getNoteMap()", () => {
	test("Cm returns expected note map", () => {
		const scale = getNoteMap(["C", "minor/aeolian"]);

		expect(scale).toEqual([3, 5, 6, 8, 10, 11, 1]);
	})

	test("Am returns expected note map", () => {
		const scale = getNoteMap(["A", "minor/aeolian"]);

		expect(scale).toEqual([0, 2, 3, 5, 7, 8, 10]);
	})
});

