// All game logic, amenable to simulation

import { basePrice, connectCost } from "./formulas";
import { sum, removeOne, random } from "./jsUtils";
import { log } from "./log";
import { onConnectDayStart } from "./connect";
import { FINAL_DAY } from "./config";
import { GameState, PlayerDealAction, PlayerConnectAction, Action, ConnectionTier, RESOURCE_TO_INDEX, Resource, REGION_TO_INDEX, Region, ResourcePile, SKILL_TO_INDEX, Skill, REGIONS, SKILLS, RESOURCES } from "./types";

export function totalWorth(gamestate: GameState) {
    const {resources} = gamestate;
    let value = gamestate.money;
    for (const resource of resources) {
        value += resource.amount * 10;
    }
    return value;
}

export function isGameOver(gamestate: GameState) {
    return gamestate.day > FINAL_DAY;
}

export function score(gamestate: GameState) {
    let score = 0;
    for (const resource of gamestate.resources) {
        score += resource.amount * 10;
    }
    return gamestate.money; // + basePrice();
        // + connectCost(gamestate.tier)
        // + sum(gamestate.connections, (c: Connection) => connectCost(c.tier)/2);
}

export function canAffordDeal(
    state: GameState, 
    {kind, cost, amount, resource}: PlayerDealAction
): boolean {
    if (kind === 'buy') {
        return cost <= state.money;
    } else {
        return amount <= getResource(state, resource).amount;
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

export function getResource(state: GameState, resource: Resource) {
    return state.resources[RESOURCE_TO_INDEX[resource]];
}
export function getRegion(state: GameState, region: Region) {
    return state.regions[REGION_TO_INDEX[region]];
}
export function getSkill(state: GameState, skill: Skill) {
    return state.skills[SKILL_TO_INDEX[skill]];
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
                getResource(state, action.resource).amount += action.amount;
            } else {
                state.money += action.cost;
                getResource(state, action.resource).amount -= action.amount;
            }
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
		health: 100,
		energy: 4,
        connections: [],
        outstandingConnects: [],
        quests: [],
        resources: makeResourceSet(),
        regions: REGIONS.map((region: Region) => ({
            region,
            resourcePrices: RESOURCES.map((resource: Resource) => ({
                resource,
                amount: random([2,4,6])
            }))
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

