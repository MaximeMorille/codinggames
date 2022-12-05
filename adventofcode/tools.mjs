import fs from 'fs';

export function readFile(fileName) {
    return fs.readFileSync(fileName).toString();
}
