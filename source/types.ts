
export const REGION_TO_INDEX = {
    "Questfall": 0,
    "Pokit": 1,
    "Clunk": 2,
    "Rakit": 3,
    "Elmsgrove": 4
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
    information: 2,
};

export type Skill = keyof typeof SKILL_TO_INDEX;
export const SKILLS = Object.keys(SKILL_TO_INDEX) as Skill[];

export const RESOURCE_TO_INDEX = {
    gold: 0,
    silver: 1,
    wheat: 2,
    crystal: 3,
    meat: 4,
    iron: 5,
    copper: 6,
    sulfur: 7,
    leather: 8,
    silk: 9,
    opium: 10,
    wood: 11,
    rum: 12,
    sugar: 13,
    tobacco: 14,
    tools: 15
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
export interface SetMenuAction {
    kind: 'set-menu';
    menu: Menu;
}

export type Action = PlayerConnectAction | PlayerDealAction | PlayerEndDayAction | SetMenuAction;

export type Menu = 'main' | 'offer' | 'connect';

export interface SkillLevel {
    skill: Skill;
    level: number;
}

export interface GameStateLegacy {
    /////// START OF OLD STUFF - from drug game 
    // Based on total traffic, shown as levelup - 100 grams for level 2?
    tier: ConnectionTier;
    // 1 to 100
    health: number;
    // tolerance amount, amount in grams to "get high"
    tolerance: number;
    // drug amount in grams
    stash: number;
    totalTraffic: number;
    todayUse: number;
    totalUse: number;
    drugName: string;
    drugNickName: string;
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
    // Current available quests
    quests: Encounter[];
    // Indexed by skill index
    skills: SkillLevel[];
    // Indexed by resource index
    resources: ResourcePile[];
    // Indexed by region index
    regions: RegionStats[];
}
