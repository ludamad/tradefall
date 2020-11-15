// All game logic, amenable to simulation

import { basePrice, connectCost, randomName, randomNickname } from "./formulas";
import { sum, removeOne } from "./jsUtils";
import { log } from "./log";
import { onConnectDayStart } from "./connect";

export enum ConnectionTier {
    JUNKIE = 0,
    DEALER = 1,
    BIG_SHOT = 2,
    SUPPLIER = 3,
    MOB_BOSS = 4,
    DON = 5
}

export interface PlayerDealAction {
    kind: 'buy' | 'sell';
    daysLeft: number;
    amount: number;
    cost: number;
}

export interface Connection {
    name: string;
    tier: ConnectionTier;
    priceQuality: number;
    dealChance: number;
    dealSize: number;
    // If the connection sells to the player,
    // it is liable to be obsoleted.
    // For that reason, these all flip on *levelup*
    sellsToPlayer: boolean;
    outstandingDeals: PlayerDealAction[];
}

export interface PlayerConnectAction {
    kind: 'connect';
    connection: Connection;
    cost: number;
    daysLeft: number;
}

export interface PlayerEndDayAction {
    kind: 'end-day';
}

export type Action = PlayerConnectAction | PlayerDealAction | PlayerEndDayAction;

export interface GameState {
    day: number;
	name: string;
	// in dollars
    money: number;
    // Based on total traffic, shown as levelup - 100 grams for level 2?
    tier: ConnectionTier;
	// 1 to 100
	health: number;
	// tolerance amount, amount in grams to "get high"
	tolerance: number;
	// drug amount in grams
	stash: number;
	energy: number;
	totalTraffic: number;
	todayUse: number;
	totalUse: number;
	drugName: string;
    drugNickName: string;
    // Ties to others
    connections: Connection[];
    outstandingConnects: PlayerConnectAction[];
}

export function totalWorth(gamestate: GameState) {
    return gamestate.money + basePrice(gamestate.stash);
}

export function score(gamestate: GameState, stashAdjust=0, moneyAdjust=0) {
    // TODO, more
    return gamestate.money + moneyAdjust
        + basePrice(gamestate.stash + stashAdjust)
        + connectCost(gamestate.tier)
        + sum(gamestate.connections, (c: Connection) => connectCost(c.tier)/2);
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

export function generateDealActions(gameState: GameState): PlayerDealAction[] {
    const actions: PlayerDealAction[] = [];
    for (const connection of gameState.connections) {
        for (const deal of connection.outstandingDeals) {
            if (canAffordDeal(gameState, deal)) {
                actions.push(deal);
            }
        }
    }
    return actions;
}

export function canAffordConnect({money}: GameState, {cost}: PlayerConnectAction) {
    return cost <= money;
}

export function generateConnectActions(gameState: GameState): PlayerConnectAction[] {
    return gameState.outstandingConnects.filter(c => canAffordConnect(gameState, c));
}

export function generateActions(gameState: GameState): Action[] {
    const actions: Action[] = [];
    if (gameState.energy > 0) {
        for (const action of generateDealActions(gameState)) {
            actions.push(action);
        }
        for (const action of generateConnectActions(gameState)) {
            actions.push(action);
        }
    }
    actions.push({
        kind: 'end-day'
    });
    return actions;
}

export function doAction(gameState: GameState, action: Action) {
    if (action.kind === "connect") {
        gameState.energy -= 1;
        gameState.money -= action.cost;
        gameState.connections.push(action.connection);
        removeOne(gameState.outstandingConnects, action);
    } else if (action.kind === "buy" || action.kind === "sell") {
        gameState.energy -= 1;
        if (action.kind === "buy") {
            gameState.money -= action.cost;
            gameState.stash += action.amount;
        } else {
            gameState.money += action.cost;
            gameState.stash -= action.amount;
        }
        for (const {outstandingDeals} of gameState.connections) {
            if (removeOne(outstandingDeals, action)) {
                break;
            }
        }
    } else if (action.kind === 'end-day') {
        gameState.day += 1;
        gameState.energy = 4;
        log(`DAY ${gameState.day}`);
        for (const connection of gameState.connections) {
            onConnectDayStart(connection);
        }
    } else {
        throw new Error("Unexpected");
    }
}

export function createGameState(name: string): GameState {
	return {
        day: 1,
		name,
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
        outstandingConnects: []
	};
}
