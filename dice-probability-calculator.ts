/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
declare function readline(): string;

interface Dice {
    faces: number;
}

interface Operator {
    leftOperand: Operand;
    rightOperand: Operand;
    parent?: Operator;
}

interface Multiply extends Operator {
    kind: 'multiply';
}
interface Add extends Operator {
    kind: 'add';
}
interface Minus extends Operator {
    kind: 'minus';
}
interface GreaterThan extends Operator {
    kind: 'greaterthan';
}

type Outcome = {
    value: number;
    proba: number;
};

type Outcomes = Array<Outcome>;

type Operand = Operator | Dice | Number;

let expr: string = readline();
const groups: Array<string> = [];

let group = '';
let grouping = false;
expr.split('').forEach((c) => {
    if (c === '(') {
        grouping = true;
    }
    if (c === ')') {
        group += c;
        groups.push(group);
        group = '';
        grouping = false;
    }
    if (grouping) {
        group += c;
    }
});

let groupedExpr = groups.reduce((currrentExpr, group, index) => {
    return currrentExpr.replace(group, `GROUP_${index}`);
}, expr);

function createGreaterThan(left: Operand, right: Operand): GreaterThan {
    return {
        leftOperand: left,
        rightOperand: right,
        kind: 'greaterthan',
    };
}

function createAdd(left: Operand, right: Operand): Add {
    return {
        leftOperand: left,
        rightOperand: right,
        kind: 'add',
    };
}

function createMinus(left: Operand, right: Operand): Minus {
    return {
        leftOperand: left,
        rightOperand: right,
        kind: 'minus',
    };
}

function createMultiply(left: Operand, right: Operand): Multiply {
    return {
        leftOperand: left,
        rightOperand: right,
        kind: 'multiply',
    };
}

function parseExpr(formula: string): Operand {
    if (formula.includes('>')) {
        const [left, right] = formula.split('>');
        return createGreaterThan(parseExpr(left), parseExpr(right));
    }

    if (formula.includes('+') || formula.includes('-')) {
        let addMinusOperatorMet = false;
        let operatorCreator: Function = createMinus;
        const [left, right] = formula.split('').reduce(
            ([left, right], c) => {
                if (!addMinusOperatorMet && (c === '-' || c === '+')) {
                    addMinusOperatorMet = true;

                    if (c === '-') {
                        operatorCreator = createMinus;
                    } else {
                        operatorCreator = createAdd;
                    }

                    return [left, right];
                }

                if (addMinusOperatorMet) {
                    return [left, right + c];
                }

                return [left + c, right];
            },
            ['', '']
        );

        return operatorCreator(parseExpr(left), parseExpr(right));
    }

    if (formula.includes('*')) {
        let multiplyOperatorMet = false;
        const [left, right] = formula.split('').reduce(
            ([left, right], c) => {
                if (!multiplyOperatorMet && c === '*') {
                    multiplyOperatorMet = true;

                    return [left, right];
                }

                if (multiplyOperatorMet) {
                    return [left, right + c];
                }

                return [left + c, right];
            },
            ['', '']
        );

        return createMultiply(parseExpr(left), parseExpr(right));
    }

    if (formula.startsWith('d')) {
        const nbFaces = parseInt(formula.replace('d', ''), 10);
        return {
            faces: nbFaces,
        };
    }

    if (formula.startsWith('GROUP_')) {
        const groupIndex = parseInt(formula.replace('GROUP_', ''), 10);
        return parseExpr(groups[groupIndex].replace('(', '').replace(')', ''));
    }

    return parseInt(formula, 10);
}

function isDice(operand: Operand): operand is Dice {
    return Object.keys(operand).includes('faces');
}

function isGreaterThan(operand: Operand): operand is GreaterThan {
    return Object.keys(operand).includes('kind') && operand['kind'] === 'greaterthan';
}

function isMultiply(operand: Operand): operand is Multiply {
    return Object.keys(operand).includes('kind') && operand['kind'] === 'multiply';
}

function isMinus(operand: Operand): operand is Minus {
    return Object.keys(operand).includes('kind') && operand['kind'] === 'minus';
}

function isAdd(operand: Operand): operand is Add {
    return Object.keys(operand).includes('kind') && operand['kind'] === 'add';
}

function isOutcomes(outcomes: Operand | Outcomes): outcomes is Outcomes {
    return Array.isArray(outcomes);
}

