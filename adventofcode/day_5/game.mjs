import { readFile } from '../tools.mjs';

const data = readFile(new URL('input.txt', import.meta.url));

const lines = data.split('\n');

const instructions = [];
const stacks = {};

function populateStacks(line) {
    const chars = line.split('');

    let stack = 0;
    chars.forEach((char, index) => {
        if (index % 4 === 0) {
            stack++;
        }
        if (index % 4 === 1 && /[A-Z]/.test(char)) {
            if (!stacks[stack]) {
                stacks[stack] = [];
            }
            stacks[stack].push(char);
        }
    });
}

lines.forEach((line) => {
    if (line.includes('move')) {
        return instructions.push(line);
    }

    if (line.includes('[')) {
        return populateStacks(line);
    }
});

instructions.forEach((instruction) => {
    const [_, qty, from, to] = /move ([0-9]+) from ([0-9]) to ([0-9])/.exec(instruction);
    const quantity = parseInt(qty);

    const toMove = stacks[from].splice(0, quantity);
    stacks[to].splice(0, 0, ...toMove);
});

const topCrates = Object.keys(stacks).map((stackId) => stacks[stackId].at(0));
console.log('topCrates: ', topCrates, topCrates.join(''));
