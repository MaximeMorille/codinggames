

/**
 * @param {number[][]} particles the list of coordinates of the particles, in nm
 * @return {number} The number of potential collisions
 */
function collisions(particles) {
    const mappedCollisions = {};

    function getCollisions([ testedX, testedY ]) {
        return particles.filter(([pX, pY]) => {
            if (testedX === pX && testedY === pY) {
                return false;
            }

            if (mappedCollisions[`${pX}_${pY}`][`${testedX}_${testedY}`]) {
                return false;
            }

            console.error(testedX, testedY, pX, pY, Math.sqrt(Math.pow(testedX - pX, 2) + Math.pow(testedY - pY, 2)))

            return Math.sqrt(Math.pow(testedX - pX, 2) + Math.pow(testedY - pY, 2)) < 1000;
        });
    }

    particles.forEach(particle => getCollisions(particle).forEach(([x, y]) => {
        if (!mappedCollisions) {
            mappedCollisions[`${x}_${y}`] = {};
        }
        mappedCollisions[`${x}_${y}`][`${particle.x}_${particle.y}`] = 1;
    }));

    console.error(mappedCollisions);

    return Object.keys(mappedCollisions)
                 .reduce((count, key) => count + Object.keys(mappedCollisions[key]).length, 0);
}



/* Ignore and do not change the code below */

/**
 * Try a solution
 * @param nCollisions The number of potential collisions
 */
function trySolution(nCollisions) {
    console.log('' + JSON.stringify(nCollisions));
}
trySolution(collisions(
    JSON.parse(readline())
));

/* Ignore and do not change the code above */
