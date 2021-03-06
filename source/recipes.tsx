import { Resource, Skill } from "./types";

export interface WeaponEntry {
  kind: "weapon";
  stats: Skill[];
  cost: Resource[];
}

export interface ArmorEntry {
  kind: "armor";
  stats: Skill[];
  cost: Resource[];
}

export interface AmuletEntry {
  kind: "amulet";
  stats: Skill[];
  cost: Resource[];
}

export interface GoodEntry {
  kind: "good";
  cost: Resource[];
}

export type ItemEntry = WeaponEntry | ArmorEntry | AmuletEntry | GoodEntry;

export const ITEM_TABLE: { [k: string]: ItemEntry } = {
  "Iron Sword": {
    kind: "weapon",
    stats: ["attack"],
    cost: ["iron"],
  },
  "Iron Armor": {
    kind: "armor",
    stats: ["defence"],
    cost: ["iron"],
  },
  "Silver Sword": {
    kind: "weapon",
    stats: ["attack"],
    cost: [/*major cost*/ "silver", "iron"],
  },
  "Silver Armor": {
    kind: "armor",
    stats: ["defence"],
    cost: [/*major cost*/ "silver", "iron"],
  },
  "Trading Amulet": {
    kind: "amulet",
    stats: ["trading"],
    cost: ["wood", "crystal"],
  },
  "Divination Amulet": {
    kind: "amulet",
    stats: ["information"],
    cost: ["wood", "crystal"],
  },
  Rum: {
    kind: "good",
    cost: ["sugar"],
  },
  Tools: {
    kind: "good",
    cost: ["iron"],
  },
  Bread: {
    kind: "good",
    cost: ["wheat"],
  },
  Cigars: {
    kind: "good",
    cost: ["tobacco"],
  },
  Jerky: {
    kind: "good",
    cost: ["meat"],
  },
  Jewellery: {
    kind: "good",
    cost: ["gold", "crystal"],
  },
};

export type Item = keyof typeof ITEM_TABLE;
export const ITEMS: Item[] = Object.keys(ITEM_TABLE) as Item[];
