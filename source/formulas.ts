// import util 
// import random
// import math

import { ConnectionTier } from "./game";
import { rand } from "./jsUtils";

const _NAME_START = [
    "dex", "rex", "phex", "acet",  
    "meth", "octan", "pharm", "dental",
    "dextr", "phenth", "amph", "retr", 
    "psych", "tryp", "deth", "cann", "sill", "amox"
];

const _NAME_END = [
    "adrine", "amine", "amphetamine", "idine", 
    "asidate", "olamine", "azole", "ecrine", 
    "edrine", "opane", "asatol", "armoral", "elline", "osamacide"
];

export function randomName() {
    return rand(_NAME_START) + rand(_NAME_END)
}

const _NICKNAME_START = ["black", "atomic", "street", "hell", "heaven", "gangster", "rave", "hippie", "punk", "special", "mind", "trip", "psycho", "insane", "junky"];
const _NICKNAME_END = ["powder", "candy", "pills", "M&Ms", "berries", "drops", "juice", "fuel", "junk", "stuff", "pops"];

export function randomNickname() {
    return rand(_NICKNAME_START) + " " + rand(_NICKNAME_END) 
}

export function baseGramsForPrice(price: number) {
    const BASE_MOD = 5.83119;
    const unit = Math.log(price / BASE_MOD)/Math.log(6)
    return 10**unit - 1
}
export function basePrice(grams: number) {
    grams = Math.max(grams, 0);
    // Hack formula
    const BASE_MOD = 5.83119;
    return 6 ** Math.log10(grams + 1) * BASE_MOD;
}

export function connectCost(tier: ConnectionTier) {
    return 2 ** tier * 30;
}