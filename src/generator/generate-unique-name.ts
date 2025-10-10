import { getAnimals } from "./get-animals";

let usedIndexes: number[][] = [[]];
let animals: string[];
function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function generateUniqueName() {
    if (!animals) {
        animals = await getAnimals();
    }
    let ix1: number, ix2: number;
    do {
        ix1 = getRandomInt(0, animals.length);
        ix2 = getRandomInt(0, animals.length);
    } while (!!usedIndexes.find( (value) => value[0] === ix1 && value[1] === ix2 ))

    usedIndexes.push([ix1, ix2]);

    return `${animals[ix1]}-${animals[ix2]}`;
}