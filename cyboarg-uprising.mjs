/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
const FACTORIES = {};
const OWNERSHIP = ['ENNEMY', 'NEUTRAL', 'ME'];
let bombs = 2;
const bombed = [];
let turn = 0;
const NB_ATTACKING_BASES = 3;

function initIfNeededFactory(factory) {
    if (!FACTORIES[factory]) {
        FACTORIES[factory] = { id: factory, links: {} };
    }
}

function updateFactoryState(factoryId, state, debug = false) {
    debug && console.error(`Current factory ${factoryId}`, FACTORIES[factoryId]);
    debug && console.error('State to change', state);
    FACTORIES[factoryId] = { ...FACTORIES[factoryId], ...state };
    debug && console.error(`Future factory ${factoryId}`, FACTORIES[factoryId]);
}

function addsLink(factory1, factory2, distance) {
    initIfNeededFactory(factory1);
    initIfNeededFactory(factory2);

    updateFactoryState(factory1, {
        links: { ...FACTORIES[factory1].links, ...{ [factory2]: distance } },
    });
    updateFactoryState(factory2, {
        links: { ...FACTORIES[factory2].links, ...{ [factory1]: distance } },
    });
}

function withTroops(factory) {
    return factory.troops > 0;
}

function withAtLeastFourTroops(factory) {
    return factory.troops > 4;
}

function withAtLeastTenTroops(factory) {
    return factory.troops > 10;
}

function withLessThanTenTroops(factory) {
    return factory.troops < 10;
}

function withProduction(factory) {
    return factory.production > 0;
}

function withNotFullProduction(factory) {
    return factory.production < 3;
}

function sortByDecreasingTroops(f1, f2) {
    return f2.troops - f1.troops;
}

function setNearestAllyFactory(factory, allyFactories) {
    const { factory: nearestAlly, distance: distanceToNearestAlly } = searchMostProductiveAmongNearestFactory(
        factory,
        allyFactories
    );

    updateFactoryState(factory.id, { nearestAlly, distanceToNearestAlly });

    return FACTORIES[factory.id];
}

function setNeutralFactories(factory, factories) {
    function predicate(f1, f2) {
        const f1Distance = factory.links[f1.id];
        const f2Distance = factory.links[f2.id];

        if (f1Distance === f2Distance) {
            return f1.production - f2.production;
        }

        return f1Distance - f2Distance;
    }

    const sortedFactories = factories.sort(predicate);
    const { factory: nearestNeutral, distance: distanceToNearestNeutral } = searchMostProductiveAmongNearestFactory(
        factory,
        factories
    );

    updateFactoryState(factory.id, { nearestNeutral, distanceToNearestNeutral, neutrals: sortedFactories });

    return FACTORIES[factory.id];
}

function setNearestHostileFactory(factory, factories) {
    const { factory: nearestHostile, distance: distanceToNearestHostile } = searchMostProductiveAmongNearestFactory(
        factory,
        factories
    );

    updateFactoryState(factory.id, { nearestHostile, distanceToNearestHostile });

    return FACTORIES[factory.id];
}

function searchMostProductiveAmongNearestFactory(factory, factories) {
    return factories.reduce(
        (result, hostileFactory) => {
            const isProductive = result.production < hostileFactory.production;
            const isNearer = result.distance > hostileFactory.links[factory.id];

            if (isNearer && isProductive) {
                return {
                    factory: hostileFactory,
                    distance: hostileFactory.links[factory.id],
                    production: hostileFactory.production,
                };
            }

            if (isNearer) {
                return {
                    factory: hostileFactory,
                    distance: hostileFactory.links[factory.id],
                    production: hostileFactory.production,
                };
            }

            return result;
        },
        {
            factory: undefined,
            distance: Number.POSITIVE_INFINITY,
            production: 0,
        }
    );
}

function sortByNearestHostile(f1, f2) {
    return f1.distanceToNearestHostile - f2.distanceToNearestHostile;
}

function moveTroopsToNeedingBase(factory) {
    const movingTroops = 3;
    if (!factory.nearestAlly) {
        return `MSG missing ally for ${factory.id};`;
    }
    updateFactoryState(factory.id, { troops: factory.troops - movingTroops });
    return `MOVE ${factory.id} ${factory.nearestAlly.id} ${movingTroops};`;
}

