
export const SKILLS = {
    attack: 1,
    defence: 2
};

type Skill = keyof typeof SKILLS;

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

export interface GameState {
    day: number;
    name: string;
    // in dollars
    money: number;
    menu: Menu;
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
