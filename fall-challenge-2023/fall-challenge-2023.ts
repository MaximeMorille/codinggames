declare function readline(): any;

enum BlipDirection {
    TL = 'TL',
    TR = 'TR',
    BL = 'BL',
    BR = 'BR',
}

interface Point {
    id: number;
    x: number;
    y: number;
}

interface Creature extends Point {
    color: number;
    type: number;
    vX: number;
    vY: number;
    scanned: boolean;
    points: number;
    visible: boolean;
}

interface Drone extends Point {
    emergency: number;
    battery: number;
    creaturesDirection: {
        TL: Array<Creature>;
        TR: Array<Creature>;
        BL: Array<Creature>;
        BR: Array<Creature>;
    };
    density: {
        TL: number;
        TR: number;
        BL: number;
        BR: number;
    };
    areas: {
        TL: number;
        TR: number;
        BL: number;
        BR: number;
    };
    scannedCreatures: Array<number>;
    visibleMonsters: Array<Creature>;
    dangerousDirections: {
        TL: number;
        TR: number;
        BL: number;
        BR: number;
    };
    persistentAction: string;
}

interface Player {
    score: number;
    scannedCreatures: Array<number>;
    drones: Record<number, Drone>;
}

interface Fall2023GameState {
    me: Player;
    opponent: Player;
    turn: number;
    blipsCount: number;
}

interface TargetCandidate {
    target?: Point;
    distance: number;
}

interface Boundaries {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
}

const DEFAULT_TARGET_CANDIDATE: TargetCandidate = { target: undefined, distance: Number.POSITIVE_INFINITY };

const FISHES: Record<number, Creature> = {};
const state: Fall2023GameState = {
    turn: 0,
    me: {
        drones: [],
        scannedCreatures: [],
        score: 0,
    },
    opponent: null,
    blipsCount: 0,
};

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

const fixCoordinate = (min: number, max: number) => (value: number): number => {
    return Math.max(min, Math.min(value, max));
}

function getDroneAreas(x: number, y: number) {
    const left = x;
    const top = y;
    const right = 10_000 - x;
    const bottom = 10_000 - y;

    return {
        TL: left * top,
        TR: right * top,
        BL: left * bottom,
        BR: right * bottom,
    }
}

function getFishPoints(y: number) {
    if (7500 <= y || y <= 10_000) {
        return 3;
    }

    if (5000 <= y || y <= 7500) {
        return 2;
    }

    return 1;
}

function updateFish(id: number, color: number, type: number) {
    FISHES[id] = {
        id,
        color,
        type,
        x: -1,
        y: -1,
        vX: 0,
        vY: 0,
        scanned: false,
        points: 0,
        visible: false,
    };
}

function resetVisibility() {
    Object.keys(FISHES).forEach(id => FISHES[id].visible = false);
}

function getBestDirection(drone: Drone): BlipDirection {
    let bestDirection: BlipDirection;
    let currentBest = Number.NEGATIVE_INFINITY;

    Object.keys(BlipDirection).forEach(direction => {
        if (drone.dangerousDirections[direction] === 0 && currentBest < drone.density[direction]) {
            currentBest = drone.density[direction];
            bestDirection = BlipDirection[direction];
        }
    })
    return bestDirection;
}

function middlePointOf(x: number, y: number) {
    return {
        target: {
            id: Number.NaN,
            x: fixCoordinate(600, 9_400)(x),
            y: Math.max(2_500, fixCoordinate(600, 9_400)(y)),
        },
        distance: Number.NaN
    };
}

function integer(value: number) {
    return Math.floor(value);
}

function middleLow(value: number) {
    return integer(value / 2);
}

function middleHigh(value: number) {
    return integer(value + (10_000 - value) / 2)
}

function getMiddlePoint(direction: BlipDirection, drone: Drone) {
    switch (direction) {
        case BlipDirection.BL:
            return middlePointOf(middleLow(drone.x), middleHigh(drone.y));
        case BlipDirection.BR:
            return middlePointOf(middleHigh(drone.x), middleHigh(drone.y));
        case BlipDirection.TL:
            return middlePointOf(middleLow(drone.x), middleLow(drone.y));
        case BlipDirection.TR:
            return middlePointOf(middleHigh(drone.x), middleLow(drone.y));
    }
}

function isLightOn(x: number, drone: Drone) {
    if (drone.battery <= 4) {
        return 0;
    }
    if (x < 2000 || x > 8000) {
        return 1;
    }

    return 0;
}

