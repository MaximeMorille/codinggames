import { solve } from "./winter-challenge-2023.3";

describe('Mon test', () => {
    it('sjould work', () => {
        const result = solve([[1,1,1],[1,1,4],[1,4,6]], [{pattern: [1,1,1,1], result:5}, {pattern: [1,1,1,4], result:6}]);

        expect(result).toStrictEqual([[5, 6], [6, 0]]);
    })
})