import { readFile } from '../tools.mjs';

const data = readFile(new URL('input.txt', import.meta.url));

const pairs = data.split('\n').map((str) => str.split(','));
const overlapingPairs = pairs.filter(([first, second]) => {
    if (first && second) {
        const [firstStart, firstEnd] = first.split('-').map((i) => parseInt(i, 10));
        const [secondStart, secondEnd] = second.split('-').map((i) => parseInt(i, 10));

        const firstInSecond = firstStart >= secondStart && firstEnd <= secondEnd;
        const secondInFirst = firstStart <= secondStart && firstEnd >= secondEnd;
        const firstContainsSecondStart = firstStart <= secondStart && secondStart <= firstEnd;
        const secondContainsFirstStart = secondStart <= firstStart && firstStart <= secondEnd;
        return firstInSecond || secondInFirst || firstContainsSecondStart || secondContainsFirstStart;
    }
    return false;
});
console.log('overlapingPairs: ', overlapingPairs.length);
