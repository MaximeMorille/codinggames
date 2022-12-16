/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
declare function readline(): string;

const MAX_NUMBER_OF_RECYCLERS = 5;

enum SIDE {
    LEFT,
    RIGHT,
}

enum OWNERSHIP {
    ME = 1,
    OPPONENT = 0,
    NEUTRAL = -1,
}

interface Point {
    x: number;
    y: number;
}

interface Unit extends Point {
    owner: OWNERSHIP;
    size: number;
}

interface Cell extends Point {
    scrapAmount: number;
    owner: OWNERSHIP;
    units: number;
    hasRecycler: boolean;
    canBuild: boolean;
    canSpawn: boolean;
    inRangeOfRecycler: boolean;
    goal?: Goal;
}

interface Area {
    topLeft: Point;
    bottomRight: Point;
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
    protectedArea?: Area;
    mySide?: SIDE;
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
    center: Point;
    recyclersBuilt: number;
    turn: number;
    goals: Array<Goal>;
    frontline: number;
}

interface Goal extends Point {
    completed: boolean;
    targeted: boolean;
    conquered: boolean;
}

interface TargetCandidate {
    target?: Point;
    distance: number;
}

const DEFAULT_TARGET_CANDIDATE: TargetCandidate = { target: undefined, distance: Number.POSITIVE_INFINITY };

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
    center: { x: Math.floor(width / 2), y: Math.floor(height / 2) },
    turn: 0,
    goals: [],
    frontline: -1,
};

function updateBoard(newBoard: PartialBoard): GameState {
    state.board = { ...state.board, ...newBoard };
    return state;
}

