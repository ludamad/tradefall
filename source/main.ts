import { createGameState, generateActions, ConnectionTier, doAction, score } from "./game";
import { consoleFlush, withLogDisabled } from "./log";
import { generateConnect, onConnectDayStart } from "./connect";
import { MCTS } from "./ai/mcts";
const seedrandom = require('seedrandom');

// const MAX_DAYS = 20;

seedrandom('hello.', { global: true });
const state = createGameState('Orlface')
for (var i = 0; i < 2; i++) {
    state.connections.push(generateConnect(ConnectionTier.JUNKIE, false));
    state.connections.push(generateConnect(ConnectionTier.JUNKIE, true));
    state.connections.push(generateConnect(ConnectionTier.JUNKIE, true));
    state.connections.push(generateConnect(ConnectionTier.JUNKIE, false));
    state.connections.push(generateConnect(ConnectionTier.JUNKIE, false));
}
function simulate() {
    for (var i = 0; i < 10000; i++) {
        seedrandom(`hello${i}`, { global: true });
        const mcts = new MCTS(state);
        const [mctsAction, mctsScore] = withLogDisabled(()=> {
            return mcts.selectMove();
        }) 
        console.log("START SCORE " + score(state).toFixed(1))
        console.log("Chosen: " + mctsAction.kind + ", predicted: " + mctsScore.toFixed(1));
        console.log("DAY " + state.day);
        doAction(state, mctsAction);
        consoleFlush();
        if (state.day > 30) {
            break;
        }
    }
}
withLogDisabled(simulate);