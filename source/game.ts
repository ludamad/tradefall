// All game logic, amenable to simulation

import { basePrice, connectCost } from "./formulas";
import { sum, removeOne, random } from "./jsUtils";
import { log } from "./log";
import { onConnectDayStart } from "./connect";
import { FINAL_DAY } from "./config";
import {
  GameState,
  PlayerDealAction,
  PlayerConnectAction,
  Action,
  ConnectionTier,
  RESOURCE_TO_INDEX,
  Resource,
  REGION_TO_INDEX,
  Region,
  ResourcePile,
  SKILL_TO_INDEX,
  Skill,
  REGIONS,
  SKILLS,
  RESOURCES,
  RegionStats,
} from "./types";

export function totalWorth(gamestate: GameState) {
  const { resources } = gamestate;
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
  { kind, cost, amount, resource }: PlayerDealAction
): boolean {
  if (kind === "buy") {
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

export function lowestPrice(
  state: GameState,
  resource: Resource
): [number, Region] {
  let lowest = 999999;
  let lowestRegion: Region | undefined = undefined;
  for (const region of state.regions) {
    const p = regionBasePrice(region, resource);
    if (p < lowest) {
      lowest = p;
      lowestRegion = region.region;
    }
  }
  return [lowest, lowestRegion as Region];
}

export function regionBasePrice(region: RegionStats, resource: Resource) {
  return region.resourcePrices[RESOURCE_TO_INDEX[resource]].amount;
}

export function highestPrice(
  state: GameState,
  resource: Resource
): [number, Region] {
  let highest = -1;
  let highestRegion: Region | undefined = undefined;
  for (const region of state.regions) {
    const p = regionBasePrice(region, resource);
    if (p > highest) {
      highest = p;
      highestRegion = region.region;
    }
  }
  return [highest, highestRegion as Region];
}

export function generateActions(state: GameState): Action[] {
  const deals = state.energy <= 0 ? [] : generateDealActions(state);
  switch (state.menu) {
    case "Main":
      const options: Action[] = [{ kind: "end-day" }];
      if (deals.length > 0) {
        options.push({ kind: "set-menu", menu: "Offer" });
      }
      options.push({ kind: "set-menu", menu: "Crafting" });
      options.push({ kind: "set-menu", menu: "Equities" });
      options.push({ kind: "set-menu", menu: "Items" });
      options.push({ kind: "set-menu", menu: "Quest" });
      options.push({ kind: "set-menu", menu: "Resources" });
      options.push({ kind: "set-menu", menu: "Travel" });
      return options;
    case "Offer":
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
export function getRegionResource(
  region: RegionStats,
  resource: Resource
): ResourcePile {
  const resourceIndex = RESOURCE_TO_INDEX[resource];
  return region.resourcePrices[resourceIndex];
}
export function getSkill(state: GameState, skill: Skill) {
  return state.skills[SKILL_TO_INDEX[skill]];
}

export function getLocalPrice(state: GameState, resource: Resource): number {
  return getRegionResource(getRegion(state, state.region), resource).amount;
}

export function doAction(state: GameState, action: Action) {
  switch (action.kind) {
    case "connect":
      state.energy -= 1;
      state.money -= action.cost;
      state.connections.push(action.connection);
      removeOne(state.outstandingConnects, action);
      state.menu = "Main";
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
      for (const { outstandingDeals } of state.connections) {
        if (removeOne(outstandingDeals, action)) {
          break;
        }
      }
      state.menu = "Main";
      return;
    case "end-day":
      state.day += 1;
      state.energy = 4;
      log(`DAY ${state.day}`);
      for (const connection of state.connections) {
        onConnectDayStart(connection);
      }
      state.menu = "Main";
      return;
    case "set-menu":
      state.menu = action.menu;
      return;
    default:
      throw new Error("Unexpected");
  }
}

const gaussian = require("gaussian");
const priceDistribution = gaussian(10, 5);

export function createGameState(name: string): GameState {
  return {
    day: 1,
    name,
    menu: "Main",
    money: 300,
    tier: ConnectionTier.JUNKIE,
    health: 100,
    energy: 4,
    region: "Questfall",
    connections: [],
    outstandingConnects: [],
    quests: [],
    resources: makeResourceSet(),
    regions: REGIONS.map((region: Region) => ({
      region,
      resourcePrices: RESOURCES.map((resource: Resource) => ({
        resource,
        amount: Math.max(4, priceDistribution.ppf(Math.random())),
      })),
    })),
    skills: SKILLS.map((skill: Skill) => ({
      skill,
      level: 1,
    })),
  };
}

export function getSpread(_state: GameState, _resource: Resource) {
  return 1.25;
}

function makeResourceSet(): ResourcePile[] {
  return RESOURCES.map((resource: Resource) => ({
    resource,
    amount: 0,
  }));
}