function addOrUpdateCellToBoard(x: number, y: number, cell: Cell): GameState {
    state.board.cells.push(cell);

    if (cell.owner === OWNERSHIP.ME) {
        state.myCells.push(cell);

        if (isGoal(cell) && cell.goal) {
            cell.goal.conquered = true;
        }

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

function distanceBetween(elt1: Point, elt2: Point): number {
    return Math.sqrt(Math.pow(elt1.x - elt2.x, 2) + Math.pow(elt1.y - elt2.y, 2));
}

function findNearestTarget(point: Point) {
    return ({ target, distance }: TargetCandidate, candidate: Point): TargetCandidate => {
        const candidateDistance = distanceBetween(point, candidate);

        if (candidateDistance < distance) {
            return { target: candidate, distance: candidateDistance };
        }

        return { target, distance };
    };
}

function isNotProtected(cell: Cell): boolean {
    if (!state.board.protectedArea) {
        return true;
    }
    return !(state.board.protectedArea.topLeft.x <= cell.x && state.board.protectedArea.bottomRight.x >= cell.x);
}

function isGoal(cell: Cell): boolean {
    if (cell.goal) {
        return true;
    }

    const [goal] = state.goals.filter((g) => g.x === cell.x && g.y === cell.y);
    cell.goal = goal;

    return goal !== undefined;
}

function goalsFirst(cell1: Cell, cell2: Cell): number {
    if (isGoal(cell1)) {
        return -1;
    }

    if (isGoal(cell2)) {
        return 1;
    }

    return 0;
}

// Need to improve this function
function enactBuildAction(): string {
    if (state.myMaterial >= 10) {
        const idealCells = state.myCells.filter((c) => c.canBuild && c.units === 0 && isNotProtected(c)).sort(goalsFirst);

        if (idealCells.length === 0) {
            return 'WAIT';
        }

        return idealCells
            .map((idealCell) => {
                if (idealCell.goal) {
                    idealCell.goal.completed = true;
                }

                idealCell.canSpawn = false;
                state.myMaterial -= 10;
                state.recyclersBuilt++;
                return `BUILD ${idealCell.x} ${idealCell.y}`;
            })
            .join(';');
    }

    return 'WAIT';
}

// To improve
function enactSpawnAction(): string {
    if (state.myMaterial >= 30) {
        const { target: idealCell } = state.myCells
            .filter((c) => !c.hasRecycler && c.scrapAmount > 0 && c.x !== state.frontline)
            .reduce(findNearestTarget(state.center), DEFAULT_TARGET_CANDIDATE);

        if (!idealCell) {
            return 'WAIT';
        }

        return `SPAWN 3 ${idealCell.x} ${idealCell.y}`;
    }

    return 'WAIT';
}

function enactAttackingMove(unit: Unit): string {
    const { target: idealTarget } = state.opponentCells
        .filter((c) => c.scrapAmount > 0)
        .reduce(findNearestTarget(unit), DEFAULT_TARGET_CANDIDATE);

    if (!idealTarget) {
        return 'WAIT';
    }

    return `MOVE ${unit.size} ${unit.x} ${unit.y} ${idealTarget.x} ${idealTarget.y}`;
}

function enactNeutralConquestMove(unit: Unit): string {
    const { target: idealTarget } = state.neutralCells
        .filter((c) => c.scrapAmount > 0)
        .reduce(findNearestTarget(unit), DEFAULT_TARGET_CANDIDATE);

    if (!idealTarget) {
        return enactAttackingMove(unit);
    }

    return `MOVE ${unit.size} ${unit.x} ${unit.y} ${idealTarget.x} ${idealTarget.y}`;
}

function captureGoal(unit: Unit): string {
    const { target: idealTarget, distance } = state.goals
        .filter((g) => !g.completed && !g.targeted && !g.conquered)
        .reduce(findNearestTarget(unit), DEFAULT_TARGET_CANDIDATE);

    if (!idealTarget) {
        return 'WAIT';
    }

    const targetedGoal = state.goals.find((g) => idealTarget.y === g.y);

    if (!targetedGoal) {
        return 'WAIT';
    }

    targetedGoal.targeted = true;
    return `MOVE ${unit.size} ${unit.x} ${unit.y} ${targetedGoal.x} ${targetedGoal.y}`;
}

function inMySide(unit1: Unit, unit2: Unit): number {
    if (state.board.mySide === SIDE.LEFT) {
        return unit1.x - unit2.x;
    }

    return unit2.x - unit1.x;
}

function enactAllMoveActions(): string[] {
    return state.myUnits.sort(inMySide).map((unit, index) => {
        if (index === 0) {
            return enactNeutralConquestMove(unit);
        }
        const availableGoals = state.goals.filter((g) => !g.completed && !g.targeted && !g.conquered);
        if (availableGoals.length > 0) {
            return captureGoal(unit);
        }
        return enactAttackingMove(unit);
    });
}

function enactActions(): string {
    let actions: Array<string> = [];

    actions.push(enactBuildAction());
    actions.push(enactSpawnAction());

    return [...actions, ...enactAllMoveActions()].join(';').replace(';;', ';');
}

function initGoals() {
    const myFirstCell = state.myCells.at(0);

    if (!myFirstCell) {
        console.error(state);
        return;
    }

    state.board.mySide = myFirstCell.x > state.center.x ? SIDE.RIGHT : SIDE.LEFT;

    if (state.board.mySide === SIDE.LEFT) {
        state.frontline = state.center.x - 1;
        state.board.protectedArea = {
            topLeft: {
                x: 0,
                y: 0,
            },
            bottomRight: {
                x: state.frontline - 1,
                y: state.board.height - 1,
            },
        };
    } else {
        state.frontline = state.center.x + 1;
        state.board.protectedArea = {
            topLeft: {
                x: state.frontline + 1,
                y: 0,
            },
            bottomRight: {
                x: state.board.width - 1,
                y: state.board.height - 1,
            },
        };
    }

    state.goals = [...Array(state.board.height).keys()].map((y) => ({
        x: state.frontline,
        y,
        completed: false,
        targeted: false,
        conquered: false,
    }));
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
    state.turn++;
    state.goals.forEach((g) => {
        g.targeted = false;
        g.conquered = false;
    });
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

    if (state.turn === 1) {
        initGoals();
    }

    const actions = enactActions();
    console.log(actions);
}
