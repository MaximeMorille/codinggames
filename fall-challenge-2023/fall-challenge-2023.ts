declare function readline(): any;

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
}

interface Drone extends Point {
    emergency: number;
    battery: number;
}

interface Player {
    score: number;
    scannedCreatures: Array<number>;
    drones: Array<Drone>;
}

interface Fall2023GameState {
    me: Player;
    opponent: Player;
    turn: number;
}

interface TargetCandidate {
    target?: Point;
    distance: number;
}

const DEFAULT_TARGET_CANDIDATE: TargetCandidate = { target: undefined, distance: Number.POSITIVE_INFINITY };

const FISHES: Record<number, Creature> = {};
const state: Fall2023GameState = {
    turn: 0,
    me: {
        drones: [],
        scannedCreatures: [],
        score: 0
    },
    opponent: null,
};

function distanceBetween(elt1: Point, elt2: Point): number {
    return Math.sqrt(Math.pow(elt1.x - elt2.x, 2) + Math.pow(elt1.y - elt2.y, 2));
}

function findNearestTarget(point: Point) {
    return ({ target, distance }: TargetCandidate, candidate: Point): TargetCandidate => {
        const candidateDistance = distanceBetween(point, candidate);

        console.error(candidate, candidateDistance, distance, target)

        if (candidateDistance < distance) {
            return { target: candidate, distance: candidateDistance };
        }

        return { target, distance };
    };
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
    };
}

function whereIsNemo(drone: Drone, fishesMap: Record<number, Creature>): string {
    let result = 'WAIT 1';

    const toScan = Object.values(fishesMap)
        .filter(f => !f.scanned)
        .reduce(findNearestTarget(drone), DEFAULT_TARGET_CANDIDATE);

    return `MOVE ${toScan.target.x} ${toScan.target.y} 0`;
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
    state.me.score = myScore;
    state.me.scannedCreatures = [];
    for (let i = 0; i < myScanCount; i++) {
        const creatureId: number = parseInt(readline());
        state.me.scannedCreatures.push(creatureId);
        FISHES[creatureId].scanned = true;
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

        state.me.drones.push({
            id: droneId,
            x: droneX,
            y: droneY,
            battery,
            emergency
        })
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
    }
    const visibleCreatureCount: number = parseInt(readline());
    for (let i = 0; i < visibleCreatureCount; i++) {
        var inputs: string[] = readline().split(' ');
        const creatureId: number = parseInt(inputs[0]);
        const creatureX: number = parseInt(inputs[1]);
        const creatureY: number = parseInt(inputs[2]);
        const creatureVx: number = parseInt(inputs[3]);
        const creatureVy: number = parseInt(inputs[4]);

        FISHES[creatureId].x = creatureX;
        FISHES[creatureId].y = creatureY;
        FISHES[creatureId].vX = creatureVy;
        FISHES[creatureId].vY = creatureVy;
    }
    const radarBlipCount: number = parseInt(readline());
    for (let i = 0; i < radarBlipCount; i++) {
        var inputs: string[] = readline().split(' ');
        const droneId: number = parseInt(inputs[0]);
        const creatureId: number = parseInt(inputs[1]);
        const radar: string = inputs[2];
    }
    for (let i = 0; i < myDroneCount; i++) {

        let action = 'WAIT 1';
        try {
            action = whereIsNemo(state.me.drones[i], FISHES);
        } catch (e) {
            console.error(e);
        }

        console.log(action);

    }
}
