/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
const MAX_NUMBER_OF_RECYCLERS = 5;

enum OWNERSHIP {
    ME = 1,
    OPPONENT = 0,
    NEUTRAL = -1,
}

interface Positionable {
    x: number;
    y: number;
}

interface Unit extends Positionable {
    owner: OWNERSHIP;
    size: number;
}

interface Cell extends Positionable {
    scrapAmount: number;
    owner: OWNERSHIP;
    units: number;
    hasRecycler: boolean;
    canBuild: boolean;
    canSpawn: boolean;
    inRangeOfRecycler: boolean;
}

interface PartialBoard {
    width?: number;
    height?: number;
    myMaterial?: number;
    opponentMaterial?: number;
    cells?: Array<Cell>;
}

interface Board {
    width: number;
    height: number;
    cells: Array<Cell>;
}

interface GameState {
    board: Board;
    myMaterial: number;
    opponentMaterial: number;
    myUnits: Array<Unit>;
    myCells: Array<Cell>;
    neutralCells: Array<Cell>;
    opponentCells: Array<Cell>;
    myRecyclers: number;
    center: Positionable;
    recyclersBuilt: number;
}

var inputs: string[] = readline().split(' ');
const width: number = parseInt(inputs[0]);
const height: number = parseInt(inputs[1]);

const state: GameState = {
    board: {
        width,
        height,
        cells: [],
    },
    myMaterial: -1,
    opponentMaterial: -1,
    myUnits: [],
    myCells: [],
    neutralCells: [],
    opponentCells: [],
    myRecyclers: 0,
    recyclersBuilt: 0,
    center: { x: Math.floor(width) / 2, y: Math.floor(height / 2) },
};

function updateBoard(newBoard: PartialBoard): GameState {
    state.board = { ...state.board, ...newBoard };
    return state;
}

function addOrUpdateCellToBoard(x: number, y: number, cell: Cell): GameState {
    state.board.cells.push(cell);

    if (cell.owner === OWNERSHIP.ME) {
        state.myCells.push(cell);

        if (cell.hasRecycler) {
            state.myRecyclers++;
        }
    }

    if (cell.owner === OWNERSHIP.NEUTRAL) {
        state.neutralCells.push(cell);
    }

    if (cell.owner === OWNERSHIP.OPPONENT) {
        state.opponentCells.push(cell);
    }

    return state;
}

function addOrUpdateUnit(unit: Unit): GameState {
    state.myUnits.push(unit);
    return state;
}

function distanceBetween(elt1: Positionable, elt2: Positionable): number {
    return Math.sqrt(Math.pow(elt1.x - elt2.x, 2) + Math.pow(elt1.y - elt2.y, 2));
}

// Need to improve this function
function enactBuildAction(): string {
    if (state.myMaterial >= 10 && state.myRecyclers < 3 && MAX_NUMBER_OF_RECYCLERS > state.recyclersBuilt) {
        const idealCell = state.myCells.filter((c) => c.canBuild && c.units === 0).at(0);
        idealCell.canSpawn = false;
        state.myMaterial -= 10;
        state.recyclersBuilt++;
        return `BUILD ${idealCell.x} ${idealCell.y}`;
    }

    return 'WAIT';
}

// Need to improve this function
function enactSpawnAction(): string {
    if (state.myMaterial >= 30) {
        const { target: idealCell } = state.myCells.reduce(
            ({ target, distance }, candidate) => {
                const candidateDistance = distanceBetween(state.center, candidate);

                if (candidateDistance < distance) {
                    return { target: candidate, distance: candidateDistance };
                }

                return { target, distance };
            },
            { target: undefined, distance: Number.POSITIVE_INFINITY }
        );
        return `SPAWN 3 ${idealCell.x} ${idealCell.y}`;
    }

    return 'WAIT';
}

function enactAttackingMove(unit: Unit): string {
    const { target: idealTarget } = state.opponentCells.reduce(
        ({ target, distance }, candidate) => {
            if (candidate.scrapAmount <= 0) {
                return { target, distance };
            }

            const candidateDistance = distanceBetween(unit, candidate);

            if (candidateDistance < distance) {
                return { target: candidate, distance: candidateDistance };
            }

            return { target, distance };
        },
        { target: undefined, distance: Number.POSITIVE_INFINITY }
    );

    if (!idealTarget) {
        return 'WAIT';
    }

    return `MOVE ${unit.size} ${unit.x} ${unit.y} ${idealTarget.x} ${idealTarget.y}`;
}

function enactNeutralConquestMove(unit: Unit): string {
    const { target: idealTarget } = state.neutralCells.reduce(
        ({ target, distance }, candidate) => {
            if (candidate.scrapAmount <= 0) {
                return { target, distance };
            }

            const candidateDistance = distanceBetween(unit, candidate);

            if (candidateDistance < distance) {
                return { target: candidate, distance: candidateDistance };
            }

            return { target, distance };
        },
        { target: undefined, distance: Number.POSITIVE_INFINITY }
    );

    if (!idealTarget) {
        return 'WAIT';
    }

    return `MOVE ${unit.size} ${unit.x} ${unit.y} ${idealTarget.x} ${idealTarget.y}`;
}

function enactAllMoveActions(): string[] {
    return state.myUnits.map((unit) => {
        if (unit.size > 1) {
            return enactAttackingMove(unit);
        }
        return enactNeutralConquestMove(unit);
    });
}

function enactActions(): string {
    let actions = [];

    actions.push(enactBuildAction());
    actions.push(enactSpawnAction());

    return [...actions, ...enactAllMoveActions()].join(';').replace(';;', ';');
}

// game loop
while (true) {
    var inputs: string[] = readline().split(' ');
    const myMatter: number = parseInt(inputs[0]);
    const oppMatter: number = parseInt(inputs[1]);
    state.board.cells = [];
    state.myMaterial = myMatter;
    state.opponentMaterial = oppMatter;
    state.neutralCells = [];
    state.opponentCells = [];
    state.myCells = [];
    state.myUnits = [];
    state.myRecyclers = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const [scrapAmount, owner, units, recycler, canBuild, canSpawn, inRangeOfRecycler] = readline()
                .split(' ')
                .map(Number);

            const cell: Cell = {
                x,
                y,
                scrapAmount,
                owner,
                units,
                hasRecycler: recycler === 1,
                canBuild: canBuild === 1,
                canSpawn: canSpawn === 1,
                inRangeOfRecycler: inRangeOfRecycler === 1,
            };
            addOrUpdateCellToBoard(x, y, cell);

            if (units > 0) {
                if (owner === 1) {
                    const unit: Unit = {
                        x,
                        y,
                        owner: OWNERSHIP.ME,
                        size: units,
                    };
                    addOrUpdateUnit(unit);
                }
            }
        }
    }

    const actions = enactActions();
    console.log(actions);
}
