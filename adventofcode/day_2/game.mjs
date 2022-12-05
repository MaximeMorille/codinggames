import fs from 'fs';

const MAPPING = {
    X: 'A',
    Y: 'B',
    Z: 'C',
};

const WIN_AGAINST = {
    A: 'C',
    B: 'A',
    C: 'B',
};

const LOOSE_AGAINST = {
    A: 'B',
    B: 'C',
    C: 'A',
};

const GRADES = {
    A: 1,
    B: 2,
    C: 3,
};

function getAction(opponent, result) {
    if (result === 'Y') {
        return opponent;
    }

    if (result === 'X') {
        return WIN_AGAINST[opponent];
    }

    return LOOSE_AGAINST[opponent];
}

function computeGameScore([opponent, me]) {
    if (!Object.keys(GRADES).includes(opponent) || !Object.keys(GRADES).includes(me)) {
        return 0;
    }

    if (opponent === me) {
        // console.log('Draw');
        return 3 + GRADES[me];
    }

    if (opponent === WIN_AGAINST[me]) {
        // console.log('I win');
        return 6 + GRADES[me];
    }

    // console.log('I lose');
    return GRADES[me];
}

const data = fs.readFileSync('./input.txt').toString();

const games = data
    .split('\n')
    .map((battle) => battle.split(' '))
    .map(([opponent, me]) => [opponent, getAction(opponent, me)]);
// console.log('games: ', games);
const total = games.reduce((total, battle) => {
    const result = computeGameScore(battle);
    console.log('result: ', result, battle);
    return total + result;
}, 0);

console.log(total);
