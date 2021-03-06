import { generateActions, score, doAction, isGameOver, generateDealActions, generateConnectActions, getPotentialDealActions, canAffordDeal, totalWorth } from "../game"
import assert = require("assert");
import { removeOne } from "../jsUtils";
import { connectCost } from "../formulas";
import { FINAL_DAY } from "../config";
import { GameState, Action, PlayerDealAction, Connection } from "../types";

const clone = require('fast-clone');

export class MCTSNode {
    visits: number
    totalScore: number
    numUnexpandedMoves: any;
    children: Array<MCTSNode|undefined>;
    score() {
        return this.totalScore / Math.max(this.visits, 1);
    }
    constructor(public state: GameState, public moves: Action[], public parent: MCTSNode | undefined) {
        this.parent = parent;
        this.visits = 0;
        this.totalScore = 0;
        this.numUnexpandedMoves = moves.length;
        this.children = new Array(this.numUnexpandedMoves).fill(undefined);
    }
    debugPrint(indent=0) {
        if (this.visits <= 10) {
            return;
        }
        let str = '';
        for (let i = 0; i < indent; i++) {
            str += '  ';
        }
        console.log(str + "Visits: " + this.visits + " Score: " + this.score().toFixed(0) + " Menu: " + this.state.menu);
        for (const child of this.children) {
            if (child) {
                child.debugPrint(indent + 1);
            }
        }
    }
}

function simDeal(state: GameState, {kind, cost, amount}: PlayerDealAction) {
    state.energy -= 1;
    if (kind === "buy") {
        state.money -= cost;
        state.stash += amount;
    } else {
        state.money += cost;
        state.stash -= amount;
    }
}

export function evaluateConnectPotential(state: GameState, connect: Connection): number {
    const daysLeft = FINAL_DAY - state.day;
    // Deal size is not always good as you get less value
    const tonedDownDealSize = connect.dealSize ** 0.75;
    // Ten days to make up cost
    const baseProfitability = connectCost(connect.tier) / 10;
    // Your total worth should be 5x the connect cost
    const worthPenalty = Math.min(1, totalWorth(state) / (connectCost(connect.tier) * 5));
    // TODO need to evaluate connection saturation??? softmax???
    return baseProfitability * worthPenalty * daysLeft * connect.dealChance * tonedDownDealSize * connect.priceQuality;
}

export function evaluateDealPotential(state: GameState, performedAction: Action): number {
    const {energy, stash, money} = state;
    const deals = getPotentialDealActions(state);
    if (performedAction.kind === "buy" || performedAction.kind === "sell") {
        simDeal(state, performedAction);
        removeOne(deals, performedAction);
    } else if (performedAction.kind === "connect") {
        state.energy -= 1;
        state.money -= performedAction.cost;
    }
    while (state.energy > 0) {
        const affordList = deals.filter(deal => canAffordDeal(state, deal));
        let biggestAction: PlayerDealAction|undefined = undefined;
        let biggestScore = -Infinity;
        for (const action of affordList) {
            let s:number;
            if (action.kind === 'sell') {
                s = score(state, -action.amount, +action.cost);
            } else {
                s = score(state, +action.amount, -action.cost);
            }
            if (s > biggestScore) {
                biggestAction = action;
                biggestScore = s;
            }
        }
        if (!biggestAction) {
            // No more actions
            break;
        }
        simDeal(state, biggestAction);
        removeOne(deals, biggestAction);
    }
    const finalScore = score(state);
    // Revert
    Object.assign(state, {energy, stash, money});
    return finalScore;
}