function getDirection(drone: Point, monster: Point): BlipDirection {
    let direction;

    if (drone.y > monster.y) {
        direction += 'B';
    } else {
        direction += 'T';
    }

    if (drone.x > monster.x) {
        direction += 'R';
    } else {
        direction += 'L';
    }

    return BlipDirection[direction];
}

function whereIsNemo(drone: Drone, fishesMap: Record<number, Creature>, boundaries: Boundaries): string {
    if (drone.scannedCreatures.length > 5) {
        return endGameAction(drone);
    }
    let toScan = Object.values(fishesMap)
        .filter(f => !f.scanned && f.visible)
        .reduce(findNearestTarget(drone), DEFAULT_TARGET_CANDIDATE);

    if (!toScan.target) {
        const bestDirection: BlipDirection = getBestDirection(drone);

        if (!bestDirection) {
            return savePoints(drone);
        }

        toScan = getMiddlePoint(bestDirection, drone);
        console.error(drone.x, drone.y, bestDirection, toScan.target);
    }

    const newX = fixCoordinate(boundaries.xMin, boundaries.xMax)(toScan.target.x);
    const newY = fixCoordinate(boundaries.yMin, boundaries.yMax)(toScan.target.y);
    const lightOn = isLightOn(newX, drone);
    return `MOVE ${newX} ${newY} ${lightOn}`;
}

function savePoints(drone: Drone) {
    drone.persistentAction = moveToSurface(drone, false);
    return moveToSurface(drone, false);
}

function endGameAction(drone: Drone) {
    return moveToSurface(drone, drone.battery > 4);
}

function moveToSurface(drone: Drone, useLights: boolean) {
    return `MOVE ${drone.x} 500 ${useLights ? 1 : 0}`;
}

function resetPersistentActionIfDone(drone: Drone) {
    const action = drone.persistentAction;

    if (action.startsWith('WAIT')) {
        drone.persistentAction = '';
        return;
    }

    const [verb, x, y, usingLight] = action.split(' ');
    console.error('Checking persistent action', drone.x, x, drone.y, y)

    if (drone.x === parseInt(x) && drone.y === parseInt(y)) {
        drone.persistentAction = '';
        return;
    }
}

/**
 * Score points by scanning valuable fish faster than your opponent.
 **/

const creatureCount: number = parseInt(readline());
for (let i = 0; i < creatureCount; i++) {
    var inputs: string[] = readline().split(' ');
    const creatureId: number = parseInt(inputs[0]);
    const color: number = parseInt(inputs[1]);
    const type: number = parseInt(inputs[2]);
    updateFish(creatureId, color, type);
}

