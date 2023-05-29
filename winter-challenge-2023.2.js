

/**
 * @param {number} protonsStart The initial number of protons
 * @param {number} neutronsStart The initial number of neutrons
 * @param {number} protonsTarget The desired number of protons
 * @param {number} neutronsTarget The desired number of neutrons
 * @return {string[]} 
 */
function solve(protonsStart, neutronsStart, protonsTarget, neutronsTarget) {
    const result = [];

    while (protonsStart < neutronsStart) {
        protonsStart++;
        result.push('PROTON');
    }


    while (neutronsStart < protonsStart) {
        neutronsStart++;
        result.push('NEUTRON');
    }

    while (protonsStart > 0) {
        protonsStart -= 2;
        neutronsStart -= 2;
        result.push('ALPHA');
    }

    while (protonsStart < protonsTarget) {
        protonsStart++;
        result.push('PROTON');
    }

    while (neutronsStart < neutronsTarget) {
        neutronsStart++;
        result.push('NEUTRON');
    }

    return result;
}



/* Ignore and do not change the code below */

/**
 * Try a solution
 */
function trySolution(recipe) {
    console.log('' + JSON.stringify(recipe));
}
trySolution(solve(
    JSON.parse(readline()),
    JSON.parse(readline()),
    JSON.parse(readline()),
    JSON.parse(readline())
));

/* Ignore and do not change the code above */
