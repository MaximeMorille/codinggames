enum CellType {
    EMPTY = 0,
    EGG = 1,
    CRYSTAL = 2
}

enum ActionType {
    BEACON,
    LINE,
    WAIT,
    MESSAGE
}

interface Cell {
    type: CellType
    resources: number
    neighbors: number[]
    myAnts: number
    oppAnts: number
    index: number
    r: number
    q: number
    s: number
    easy?: number
    hard?: number
    myNearestBase?: number
    distanceToMe?: number
    distanceToOpp?: number
}

function buildLineAction(start: number, end: number, strenght: number) {
    return `LINE ${start} ${end} ${strenght}`;
}

function buildWaitAction() {
    return 'WAIT';
}

function buildBeaconAction(index: number, strength: number) {
    return `BEACON ${index} ${strength}`;
}

const cellMaps: Record<number, Cell> = {};

function updateCellPosition(cell: Cell, r: number, q: number, s: number) {
    console.error(`Update cell ${cell.index} with r: ${r}, q: ${q}, s: ${s}`);
    cellMaps[cell.index].r = r;
    cellMaps[cell.index].q = q;
    cellMaps[cell.index].s = s;

    const [neigh0, neigh1, neigh2, neigh3, neigh4, neigh5] = cell.neighbors;

    cellMaps[neigh0] && cellMaps[neigh0].r === 0.1 && updateCellPosition(cellMaps[neigh0], r, q + 1, s - 1);
    cellMaps[neigh1] && cellMaps[neigh1].r === 0.1 && updateCellPosition(cellMaps[neigh1], r - 1, q + 1, s);
    cellMaps[neigh2] && cellMaps[neigh2].r === 0.1 && updateCellPosition(cellMaps[neigh2], r - 1, q, s + 1);
    cellMaps[neigh3] && cellMaps[neigh3].r === 0.1 && updateCellPosition(cellMaps[neigh3], r, q - 1, s + 1);
    cellMaps[neigh4] && cellMaps[neigh4].r === 0.1 && updateCellPosition(cellMaps[neigh4], r + 1, q - 1, s);
    cellMaps[neigh5] && cellMaps[neigh5].r === 0.1 && updateCellPosition(cellMaps[neigh5], r + 1, q, s - 1);
}

function distanceBetweenCells(cell1: Cell, cell2: Cell): number {
    return (
        Math.abs(cell1.r - cell2.r) +
        Math.abs(cell1.q - cell2.q) +
        Math.abs(cell1.s - cell2.s)
    ) / 2;
}

function maxByAnts(ants: number) {
    return Math.max(3, Math.floor(ants / 5));
}

const eggsIndexes: number[] = [];
const crystalsIndexes: number[] = [];

const numberOfCells: number = parseInt(readline()); // amount of hexagonal cells in this map
for (let i = 0; i < numberOfCells; i++) {
    const inputs: string[] = readline().split(' ');
    const type: number = parseInt(inputs[0]); // 0 for empty, 1 for eggs, 2 for food
    const initialResources: number = parseInt(inputs[1]); // the initial amount of eggs/crystals on this cell
    const neigh0: number = parseInt(inputs[2]); // the index of the neighbouring cell for each direction
    const neigh1: number = parseInt(inputs[3]);
    const neigh2: number = parseInt(inputs[4]);
    const neigh3: number = parseInt(inputs[5]);
    const neigh4: number = parseInt(inputs[6]);
    const neigh5: number = parseInt(inputs[7]);

    if (type === CellType.CRYSTAL) {
        crystalsIndexes.push(i);
    }

    if (type === CellType.EGG) {
        eggsIndexes.push(i);
    }

    const neighbors = [neigh0, neigh1, neigh2, neigh3, neigh4, neigh5]

    cellMaps[i] = {
        type,
        resources: initialResources,
        neighbors: neighbors,
        myAnts: 0,
        oppAnts: 0,
        index: i,
        r: 0.1,
        q: 0.1,
        s: 0.1,
    };
}

updateCellPosition(cellMaps[0], 0, 0, 0);

const numberOfBases: number = parseInt(readline());
const myBases: number[] = readline().split(' ').map(n => parseInt(n))
const oppBases: number[] = readline().split(' ').map(n => parseInt(n))
let turn: number = 0;

