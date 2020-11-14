import React from 'react';
import { Box, Text } from 'ink';
import { Input } from './inkUtils';

interface AppState {
	name: string;
	// in dollars
	money: number;
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
}

function createAppState(name: string): AppState {
	return {
		name,
		money: 300,
		tolerance: 1,
		stash: 28,
		health: 100,
		energy: 4,
		totalTraffic: 28,
		// In doses
		todayUse: 1,
		totalUse: 0,
		drugName: 'methazole',
		drugNickName: 'hippie powder'
	};
}

export function App() {
	const [appState, setAppState] = React.useState(createAppState('scrub'));
	
	return <Box flexDirection="column">
<Text>{`
POWDER 3
    [IIIII]
     )"""(
    /     \\
   /   RX  \\
   |\`-...-'|
 _ |\`-...-'j    _
(\\)\`-.___.(I) _(/)
  (I)  (/)(I)(\\)
  `}</Text>
		<Text>Alright, <Text color="green">{appState.name}</Text>.
			  I know this isn't the life you envisioned, but you're here now.</Text>
		{appState.name !== 'scrub' ? undefined : showNameField()}
		{appState.name === 'scrub' ? undefined : showStatus()}
	</Box>;
	function showStatus() {
		return <>
		<Text><Text color="green">{appState.name}</Text> the {appState.drugName} "{appState.drugNickName}" dealer</Text>
		<Box flexDirection="row">
			<Box flexDirection="column" marginRight={5}>
				<Text>Health: {appState.health}</Text>
				<Text>Cash: ${appState.money}</Text>
				<Text>Tolerance: {appState.tolerance}/dose</Text>
				<Text>Total traffic: {appState.totalTraffic}g</Text>
			</Box>
			<Box flexDirection="column">
				<Text>Energy: {appState.energy} missions</Text>
				<Text>Stash: {appState.stash}g</Text>
				<Text>Today's Use {appState.todayUse} doses</Text>
				<Text>Total Use: {appState.totalUse}g</Text>
			</Box>
		</Box>
	</>;
	}
	function showNameField() {
		return <>
			<Text>Say, what's your <Text color="green">name</Text>?</Text>
			<Box>
				<Text>Your name: </Text>
				<Input onSubmit={onSubmit}/>
			</Box>
		</>;
		function onSubmit(text: string) {
			if (text.length > 1) {
				setAppState({
					...appState,
					name: text.trim()
				});
			}
		}
	}
}