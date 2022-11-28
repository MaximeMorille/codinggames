import { setTargetedHostileFactory } from "./cyboarg-uprising.mjs";

describe("setTargetedHostileFactory", () => {
  it("should give the most productive factory from the nearest ones", () => {
    const factories = [
      { production: 2, links: { 1: 12, 2: 3, 3: 4 } },
      { production: 2, links: { 1: 12, 2: 5, 3: 4 } },
      { production: 3, links: { 1: 3, 2: 7, 3: 9 } },
    ];
    const source = { id: "2" };

    expect(setTargetedHostileFactory(source, factories)).toBe({});
  });
});
