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

const cells: Cell[] = []

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

    const cell: Cell = {
        type,
        resources: initialResources,
        neighbors: [neigh0, neigh1, neigh2, neigh3, neigh4, neigh5].filter(id => id > -1),
        myAnts: 0,
        oppAnts: 0,
        index: i,
    }
    cells.push(cell)
}

const numberOfBases: number = parseInt(readline());
const myBases: number[] = readline().split(' ').map(n => parseInt(n))
const oppBases: number[] = readline().split(' ').map(n => parseInt(n))
let turn: number = 0;
// game loop
while (true) {
    const startTime = Date.now();
    const easyTargets: Cell[] = [];
    const hardTargets: Cell[] = [];
    let totalEasyResources = 0;
    let totalHardResources = 0;
    for (let i = 0; i < numberOfCells; i++) {
        const inputs = readline().split(' ')
        const resources: number = parseInt(inputs[0]); // the current amount of eggs/crystals on this cell
        const myAnts: number = parseInt(inputs[1]); // the amount of your ants on this cell
        const oppAnts: number = parseInt(inputs[2]); // the amount of opponent ants on this cell

        cells[i].resources = resources
        cells[i].myAnts = myAnts
        cells[i].oppAnts = oppAnts

        if (cells[i].type === CellType.CRYSTAL) {
            if (resources > 0 && oppAnts === 0) {
                totalEasyResources += cells[i].resources;
                easyTargets.push(cells[i]);
            }

            if (resources > 0 && oppAnts > 0) {
                totalHardResources += cells[i].resources;
                hardTargets.push(cells[i]);
            }
        }
    }

    const actions = []

    if (easyTargets.length > 0) {
        easyTargets.forEach(t => actions.push(buildLineAction(t.index, myBases.at(0), Math.ceil(300 * t.resources / totalEasyResources))));
    }

    if (hardTargets.length > 0) {
        hardTargets.forEach(t => actions.push(buildLineAction(t.index, myBases.at(0), Math.ceil(100 * t.resources / totalHardResources))));
    }

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
