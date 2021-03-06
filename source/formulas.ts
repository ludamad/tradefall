import { ConnectionTier, Encounter, GameState, SKILL_TO_INDEX } from "./types";

export function baseGramsForPrice(price: number) {
    const BASE_MOD = 5.83119/1.09;
    const unit = Math.log(price / BASE_MOD)/Math.log(8)
    return 10**unit - 1
}
export function basePrice(grams: number) {
    grams = Math.max(grams, 0);
    // Hack formula
    const BASE_MOD = 5.83119/1.09;
    return 8 ** Math.log10(grams + 1) * BASE_MOD;
}

export function connectCost(tier: ConnectionTier) {
    return 2 ** tier * 30;
}

export function enounterSuccessChance(state: GameState, encounter: Encounter) {
    // TODO: Want to pass how much player invested here
    for (const check of encounter.checks) {
        const skillIndex = SKILL_TO_INDEX[check.skill];
        const playerSkill = state.skills[skillIndex];
        check.basis;
        // Something something of player skill vs basis
    }
}