// game loop
while (true) {
    const myScore: number = parseInt(readline());
    const foeScore: number = parseInt(readline());
    const myScanCount: number = parseInt(readline());
    state.turn++;
    state.me.score = myScore;
    resetVisibility();
    for (let i = 0; i < myScanCount; i++) {
        const creatureId: number = parseInt(readline());
    }
    const foeScanCount: number = parseInt(readline());
    for (let i = 0; i < foeScanCount; i++) {
        const creatureId: number = parseInt(readline());
    }
    const myDroneCount: number = parseInt(readline());
    for (let i = 0; i < myDroneCount; i++) {
        var inputs: string[] = readline().split(' ');
        const droneId: number = parseInt(inputs[0]);
        const droneX: number = parseInt(inputs[1]);
        const droneY: number = parseInt(inputs[2]);
        const emergency: number = parseInt(inputs[3]);
        const battery: number = parseInt(inputs[4]);

        console.error('DRONE !', droneId, droneX, droneY)

        if (emergency === 1) {
            state.me.drones[droneId].scannedCreatures.forEach(creatureId => {
                state.me.scannedCreatures = state.me.scannedCreatures.filter(c => c !== creatureId);
                FISHES[creatureId].scanned = false;
            });
        }
        const lastAction = state.me.drones[droneId]?.persistentAction;
        state.me.drones[droneId] = {
            id: droneId,
            x: droneX,
            y: droneY,
            battery,
            emergency,
            creaturesDirection: {
                TL: [],
                TR: [],
                BL: [],
                BR: []
            },
            density: {
                TL: 0,
                TR: 0,
                BL: 0,
                BR: 0
            },
            areas: getDroneAreas(droneX, droneY),
            scannedCreatures: [],
            visibleMonsters: [],
            dangerousDirections: {
                TL: 0,
                TR: 0,
                BL: 0,
                BR: 0
            },
            persistentAction: lastAction ?? '',
        }
    }
    const foeDroneCount: number = parseInt(readline());
    for (let i = 0; i < foeDroneCount; i++) {
        var inputs: string[] = readline().split(' ');
        const droneId: number = parseInt(inputs[0]);
        const droneX: number = parseInt(inputs[1]);
        const droneY: number = parseInt(inputs[2]);
        const emergency: number = parseInt(inputs[3]);
        const battery: number = parseInt(inputs[4]);
    }
    const droneScanCount: number = parseInt(readline());
    for (let i = 0; i < droneScanCount; i++) {
        var inputs: string[] = readline().split(' ');
        const droneId: number = parseInt(inputs[0]);
        const creatureId: number = parseInt(inputs[1]);

        if (!state.me.drones[droneId]) {
            continue;
        }
        state.me.drones[droneId].scannedCreatures.push(creatureId);
        if (!FISHES[creatureId].scanned) {
            FISHES[creatureId].scanned = true;
            state.me.scannedCreatures.push(creatureId);
        }
    }
    const visibleCreatureCount: number = parseInt(readline());
    for (let i = 0; i < visibleCreatureCount; i++) {
        var inputs: string[] = readline().split(' ');
        const creatureId: number = parseInt(inputs[0]);
        const creatureX: number = parseInt(inputs[1]);
        const creatureY: number = parseInt(inputs[2]);
        const creatureVx: number = parseInt(inputs[3]);
        const creatureVy: number = parseInt(inputs[4]);

        FISHES[creatureId].visible = true;
        FISHES[creatureId].x = creatureX;
        FISHES[creatureId].y = creatureY;
        FISHES[creatureId].vX = creatureVx;
        FISHES[creatureId].vY = creatureVy;

        if (FISHES[creatureId].type === -1) {
            const nearestDrone = Object.values(state.me.drones).reduce(findNearestTarget(FISHES[creatureId]), DEFAULT_TARGET_CANDIDATE).target;
            state.me.drones[nearestDrone.id].visibleMonsters.push(FISHES[creatureId]);
            state.me.drones[nearestDrone.id].dangerousDirections[getDirection(nearestDrone, FISHES[creatureId])]++;
        }
    }
    const radarBlipCount: number = parseInt(readline());
    state.blipsCount = radarBlipCount / Object.keys(state.me.drones).length;
    for (let i = 0; i < radarBlipCount; i++) {
        var inputs: string[] = readline().split(' ');
        const droneId: number = parseInt(inputs[0]);
        const creatureId: number = parseInt(inputs[1]);
        const radar: string = inputs[2];

        const currentFish = FISHES[creatureId];
        const currentDrone = state.me.drones[droneId];
        if (currentFish.scanned) {
            continue;
        }

        if (currentFish.type === -1) {
            // currentDrone.density[radar] = -1 / currentDrone.areas[radar];
            console.error('do something here ?');
        } else {
            currentDrone.density[radar] += 1 / currentDrone.areas[radar];
        }
        currentDrone.creaturesDirection[creatureId] = BlipDirection[radar];
    }

    let droneIndex = 0;
    const xStep = Math.floor(10_000 / Object.values(state.me.drones).length);
    Object.values(state.me.drones).forEach(currentDrone => {
        let action = 'WAIT 1';
        try {
            console.error(state.blipsCount - state.me.scannedCreatures.length, 'Missing scans ?')
            if (currentDrone.persistentAction) {
                action = currentDrone.persistentAction;
                resetPersistentActionIfDone(currentDrone);
            } else if (state.turn >= 185 || state.me.scannedCreatures.length >= state.blipsCount) {
                action = endGameAction(currentDrone);
            } else if (currentDrone.visibleMonsters.length > 0 && currentDrone.scannedCreatures.length > 0) {
                action = savePoints(currentDrone);
            } else {
                const boundaries: Boundaries = {
                    xMin: droneIndex * xStep,
                    xMax: (droneIndex + 1) * xStep,
                    yMin: 2_500,
                    yMax: 9_600,
                }
                action = whereIsNemo(currentDrone, FISHES, boundaries);
            }
        } catch (e) {
            console.error(e);
        }

        console.log(action);
        droneIndex++;
    });
}
