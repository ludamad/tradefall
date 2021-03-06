// All game logic, amenable to simulation

import { basePrice, connectCost, randomName, randomNickname } from "./formulas";
import { sum, removeOne } from "./jsUtils";
import { log } from "./log";
import { onConnectDayStart } from "./connect";
import { FINAL_DAY } from "./config";
import { GameState, PlayerDealAction, PlayerConnectAction, Action, ConnectionTier, RESOURCE_TO_INDEX, Resource, REGION_TO_INDEX, Region, ResourcePile, SKILL_TO_INDEX, Skill, REGIONS, SKILLS, RESOURCES } from "./types";

export function totalWorth(gamestate: GameState) {
    return gamestate.money + basePrice(gamestate.stash);
}

export function isGameOver(gamestate: GameState) {
    return gamestate.day > FINAL_DAY;
}

export function score(gamestate: GameState, stashAdjust=0, moneyAdjust=0) {
    // TODO, more
    return gamestate.money + moneyAdjust
        + basePrice(gamestate.stash + stashAdjust);
        // + connectCost(gamestate.tier)
        // + sum(gamestate.connections, (c: Connection) => connectCost(c.tier)/2);
}

export function canAffordDeal(
    {money, stash}: GameState, 
    {kind, cost, amount}: PlayerDealAction
): boolean {
    if (kind === 'buy') {
        return cost <= money;
    } else {
        return amount <= stash;
    }
}

export function getPotentialDealActions(state: GameState): PlayerDealAction[] {
    const actions: PlayerDealAction[] = [];
    for (const connection of state.connections) {
        for (const deal of connection.outstandingDeals) {
            actions.push(deal);
        }
    }
    return actions;
}

export function generateDealActions(state: GameState): PlayerDealAction[] {
    const actions: PlayerDealAction[] = [];
    for (const connection of state.connections) {
        for (const deal of connection.outstandingDeals) {
            if (canAffordDeal(state, deal)) {
                actions.push(deal);
            }
        }
    }
    return actions;
}

export function canAffordConnect({money}: GameState, {cost}: PlayerConnectAction) {
    return cost <= money;
}

export function generateConnectActions(state: GameState): PlayerConnectAction[] {
    return state.outstandingConnects.filter(c => canAffordConnect(state, c));
}

export function generateActions(state: GameState): Action[] {
    const connects = state.energy <= 0 ? [] : generateConnectActions(state);
    const deals = state.energy <= 0 ? [] : generateDealActions(state);
    switch (state.menu) {
        case "main":
            const options:Action[] = [{kind: 'end-day'}];
            if (deals.length > 0) {
                options.push({kind: 'set-menu', menu: 'offer'});
            }
            if (connects.length > 0) {
                options.push({kind: 'set-menu', menu: 'connect'});
            }
            return options;
        case "connect":
            return connects;
        case "offer":
            return deals;
        default:
            throw new Error("UNEXPECTED");
    }
}

export function doAction(state: GameState, action: Action) {
    switch (action.kind) {
        case "connect":
            state.energy -= 1;
            state.money -= action.cost;
            state.connections.push(action.connection);
            removeOne(state.outstandingConnects, action);
            state.menu = 'main';
            return;
        case "buy":
        case "sell":
            state.energy -= 1;
            if (action.kind === "buy") {
                state.money -= action.cost;
                state.stash += action.amount;
            } else {
                state.money += action.cost;
                state.stash -= action.amount;
            }
            // Always up total traffic
            state.totalTraffic += action.amount;
            for (const {outstandingDeals} of state.connections) {
                if (removeOne(outstandingDeals, action)) {
                    break;
                }
            }
            state.menu = 'main';
            return;
        case "end-day":
            state.day += 1;
            state.energy = 4;
            log(`DAY ${state.day}`);
            for (const connection of state.connections) {
                onConnectDayStart(connection);
            }
            state.menu = 'main';
            return;
        case "set-menu":
            state.menu = action.menu;
            return;
        default:
            throw new Error("Unexpected");
    }
}

export function createGameState(name: string): GameState {
	return {
        day: 1,
        name,
        menu: 'main',
        money: 300,
        tier: ConnectionTier.JUNKIE,
		tolerance: 1,
		stash: 28,
		health: 100,
		energy: 4,
        totalTraffic: 28,
		// In doses
		todayUse: 1,
		totalUse: 0,
		drugName: randomName(),
        drugNickName: randomNickname(),
        connections: [],
        outstandingConnects: [],
        quests: [],
        resources: makeResourceSet(),
        regions: REGIONS.map((region: Region) => ({
            region,
            // TODO set prices
            resourcePrices: makeResourceSet()
        })),
        skills: SKILLS.map((skill: Skill) => ({
            skill,
            level: 1
        })),
	};
}

function makeResourceSet(): ResourcePile[] {
    return RESOURCES.map((resource: Resource) => ({
        resource,
        amount: 0
    }));
}

