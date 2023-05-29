

/**
 * @param {number[][]} grid The initial grid of elements
 * @param {Unknown[]} rules Transition rules between elements
 * @return {number[][]} 
 */
export function solve(grid, rules) {
    const resultingGridWidth = grid.length-1;
    const resultingGridHeight = grid[0].length-1;
    const resultingGrid = new Array(resultingGridWidth);

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            console.log(i, j);

            if (i-1 >= 0) {
                if (!resultingGrid[i-1]) {
                    resultingGrid[i-1] = new Array(resultingGridHeight);
                }
                if(j-1 >= 0 && !resultingGrid[i-1][j-1]) {
                    resultingGrid[i-1][j-1] = new Array(4);
                }
                if (j < resultingGridHeight && !resultingGrid[i-1][j]) {
                    resultingGrid[i-1][j] = new Array(4);
                }
            }
            
            if (i < resultingGridWidth) {
                if (!resultingGrid[i]) {
                    resultingGrid[i] = new Array(resultingGridHeight);
                }

                if (j-1 >= 0 && !resultingGrid[i][j-1]) {
                    resultingGrid[i][j-1] = new Array(4);
                }

                if (j < resultingGridHeight && !resultingGrid[i][j]) {
                    resultingGrid[i][j] = new Array(4);
                }
            }

            if (i-1 >= 0 && j-1 >= 0) {
                resultingGrid[i-1][j-1][3] = grid[i][j];
                console.log('pushUpperLeft', resultingGrid);
            }

            if (i-1 >= 0  && j < resultingGridHeight) {
                resultingGrid[i-1][j][2] = grid[i][j];
                console.log('pushUpperRight', resultingGrid);
            }

            if (i < resultingGridWidth && j-1 >= 0) {
                resultingGrid[i][j-1][1] = grid[i][j];
                console.log('pushLowerLeft', resultingGrid);
            }

            if (i < resultingGridWidth && j < resultingGridHeight) {
                resultingGrid[i][j][0] = grid[i][j];
                console.log('pushLowerRight', resultingGrid);
            }
        }
    }

    console.log(resultingGrid);


    const result = new Array(resultingGridWidth);

    for (let i = 0; i < resultingGridWidth; i++) {
        for (let j = 0; j < resultingGridHeight; j++) {
            const elementDefinition = resultingGrid[i][j];
            const [rule] = rules.filter(({ pattern }) => JSON.stringify(elementDefinition) === JSON.stringify(pattern));

            if (!result[i]) {
                result[i] = new Array(resultingGridHeight);
            }

            let value = 0;

            if (rule) {
                value = rule.result;
            }
            
            result[i][j] = value;
        }
    }

    return result;
}

/**
 * @typedef Unknown
 * @type {object}
 * @property {number[]} pattern 
 * @property {number} result 
 */


/* Ignore and do not change the code below */

/**
 * Try a solution
 */
function trySolution(newGrid) {
    console.log('' + JSON.stringify(newGrid));
}
// trySolution(solve(
//     JSON.parse(readline()),
//     JSON.parse(readline())
// ));

/* Ignore and do not change the code above */