const computeDifficulties = (i: number): void => {
    const [myNearestDistance, myNearestBase] = myBases.reduce(
        ([currentDistance, base], baseIndex) => {
            const baseDistance = distanceBetweenCells(cellMaps[i], cellMaps[baseIndex])
            if (currentDistance > baseDistance) {
                return [baseDistance, baseIndex];
            }

            return [currentDistance, base];
        },
        [Number.POSITIVE_INFINITY, null]
    );
    const oppNearestDistance = oppBases.reduce((currentDistance, baseIndex) => Math.min(currentDistance, distanceBetweenCells(cellMaps[i], cellMaps[baseIndex])), Number.POSITIVE_INFINITY)
    cellMaps[i] = {
        ...cellMaps[i],
        easy: 100 * (oppNearestDistance - myNearestDistance) / (oppNearestDistance + myNearestDistance),
        hard: 100 * (myNearestDistance - oppNearestDistance) / (oppNearestDistance + myNearestDistance),
        myNearestBase,
        distanceToMe: myNearestDistance,
        distanceToOpp: oppNearestDistance,
    }
};

eggsIndexes.forEach(computeDifficulties);
crystalsIndexes.forEach(computeDifficulties);

const cells: Cell[] = Object.values(cellMaps);

function needsEggs(target: Cell) {

}

function needsCrystals(target: Cell) {

}

function needsAll(target: Cell) {

}

// game loop
while (true) {
    const startTime = Date.now();
    let targets: Cell[] = [];
    const minorTargets: Cell[] = [];
    let totalAnts: number = 0;
    let eggsPriority = false;
    for (let i = 0; i < numberOfCells; i++) {
        const inputs = readline().split(' ')
        const resources: number = parseInt(inputs[0]); // the current amount of eggs/crystals on this cell
        const myAnts: number = parseInt(inputs[1]); // the amount of your ants on this cell
        const oppAnts: number = parseInt(inputs[2]); // the amount of opponent ants on this cell

        totalAnts += myAnts;
        const cell = cells[i]
        cell.resources = resources
        cell.myAnts = myAnts
        cell.oppAnts = oppAnts

        if (resources > 0) {
            if (
                cell.distanceToMe <= 2
                && cell.type === CellType.EGG
            ) {
                if (!eggsPriority || cell.resources > targets.at(0).resources) {
                    targets.forEach(t => minorTargets.push(t));
                    targets = [cell];
                }
                eggsPriority = true;
                console.error('eggsPriority', eggsPriority)
            } else if (!eggsPriority) {
                targets.push(cell);
            } else {
                minorTargets.push(cell);
            }
        }
    }

    console.error(targets);

    const actions = []

    let done = 0;
    targets.sort((t1, t2) => t2.easy - t1.easy).forEach(t => {
        console.error(t);
        if (t.easy > 50) {
            actions.push(buildLineAction(t.index, t.myNearestBase, t.type === CellType.EGG ? 300 : 100));
            done++;
        } else if (done < maxByAnts(totalAnts) && (t.type === CellType.EGG && t.easy > 0 || CellType.CRYSTAL === t.type)) {
            actions.push(buildLineAction(t.index, t.myNearestBase, Math.floor(200 * (t.easy + 100) / 100)));
            done++;
        }
    });
    minorTargets.sort((t1, t2) => t2.easy - t1.easy).forEach(t => {
        console.error(t);
        if (t.easy > 50) {
            actions.push(buildLineAction(t.index, t.myNearestBase, t.type === CellType.EGG ? 300 : 100));
            done++;
        } else if (done < maxByAnts(totalAnts) && (t.type === CellType.EGG && t.easy > 0 || CellType.CRYSTAL === t.type)) {
            actions.push(buildLineAction(t.index, t.myNearestBase, Math.floor(200 * (t.easy + 100) / 100)));
            done++;
        }
    });

    if (actions.length === 0) {
        console.log('WAIT');
    } else {
        console.log(actions.join(';'))
    }

    let firstTurnDuration = 0;
    if (turn === 0) {
        firstTurnDuration = Date.now() - startTime;
    }
    turn++;
    console.error(`Time for turn: ${Date.now() - startTime}, initial turn: ${firstTurnDuration}`);
}

/**
 * Notes:
 * - big games vs small games ? (number of crystal cells indicates if eggs are important, or not)
 * - needs a target per base (eggsPriority)
 */