import { clamp, rand, randRange } from "./jsUtils";
import { basePrice } from "./formulas";
import { log } from "./log";
import { Connection, ConnectionTier, PlayerDealAction, GameState } from "./types";

const faker = require("faker");
const gaussian = require('gaussian');
const priceQualityDistribution = gaussian(1.05, .1);
const dealChanceDistribution = gaussian(.5, .02);

export function connectToString({name, tier, dealChance, sellsToPlayer, priceQuality, dealSize}: Connection) {
    const buyerPrefix = sellsToPlayer ? "Seller" : "Buyer";
    return `${buyerPrefix} ${name}: Tier ${tier+1} Chance ${Math.round(dealChance * 100)}% Fairness ${Math.round(priceQuality * 100)}% Amount ${Math.round(dealSize * 100)}%`;
}

export function generateConnect(tier: ConnectionTier, sellsToPlayer: boolean): Connection {
    const seed = Math.random();
    const priceQuality = clamp(priceQualityDistribution.ppf(seed), .90, 2)
    const dealChance = clamp(dealChanceDistribution.ppf(1 - seed), .25, 1.0)
    const dealSize = clamp(priceQualityDistribution.ppf(Math.random()), .5, 2)
    const connection: Connection = {
        name: faker.internet.userName(),
        tier,
        dealChance,
        priceQuality,
        dealSize,
        sellsToPlayer,
        outstandingDeals: []
    };
    log(connectToString(connection));
    return connection;
}

export function getSellRange(connection: Connection): [number, number] {
    const lowGrams = 3 * (2 ** connection.tier);
    const highGrams = 10 * (2 ** connection.tier);
    return [connection.dealSize * lowGrams, connection.dealSize * highGrams];
}

export function getBuyRange(connection: Connection): [number, number] {
    const lowGrams = 10 * (2 ** connection.tier)
    const highGrams = 20 * (2 ** connection.tier)
    return [connection.dealSize * lowGrams, connection.dealSize * highGrams];
}

export function dealToString({name}: Connection, {daysLeft, kind, cost, amount}: PlayerDealAction) {
    const moneyPrefix = kind === 'buy' ? "-" : "+";
    const drugsPrefix = kind !== 'buy' ? "-" : "+";
    const rate = cost / amount;
    return `${daysLeft} days ${moneyPrefix}$${cost.toFixed(2)} ${drugsPrefix}${amount.toFixed(1)}g from ${name} ($${rate.toFixed(2)}/g)`
}

export function dealToStringBrute({connections}: GameState, deal: PlayerDealAction) {
    for (const conn of connections) {
        if (conn.outstandingDeals.includes(deal)) {
            return dealToString(conn, deal);
        }
    }
    return "?";
}

export function onConnectDayStart(connection: Connection) {
    const deals: PlayerDealAction[] = [];
    for (const deal of connection.outstandingDeals) {
        deal.daysLeft -= 1;
        if (deal.daysLeft > 0) {
            deals.push(deal);
        }
    }
    if (deals.length <= 0 && Math.random() < connection.dealChance) {
        const isBuy = connection.sellsToPlayer;
        const isExplodingOffer = Math.random() < .1;
        const daysLeft = isExplodingOffer ? 1 : rand([2, 3, 4])
        const amountRange = isBuy ? getBuyRange(connection) : getSellRange(connection);
        const amount = randRange(amountRange[0], amountRange[1]);
        const priceQuality = connection.priceQuality * clamp(priceQualityDistribution.ppf(Math.random()), .9, 1.1);
        const cost = basePrice(amount) * (isBuy ? 1 / priceQuality : priceQuality);
        const newDeal: PlayerDealAction = {
            kind: isBuy ? 'buy' : 'sell',
            daysLeft,
            amount,
            cost
        };
        log(`New deal: ${dealToString(connection, newDeal)}`);
        deals.push(newDeal);
    }
    connection.outstandingDeals = deals;
}