function computeNumber(operand: number): Outcomes {
    return [{ value: operand, proba: 1 }];
}

function computeDice(dice: Dice): Outcomes {
    const results: Outcomes = [];

    for (let i = 0; i < dice.faces; i++) {
        results.push({
            value: i + 1,
            proba: 1 / dice.faces,
        });
    }

    return results;
}

function computeGreaterThan(left: Operand | Outcomes, right: Operand | Outcomes): Outcomes {
    if (!isOutcomes(left)) {
        left = compute(left);
    }
    if (!isOutcomes(right)) {
        right = compute(right);
    }

    let rightProba = 0;

    for (let i = 0; i < left.length; i++) {
        for (let j = 0; j < right.length; j++) {
            if (left[i].value > right[j].value) {
                rightProba += left[i].proba * right[j].proba;
            }
        }
    }

    return [
        { value: 1, proba: rightProba },
        { value: 0, proba: 1 - rightProba },
    ].filter(({ proba }) => proba > 0);
}

function computeMultiply(left: Operand | Outcomes, right: Operand | Outcomes): Outcomes {
    if (!isOutcomes(left)) {
        left = compute(left);
    }
    if (!isOutcomes(right)) {
        right = compute(right);
    }

    const results: Record<number, number> = {};

    for (let i = 0; i < left.length; i++) {
        for (let j = 0; j < right.length; j++) {
            const newValue: Outcome = { value: left[i].value * right[j].value, proba: left[i].proba * right[j].proba };

            if (results[newValue.value]) {
                results[newValue.value] += newValue.proba;
            } else {
                results[newValue.value] = newValue.proba;
            }
        }
    }

    return Object.keys(results).map((value) => ({
        value: parseInt(value, 10),
        proba: results[value],
    }));
}

function computeMinus(left: Operand | Outcomes, right: Operand | Outcomes): Outcomes {
    if (!isOutcomes(left)) {
        left = compute(left);
    }
    if (!isOutcomes(right)) {
        right = compute(right);
    }

    const results: Record<number, number> = {};

    for (let i = 0; i < left.length; i++) {
        for (let j = 0; j < right.length; j++) {
            const newValue: Outcome = { value: left[i].value - right[j].value, proba: left[i].proba * right[j].proba };

            if (results[newValue.value]) {
                results[newValue.value] += newValue.proba;
            } else {
                results[newValue.value] = newValue.proba;
            }
        }
    }

    return Object.keys(results).map((value) => ({
        value: parseInt(value, 10),
        proba: results[value],
    }));
}

function computeAdd(left: Operand | Outcomes, right: Operand | Outcomes): Outcomes {
    if (!isOutcomes(left)) {
        left = compute(left);
    }
    if (!isOutcomes(right)) {
        right = compute(right);
    }

    const results: Record<number, number> = {};

    for (let i = 0; i < left.length; i++) {
        for (let j = 0; j < right.length; j++) {
            const newValue: Outcome = { value: left[i].value + right[j].value, proba: left[i].proba * right[j].proba };

            if (results[newValue.value]) {
                results[newValue.value] += newValue.proba;
            } else {
                results[newValue.value] = newValue.proba;
            }
        }
    }

    return Object.keys(results).map((value) => ({
        value: parseInt(value, 10),
        proba: results[value],
    }));
}

function compute(operand: Operand): Outcomes {
    if (isAdd(operand)) {
        return computeAdd(operand.leftOperand, operand.rightOperand);
    }
    if (isMinus(operand)) {
        return computeMinus(operand.leftOperand, operand.rightOperand);
    }
    if (isMultiply(operand)) {
        return computeMultiply(operand.leftOperand, operand.rightOperand);
    }
    if (isGreaterThan(operand)) {
        return computeGreaterThan(operand.leftOperand, operand.rightOperand);
    }
    if (isDice(operand)) {
        return computeDice(operand);
    }

    return computeNumber(operand as number);
}

const result = parseExpr(groupedExpr);

function byValue(outcome1: Outcome, outcome2: Outcome): number {
    return outcome1.value - outcome2.value;
}

const outcomes = compute(result).sort(byValue);

function displayOutcome(outcome: Outcome) {
    const proba = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        Math.round(outcome.proba * 10000) / 100
    );
    console.log(`${outcome.value} ${proba}`);
}
outcomes.forEach(displayOutcome);
