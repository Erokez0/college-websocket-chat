import { ANIMAL_NAMES_TXT_URL } from "../consts";

export const getAnimals: () => Promise<string[]> = () => fetch(ANIMAL_NAMES_TXT_URL).then((res) => res.text()).then((text) => text.split("\n"))