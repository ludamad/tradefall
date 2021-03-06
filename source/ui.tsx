import React from 'react';
import { Box, Text } from 'ink';
import { Input } from './inkUtils';
import { createGameState, doAction, getPotentialDealActions, totalWorth, score } from './game';
import { simulate } from './main';
import { withLogDisabled, getMessages, clearLogs } from './log';
import { generateConnect, dealToString, dealToStringBrute, connectToString } from './connect';
import { MCTS } from './ai/mcts';
import { basePrice } from './formulas';

import Gradient from 'ink-gradient';
import BigText from 'ink-big-text';
import { GameState, PlayerConnectAction, PlayerDealAction, ConnectionTier } from './types';

const seedrandom = require('seedrandom');
	
function GameStart(props: {onChooseName}) {
	const [name, setName] = React.useState('trader');
	return <Box flexDirection="column">
	<Gradient name="mind">
		<BigText text="TRADEFALL"/>
	</Gradient>
		<Text>Alright, <Text color="green">{name}</Text>.
			  Let's enter a world of questing and trading!</Text>
		{name !== 'trader' ? undefined : showNameField()}
	</Box>;
	function showNameField() {
		return <>
			<Text>Let's move quick. What's your <Text color="green">name</Text>, anyway?</Text>
			<Box>
				<Text>Your name: </Text>
				<Input onSubmit={onSubmit}/>
			</Box>
		</>;
		function onSubmit(text: string) {
			if (text.length > 1) {
				setName(text);
				props.onChooseName(text);
			}
		}
	}
}
type MenuProps = {state: GameState};

function Stats({state}: MenuProps) {
	return <>
		<Text><Text color="green">{state.name}</Text> the Wise</Text>
		<Box flexDirection="row">
			<Box flexDirection="column" marginRight={5}>
				<Text>Health: {state.health}</Text>
				<Text>Cash: ${state.money.toFixed(2)}</Text>
				{/* <Text>Tolerance: {state.tolerance.toFixed(1)}/dose</Text> */}
				<Text>Total traffic: {state.totalTraffic.toFixed(1)}g</Text>
				<Text>Total worth: ${totalWorth(state).toFixed(2)}</Text>
				<Text>Connections: {state.connections.length}</Text>
			</Box>
			{/* <Box flexDirection="column">
				<Text>Energy: {state.energy} missions</Text>
				<Text>Stash: {state.stash.toFixed(1)}g</Text>
				<Text>Today's Use: {state.todayUse} doses</Text>
				<Text>Total Use: {state.totalUse.toFixed(1)}g</Text>
				<Text>Score: {Math.round(score(state))}</Text>
				<Text>Deals: {getPotentialDealActions(state).length}</Text>
			</Box> */}
		</Box>
		{/* <Text>Base Prices: 1g/${basePrice(1).toFixed(2)}  10g/${basePrice(10).toFixed(2)}  100g/${basePrice(100).toFixed(2)}  1000g/${basePrice(1000).toFixed(2)}</Text> */}
	</>;
}

function MainMenu({state}: MenuProps) {
	return <>
		<Text>Day {state.day}</Text>
		<Text>You sit by your phone contemplating your next move.</Text>
		<Stats state={state}/>
		{getMessages().slice(0, 5).map(msgText)}
	</>;
	function msgText(msg: string, i) {
		return <Text key={i}>{msg}</Text>;
	}
}

function ConnectMenu({state}: MenuProps) {
	return <>
		<Text>Day {state.day}</Text>
		<Text>You decide to research some leads.</Text>
		<Stats state={state}/>
		{state.outstandingConnects.slice(0, 5).map(connectText)}
	</>;
	function connectText(connect: PlayerConnectAction, i) {
		return <Text key={i}>{connectToString(connect.connection)}</Text>;
	}
}

function OfferMenu({state}: MenuProps) {
	return <>
		<Text>Day {state.day}</Text>
		<Text>You decide to do some deals.</Text>
		<Stats state={state}/>
		{getPotentialDealActions(state).slice(0, 5).map(dealText)}
	</>;
	function dealText(deal: PlayerDealAction, i) {
		return <Text key={i}>{dealToStringBrute(state, deal)}</Text>;
	}
}

function Game({state}: MenuProps) {
	const [counter, setCounter] = React.useState(0);
	React.useEffect(() => {
		const timer = setInterval(() => {
			seedrandom(`hello${counter}`, { global: true });
			const mcts = new MCTS(state);
			const [mctsAction, _mctsScore] = withLogDisabled(()=> {
				return mcts.selectMove();
			})
			if (mctsAction) {
				doAction(state, mctsAction);
			}
			clearLogs();
			setCounter(previousCounter => previousCounter + 1);
		}, 1);
		return () => {
			clearInterval(timer);
		};
	}, []);
	switch (state.menu) {
		case 'main': return <MainMenu state={state}/>;
		case 'connect': return <ConnectMenu state={state}/>;
		case 'offer' :return <OfferMenu state={state}/>;
		default: throw new Error("UNEXPECTED");
	}
}

export function App() {
	const [state, setState] = React.useState(undefined as GameState|undefined);

	if (!state) {
		return <GameStart onChooseName={name => {
			const state = createGameState(name);
			for (var i = 0; i < 40; i++) {
				state.outstandingConnects.push({
					kind: 'connect',
					connection: generateConnect(ConnectionTier.JUNKIE, i%2===0),
					daysLeft: 2,
					cost: 30
				});
			}
			setState(state);
		}} />;
	}
	return <Game state={state}/>
}
