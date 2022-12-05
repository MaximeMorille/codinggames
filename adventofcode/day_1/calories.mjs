import { readFile } from '../tools.mjs';

async function mostCalories() {
    const data = readFile('./input.txt');

    const elves = data.split('\n\n');
    console.log('elves: ', elves);
    const calories = elves.map((foods) => foods.split('\n').reduce((total, food) => total + parseInt(food), 0));
    console.log('calories: ', calories);
    const [first, second, third, ...rest] = calories.sort((a, b) => b - a);
    const total = first + second + third;
    console.log(total);
    return total;
}

mostCalories();