function buildBombCommand(notMine, myFactories, turn) {
    const targets = notMine.filter((f) => (f.owner === 'ENNEMY' && f.production === 3) || turn === 0);

    let bombCmd = '';
    if (myFactories.length > 0) {
        for (let i = 0; i < targets.length; i++) {
            const toBomb = targets[i];
            if (bombs > 0 && !bombed.includes(toBomb.id)) {
                bombCmd += `BOMB ${myFactories.at(0).id} ${toBomb.id};`;
                bombed.push(toBomb.id);
                bombs--;
            }
        }
    }
    return bombCmd;
}

function buildIncreaseCommand(myFactories) {
    let increaseCmd = '';
    increaseCmd = myFactories
        .filter(withAtLeastTenTroops)
        .map((f) => {
            if (f.production === 3) {
                return moveTroopsToNeedingBase(f);
            }
            return `INC ${f.id};`;
        })
        .join('');
    return increaseCmd;
}

function buildAttackCommand(myFactories) {
    if (myFactories.length === 0) {
        return 'WAIT';
    }

    return myFactories.reduce((actualCommand, factory) => {
        let newCommand = '';
        let currentTroops = factory.troops;
        factory.neutrals.forEach((f) => {
            if (currentTroops > 0) {
                const force = f.troops + 1;
                newCommand += `MOVE ${factory.id} ${f.id} ${force};`;
                currentTroops -= force;
            }
        });

        if (currentTroops > 0 && factory.nearestHostile !== undefined) {
            newCommand += `MOVE ${factory.id} ${factory.nearestHostile.id} ${factory.troops};`;
        }

        if (newCommand === '') {
            newCommand = 'WAIT';
        }

        if (actualCommand === '') {
            return newCommand;
        }

        return `${actualCommand}; ${newCommand}`;
    }, '');
}

function cleanCommand(cmd) {
    let str = cmd.replaceAll(';;', ';');
    if (str.endsWith(';')) {
        return (str += 'WAIT');
    }
    return str;
}

function buildOrders(turn) {
    let [myFactories, neutralFactories, ennemyFactories] = Object.keys(FACTORIES).reduce(
        ([tmpOwned, tmpNeutral, tmpNotOwned], id) => {
            if (FACTORIES[id].owner === 'ME') {
                return [[...tmpOwned, FACTORIES[id]], tmpNeutral, tmpNotOwned];
            }
            if (FACTORIES[id].owner === 'NEUTRAL') {
                return [tmpOwned, [...tmpNeutral, FACTORIES[id]], tmpNotOwned];
            }
            return [tmpOwned, tmpNeutral, [...tmpNotOwned, FACTORIES[id]]];
        },
        [[], [], []]
    );

    myFactories = myFactories.map((factory) => {
        let enhancedFactory = setNearestAllyFactory(factory, myFactories.filter(withLessThanTenTroops));
        const neutralsWithProduction = neutralFactories.filter(withProduction);
        enhancedFactory = setNeutralFactories(enhancedFactory, neutralsWithProduction);
        enhancedFactory = setNearestHostileFactory(enhancedFactory, ennemyFactories);
        return enhancedFactory;
    });

    const bombCmd = buildBombCommand(ennemyFactories, myFactories, turn);
    const attackCmd = buildAttackCommand(myFactories.filter(withAtLeastFourTroops));
    const increaseCmd = buildIncreaseCommand(myFactories);

    return cleanCommand(bombCmd + increaseCmd + attackCmd);
}

const factoryCount = parseInt(readline()); // the number of factories
const linkCount = parseInt(readline()); // the number of links between factories
for (let i = 0; i < linkCount; i++) {
    var inputs = readline().split(' ');
    const factory1 = parseInt(inputs[0]);
    const factory2 = parseInt(inputs[1]);
    const distance = parseInt(inputs[2]);

    addsLink(factory1, factory2, distance);
}

console.error('START GAME LOOP!!!');

// game loop
while (true) {
    const entityCount = parseInt(readline()); // the number of entities (e.g. factories and troops)
    for (let i = 0; i < entityCount; i++) {
        var inputs = readline().split(' ');
        const entityId = parseInt(inputs[0]);
        const entityType = inputs[1];
        const arg1 = parseInt(inputs[2]);
        const arg2 = parseInt(inputs[3]);
        const arg3 = parseInt(inputs[4]);
        const arg4 = parseInt(inputs[5]);
        const arg5 = parseInt(inputs[6]);

        if (entityType === 'FACTORY') {
            const owner = OWNERSHIP[arg1 + 1];
            updateFactoryState(entityId, {
                owner,
                troops: arg2,
                production: arg3,
            });
        }
    }

    const orders = buildOrders(turn);

    // Any valid action, such as "WAIT" or "MOVE source destination cyborgs"
    console.log(orders);
    turn++;
}
