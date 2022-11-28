/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

const factories = {};
const OWNERSHIP = ["ENNEMY", "NEUTRAL", "ME"];
let bombs = 2;
const bombed = [];
let turn = 0;
const NB_ATTACKING_BASES = 3;

function initIfNeededFactory(factory) {
  if (!factories[factory]) {
    factories[factory] = { id: factory, links: {} };
  }
}

function updateFactoryState(factory, state) {
  // console.error(`Current factory ${factory}`, factories[factory]);
  // console.error('State to change', state);
  factories[factory] = { ...factories[factory], ...state };
  // console.error(`Future factory ${factory}`, factories[factory]);
}

function addsLink(factory1, factory2, distance) {
  initIfNeededFactory(factory1);
  initIfNeededFactory(factory2);

  updateFactoryState(factory1, {
    links: { ...factories[factory1].links, ...{ [factory2]: distance } },
  });
  updateFactoryState(factory2, {
    links: { ...factories[factory2].links, ...{ [factory1]: distance } },
  });
}

function buildOrder(factory) {
  if (factory.troops <= 2) {
    return "WAIT";
  }

  return "OOPS";
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

function withNotFullProduction(factory) {
  return factory.production < 3;
}

function sortByDecreasingTroops(f1, f2) {
  return f2.troops - f1.troops;
}

function setTargetedHostileFactory(factory, notOwnedFactories) {
  const { factory: nearestHostile, distance: distanceToNearestHostile } =
    notOwnedFactories.reduce(
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
      { factory: undefined, distance: Number.POSITIVE_INFINITY, production: 0 }
    );
  updateFactoryState(factory.id, { nearestHostile, distanceToNearestHostile });

  return factories[factory.id];
}

function sortByNearestHostile(f1, f2) {
  return f1.distanceToNearestHostile - f2.distanceToNearestHostile;
}

function moveTroopsToNeedingBase(factory, toReinforce) {
  const candidate = toReinforce.reduce(
    (result, f) => {
      const currentDistance = f.links[factory.id];
      const isNearer = result && result.distance > currentDistance;

      if (isNearer) {
        return { ...f, distance: currentDistance };
      }

      return result;
    },
    { distance: Number.POSITIVE_INFINITY }
  );

  return `MOVE ${factory.id} ${candidate.id} 3;`;
}

function buildOrders(turn) {
  let [myFactories, notMine] = Object.keys(factories).reduce(
    ([tmpOwned, tmpNotOwned], id) => {
      if (factories[id].owner === "ME") {
        return [[...tmpOwned, factories[id]], tmpNotOwned];
      }
      return [tmpOwned, [...tmpNotOwned, factories[id]]];
    },
    [[], []]
  );

  const ennemiesWithProd3 = notMine.filter(
    (f) => f.owner === "ENNEMY" && f.production === 3
  );

  let bombCmd = "";
  if (myFactories.length > 0 && turn > 5) {
    for (let i = 0; i < ennemiesWithProd3.length; i++) {
      const toBomb = ennemiesWithProd3[i];
      if (bombs > 0 && !bombed.includes(toBomb.id)) {
        bombCmd += `BOMB ${myFactories.at(0).id} ${toBomb.id};`;
        bombed.push(toBomb.id);
        bombs--;
      }
    }
  }

  myFactories = myFactories.map((factory) =>
    setTargetedHostileFactory(factory, notMine)
  );

  const sortedFactories = myFactories
    .filter(withAtLeastFourTroops)
    .sort(sortByNearestHostile);
  const factorieswithAtLeastFourTroops = sortedFactories.slice(
    0,
    NB_ATTACKING_BASES
  );

  if (factorieswithAtLeastFourTroops.length === 0) {
    return "WAIT";
  }

  let increaseCmd = "";
  if (sortedFactories.length > NB_ATTACKING_BASES) {
    const toUpgrade = sortedFactories.slice(NB_ATTACKING_BASES);
    const toReinforce = myFactories
      .filter(withNotFullProduction)
      .filter(withLessThanTenTroops);
    increaseCmd = toUpgrade
      .filter(withAtLeastTenTroops)
      .map((f) => {
        if (f.production === 3) {
          return moveTroopsToNeedingBase(f, toReinforce);
        }
        return `INC ${f.id};`;
      })
      .join("");
  }

  return (
    bombCmd +
    increaseCmd +
    factorieswithAtLeastFourTroops.reduce((actualCommand, factory) => {
      let newCommand = "WAIT";

      if (factory.nearestHostile !== undefined) {
        newCommand = `MOVE ${factory.id} ${factory.nearestHostile.id} ${
          factory.troops - 3
        }`;
      }

      if (actualCommand === "") {
        return newCommand;
      }

      return `${actualCommand}; ${newCommand}`;
    }, "")
  );
}

const factoryCount = parseInt(readline()); // the number of factories
const linkCount = parseInt(readline()); // the number of links between factories
for (let i = 0; i < linkCount; i++) {
  var inputs = readline().split(" ");
  const factory1 = parseInt(inputs[0]);
  const factory2 = parseInt(inputs[1]);
  const distance = parseInt(inputs[2]);

  addsLink(factory1, factory2, distance);
}

console.error("START GAME LOOP!!!");

// game loop
while (true) {
  const entityCount = parseInt(readline()); // the number of entities (e.g. factories and troops)
  for (let i = 0; i < entityCount; i++) {
    var inputs = readline().split(" ");
    const entityId = parseInt(inputs[0]);
    const entityType = inputs[1];
    const arg1 = parseInt(inputs[2]);
    const arg2 = parseInt(inputs[3]);
    const arg3 = parseInt(inputs[4]);
    const arg4 = parseInt(inputs[5]);
    const arg5 = parseInt(inputs[6]);

    if (entityType === "FACTORY") {
      const owner = OWNERSHIP[arg1 + 1];
      updateFactoryState(entityId, { owner, troops: arg2, production: arg3 });
    }
  }

  const orders = buildOrders(turn);

  // Any valid action, such as "WAIT" or "MOVE source destination cyborgs"
  console.log(orders);
  turn++;
}
