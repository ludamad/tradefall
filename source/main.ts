import { createGameState, doAction, score, generateDealActions } from "./game";
import { consoleFlush, withLogDisabled } from "./log";
import { generateConnect, connectToString, dealToStringBrute } from "./connect";
import { MCTS } from "./ai/mcts";
import { FINAL_DAY } from "./config";
import { GameState, ConnectionTier } from "./types";
const seedrandom = require('seedrandom');

// const MAX_DAYS = 20;

seedrandom('hello.', { global: true });
const state = createGameState('Orlface')
export function simulate(state: GameState) {
    for (var i = 0; i < 40; i++) {
        state.outstandingConnects.push({
            kind: 'connect',
            connection: generateConnect(ConnectionTier.JUNKIE, i%2===0),
            daysLeft: 2,
            cost: 30
        });
    }
    consoleFlush();
    for (var i = 0; i < 10000; i++) {
        seedrandom(`hello${i}`, { global: true });
        const mcts = new MCTS(state);
        console.log(`... COMPUTING ACTION (${i+1}) ...`);
        const [mctsAction, mctsScore] = withLogDisabled(()=> {
            return mcts.selectMove();
        }) 
        if (mctsAction === undefined) {
            break;
        }
        console.log(`Chosen: ${mctsAction.kind}, predicted score: ${Math.round(mctsScore)}pts`);
        if (mctsAction.kind === "buy" || mctsAction.kind === "sell") {
            console.log(dealToStringBrute(state, mctsAction));
        } else if (mctsAction.kind === "connect") {
            console.log(connectToString(mctsAction.connection));
        } else if (mctsAction.kind === 'set-menu') {
            console.log("CLICKING ", mctsAction.menu);
        }
        console.log(`... STATS (${i+1}) ...`);
        console.log("DAY " + state.day);
        console.log(`STASH ${state.stash.toFixed(1)}g CASH $${state.money.toFixed(2)} SCORE ${Math.round(score(state))}pts`);
        console.log(`CONNECTS ${state.connections.length} DEALS ${generateDealActions(state).length} TRAFFIC ${state.totalTraffic.toFixed(1)}g`);
        console.log(`ENERGY ${state.energy} TIER ${state.tier}`);
        console.log(`... DONE ACTION (${i+1}) ...`);
        doAction(state, mctsAction);
        consoleFlush();
        if (state.day > FINAL_DAY) {
            break;
        }
    }
}
simulate(state);