import { readFile } from '../tools.mjs';

const data = readFile(new URL('input.txt', import.meta.url));

const rucksacks = data.split('\n');
const elvesGroups = rucksacks.reduce((groups, current, index) => {
    let currentGroup = [];
    if (index % 3 !== 0) {
        currentGroup = groups.pop();
    }
    currentGroup.push(current);
    return [...groups, currentGroup];
}, []);

const compartments = rucksacks.map((str) => [str.slice(0, str.length / 2), str.slice(str.length / 2, str.length)]);
const badges = elvesGroups.map(([first, second, third]) => {
    const firstItems = first.split('');
    return firstItems.reduce((b, l) => {
        if (second.includes(l) && third.includes(l) && !b.includes(l)) {
            return [...b, l];
        }
        return b;
    }, []);
});

const mixedItems = compartments.map(([left, right]) => {
    const leftItems = left.split('');

    return leftItems.reduce((common, actual) => {
        if (right.includes(actual) && !common.includes(actual)) {
            return [...common, actual];
        }
        return common;
    }, []);
});

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
const LETTERS = (ALPHABET + ALPHABET.toUpperCase()).split('');

const totalMixedItems = mixedItems.reduce(sumLetters, 0);
console.log(totalMixedItems);

const totalBadges = badges.reduce(sumLetters, 0);
console.log('badges: ', badges);
console.log('totalBadges: ', totalBadges);

function sumLetters(total, actual) {
    const localTotal = actual.reduce((t, l) => t + LETTERS.indexOf(l) + 1, 0);
    return total + localTotal;
}
