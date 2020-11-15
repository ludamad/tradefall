import { Action, GameState, generateActions, score, doAction } from "../game"
import { basePrice } from "../formulas";

const clone = require('fast-clone');

export class MCTSNode {
    visits: number
    totalScore: number
    numUnexpandedMoves: any;
    children: Array<MCTSNode|undefined>;
    score() {
        return this.totalScore / Math.max(this.visits, 1);
    }
    constructor(public moves: Action[], public parent: MCTSNode | undefined) {
        this.parent = parent;
        this.visits = 0;
        this.totalScore = 0;
        this.numUnexpandedMoves = moves.length;
        this.children = new Array(this.numUnexpandedMoves).fill(undefined);
    }
    debugPrint(indent=0) {
        if (this.visits <= 100) {
            return;
        }
        let str = '';
        for (let i = 0; i < indent; i++) {
            str += '  ';
        }
        console.log(str + "Visits: " + this.visits + " Score: " + this.score().toFixed(0));
        for (const child of this.children) {
            if (child) {
                child.debugPrint(indent + 1);
            }
        }
    }
}

// Adapt to the expected API
class GameAdapter {
    constructor(public game: GameState) {
    }
    getState() {
        return this.game;
    }
    moves() {
        return generateActions(this.game);
    }
    gameOver() {
        return this.game.day > 30;
    }
    setState(game: GameState) {
        this.game = game;
    }
    cloneState(): GameState {
        // TODO optimize
        return clone(this.game);
    }
    playMove(action: Action) {
        doAction(this.game, action);
    }
    score(): number {
        return score(this.game);
    }
}

function likelyBestMove(gameState: GameState, actions: Action[]): Action {
    let biggestAction: Action|undefined = undefined;
    let biggestScore = -Infinity;
    for (const action of actions) {
        let s:number;
        if (action.kind === 'sell') {
            s = score(gameState, -action.amount, +action.cost);
        } else if (action.kind === 'buy') {
            s = score(gameState, +action.amount, -action.cost);
        } else {
            s = score(gameState);
        }
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
    game: GameAdapter;
    iterations: number;
    exploration: number;
    constructor(game: GameState, iterations = 2000, exploration = 1.41) {
        this.game = new GameAdapter(game);
        this.iterations = iterations;
        this.exploration = exploration;
    }

    selectMove(): [Action, number] {
        const originalState = this.game.getState();
        const possibleMoves = this.game.moves();
        const root = new MCTSNode(possibleMoves, undefined);

        for (let i = 0; i < this.iterations; i++) {
            this.game.setState(originalState);
            const clonedState = this.game.cloneState();
            this.game.setState(clonedState);

            const selectedNode = this.selectNode(root);
            const expandedNode = this.playAndExpand(selectedNode);
            this.backprop(expandedNode, this.playout());
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

        this.game.setState(originalState);
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
            const moves = root.moves;
            this.game.playMove(moves[maxIndex])

            root = root.children[maxIndex] as MCTSNode;
            if (this.game.gameOver()) {
                return root;
            }
        }
        return root;
    }

    private playAndExpand(node: MCTSNode) {
        if (this.game.gameOver()) {
            return node;
        }
        let moves = node.moves;
        const childIndex = this.selectRandomUnexpandedChild(node);
        this.game.playMove(moves[childIndex]);

        moves = this.game.moves();
        const newNode = new MCTSNode(moves, node);
        node.children[childIndex] = newNode;
        node.numUnexpandedMoves -= 1;

        return newNode
    }

    private playout() {
        while (!this.game.gameOver()) {
            const moves = this.game.moves();
            // 10% chance of true random
            if (Math.random() < 0.1) {
                const randomChoice = Math.floor(Math.random() * moves.length);
                this.game.playMove(moves[randomChoice]);
            } else {
                this.game.playMove(likelyBestMove(this.game.getState(), moves));
            }
        }
        return this.game.score();
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