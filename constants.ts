

import { StoreLevel, Settings } from "./types";

const today = new Date();
const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];


export const STORE_LEVELS: StoreLevel[] = [
    StoreLevel.WS1,
    StoreLevel.WS2,
    StoreLevel.RitelL,
    StoreLevel.Ritel,
    StoreLevel.Others,
];

export const DEFAULT_SETTINGS: Settings = {
    discounts: {
        [StoreLevel.WS1]: 1.5,
        [StoreLevel.WS2]: 0.75,
        [StoreLevel.RitelL]: 0,
        [StoreLevel.Ritel]: 0,
        [StoreLevel.Others]: 0,
    },
    deadline: endOfMonth,
}