function likelyBestMove(state: GameState): Action {
    // Null move heuristic:
    let biggestAction: Action = {kind: 'end-day'};
    if (state.energy <= 0) {
        return biggestAction;
    }
    let biggestScore = score(state);
    // In this phase, we don't care about the deal/connect paradigm
    const connects = generateConnectActions(state);
    const deals = generateDealActions(state);

    // For each tier
    const staticDealPotentials = [
        0,
        0,
        0,
        0,
        0
    ];

    for (const action of connects) {
        // Cache, same for each connection of tier
        if (!staticDealPotentials[action.connection.tier]) {
            staticDealPotentials[action.connection.tier] = evaluateDealPotential(state, action);
        }
        let s = staticDealPotentials[action.connection.tier] + evaluateConnectPotential(state, action.connection);
        if (s > biggestScore) {
            biggestAction = action;
            biggestScore = s;
        }
    }
    for (const action of deals) {
        let s = evaluateDealPotential(state, action);
        if (s > biggestScore) {
            biggestAction = action;
            biggestScore = s;
        }
    }
    if (!biggestAction) {
        throw new Error("UNEXPECTED");
    }
    return biggestAction;
}

export class MCTS {
    constructor(
        public game: GameState,
        public iterations = 500, 
        public exploration = 1.41
    ) {
    }

    selectMove(): [Action, number] {
        const originalState = this.game;
        const possibleMoves = generateActions(originalState);
        const root = new MCTSNode(originalState, possibleMoves, undefined);

        for (let i = 0; i < this.iterations; i++) {
            const selectedNode = this.selectNode(root);
            const expandedNode = this.playAndExpand(selectedNode);
            this.backprop(expandedNode, this.playout(expandedNode));
        }

        //choose move with highest average score
        let maxScore = -Infinity
        let maxIndex = -1
        for (let i = 0; i < root.children.length; i++) {
            const child = root.children[i]
            if (child == null) { continue }
            if (child.visits > 1 && child.score() > maxScore) {
                maxScore = child.score();
                maxIndex = i;
            }
        }
        // root.debugPrint();
        return [possibleMoves[maxIndex], root.score()];
    }
    private selectNode(root: MCTSNode) {
        const c = this.exploration;

        while (root.numUnexpandedMoves === 0) {
            let maxUBC = -Infinity;
            let maxIndex = -1;
            let Ni = root.visits;
            for (let i = 0; i < root.children.length; i++) {
                const child = root.children[i];
                if (!child) {
                    throw new Error(); // Appease type checker
                }
                // TODO fix wins not being between 0 to 1
                const ubc = this.computeUCB(child.totalScore, child.visits, c, Ni)
                if (ubc > maxUBC) {
                    maxUBC = ubc;
                    maxIndex = i;
                }
            }
            root = root.children[maxIndex] as MCTSNode;
            if (isGameOver(root.state)) {
                return root;
            }
        }
        return root;
    }

    private playAndExpand(node: MCTSNode) {
        if (isGameOver(node.state)) {
            return node;
        }
        const cloneState = clone(node.state);
        const moves = generateActions(cloneState);
        assert.equal(moves.length, node.children.length);
        const childIndex = this.selectRandomUnexpandedChild(node);
        doAction(cloneState, moves[childIndex]);

        const newMoves = generateActions(cloneState);
        const newNode = new MCTSNode(cloneState, newMoves, node);
        node.children[childIndex] = newNode;
        node.numUnexpandedMoves -= 1;

        return newNode
    }

    private playout(node: MCTSNode) {
        const state = clone(node.state);
        while (!isGameOver(state)) {
            // 10% chance of true random for connections and deals
            // OR for deciding action category
            // if (state.menu === 'main' || Math.random() < 0.1) {
            //     const randomChoice = Math.floor(Math.random() * moves.length);
            //     doAction(state, moves[randomChoice]);
            // } else {
            doAction(state, likelyBestMove(state));
            // }
        }
        return score(state);
    }
    private backprop(node: MCTSNode|undefined, reward) {
        while (node != null) {
            node.visits += 1
            node.totalScore += reward
            node = node.parent
        }
    }

    // returns index of a random unexpanded child of node
    private selectRandomUnexpandedChild(node: MCTSNode): number {
        const choice = Math.floor(Math.random() * node.numUnexpandedMoves) //expand random nth unexpanded node
        let count = -1;
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i]
            if (child == undefined) {
                count += 1
            }
            if (count == choice) {
                return i;
            }
        }
        throw new Error("Unexpected");
    }

    private computeUCB(score: number, visits: number, c, Ni) {
        return (score / visits) / 3000 + c * Math.sqrt(Math.log(Ni) / visits);
    }
}