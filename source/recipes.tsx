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
    cost: ["Iron"],
  },
  "Iron Armor": {
    kind: "armor",
    stats: ["defence"],
    cost: ["Iron"],
  },
  "Silver Sword": {
    kind: "weapon",
    stats: ["attack"],
    cost: [/*major cost*/ "Silver", "Iron"],
  },
  "Silver Armor": {
    kind: "armor",
    stats: ["defence"],
    cost: [/*major cost*/ "Silver", "Iron"],
  },
  "Trading Amulet": {
    kind: "amulet",
    stats: ["trading"],
    cost: ["Wood", "Crystal"],
  },
  "Divination Amulet": {
    kind: "amulet",
    stats: ["information"],
    cost: ["Wood", "Crystal"],
  },
  Rum: {
    kind: "good",
    cost: ["Sugar"],
  },
  Tools: {
    kind: "good",
    cost: ["Iron"],
  },
  Bread: {
    kind: "good",
    cost: ["Wheat"],
  },
  Cigars: {
    kind: "good",
    cost: ["Tobacco"],
  },
  Jerky: {
    kind: "good",
    cost: ["Meat"],
  },
  Jewellery: {
    kind: "good",
    cost: ["Gold", "Crystal"],
  },
};

export type Item = keyof typeof ITEM_TABLE;
export const ITEMS: Item[] = Object.keys(ITEM_TABLE) as Item[];
