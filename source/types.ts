import { random } from "./jsUtils";

export const REGION_TO_INDEX = {
  Questfall: 0,
  Pokit: 1,
  Clunk: 2,
  Rakit: 3,
  Elmsgrove: 4,
};

export const REGIONS = Object.keys(REGION_TO_INDEX) as Region[];

export type Region = keyof typeof REGION_TO_INDEX;

export interface RegionStats {
  region: Region;
  resourcePrices: ResourcePile[];
}

export const SKILL_TO_INDEX = {
  attack: 0,
  defence: 1,
  trading: 2,
  crafting: 3,
  information: 4,
};

export type Skill = keyof typeof SKILL_TO_INDEX;
export const SKILLS = Object.keys(SKILL_TO_INDEX) as Skill[];

export const RESOURCE_TO_INDEX = {
  Gold: 0,
  Silver: 1,
  Wheat: 2,
  Crystal: 3,
  Meat: 4,
  Iron: 5,
  Copper: 6,
  // sulfur: 7,
  Leather: 7,
  // silk: 8,
  // opium: 10,
  Wood: 7,
  Sugar: 8,
  Tobacco: 9,
};

export type Resource = keyof typeof RESOURCE_TO_INDEX;
export const RESOURCES = Object.keys(RESOURCE_TO_INDEX) as Resource[];

export interface SkillCheck {
  skill: Skill;
  basis: number;
}

export enum ConnectionTier {
  JUNKIE = 0,
  DEALER = 1,
  BIG_SHOT = 2,
  SUPPLIER = 3,
  MOB_BOSS = 4,
  DON = 5,
}

export interface PlayerDealAction {
  kind: "buy" | "sell";
  daysLeft: number;
  amount: number;
  resource: Resource;
  cost: number;
}

export interface Connection {
  name: string;
  tier: ConnectionTier;
  resource: Resource;
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
  kind: "connect";
  connection: Connection;
  cost: number;
  daysLeft: number;
}

export interface PlayerEndDayAction {
  kind: "end-day";
}
export interface SetMenuAction {
  kind: "set-menu";
  menu: Menu;
}
export interface PlayerTradeAction {
  kind: "trade";
  resource: Resource;
  isBuy: boolean;
  amount: number;
}

export type Action =
  | PlayerConnectAction
  | PlayerDealAction
  | PlayerEndDayAction
  | PlayerTradeAction
  | SetMenuAction;

export type Menu =
  | "Main"
  | "Quest"
  | "Resources"
  | "Items"
  | "Equities"
  | "Offer"
  | "Crafting"
  | "Travel";

export interface SkillLevel {
  skill: Skill;
  level: number;
}

export type ForegroundColor =
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  | "gray"
  | "grey"
  | "blackBright"
  | "redBright"
  | "greenBright"
  | "yellowBright"
  | "blueBright"
  | "magentaBright"
  | "cyanBright"
  | "whiteBright";

export interface GameStateLegacy {
  /////// START OF OLD STUFF - from drug game
  // Based on total traffic, shown as levelup - 100 grams for level 2?
  tier: ConnectionTier;
  // 1 to 100
  health: number;
  // Ties to others
  connections: Connection[];
  outstandingConnects: PlayerConnectAction[];
  /////// END OF OLD STUFF - from drug game
}

export interface ResourcePile {
  resource: Resource;
  amount: number;
}

export interface Encounter {
  type: "monster" | "trade";
  name: string;
  checks: SkillCheck[];
  daysLeft: number;
  energyCost: number;
  reward: ResourcePile[];
  rewardEncounter?: string;
}

export interface GameState extends GameStateLegacy {
  day: number;
  name: string;
  // fiat govt currency of Tradefall
  // in GP?
  money: number;
  menu: Menu;
  energy: number;
  region: Region;
  // Current available quests
  quests: Encounter[];
  // Indexed by skill index
  skills: SkillLevel[];
  // Indexed by resource index
  resources: ResourcePile[];
  // Indexed by region index
  regions: RegionStats[];
}
