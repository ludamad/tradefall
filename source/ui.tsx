import React from 'react';
import { Box, Text } from 'ink';
import { Input } from './inkUtils';
import { createGameState } from './game';

export function App() {
	const [gameState, setGameState] = React.useState(createGameState('scrub'));
	
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
		<Text>Alright, <Text color="green">{gameState.name}</Text>.
			  I know this isn't the life you envisioned, but you're here now.</Text>
		{gameState.name !== 'scrub' ? undefined : showNameField()}
		{gameState.name === 'scrub' ? undefined : showStatus()}
	</Box>;
	function showStatus() {
		return <>
		<Text><Text color="green">{gameState.name}</Text> the {gameState.drugName} "{gameState.drugNickName}" dealer</Text>
		<Box flexDirection="row">
			<Box flexDirection="column" marginRight={5}>
				<Text>Health: {gameState.health}</Text>
				<Text>Cash: ${gameState.money}</Text>
				<Text>Tolerance: {gameState.tolerance}/dose</Text>
				<Text>Total traffic: {gameState.totalTraffic}g</Text>
			</Box>
			<Box flexDirection="column">
				<Text>Energy: {gameState.energy} missions</Text>
				<Text>Stash: {gameState.stash}g</Text>
				<Text>Today's Use {gameState.todayUse} doses</Text>
				<Text>Total Use: {gameState.totalUse}g</Text>
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
				setGameState({
					...gameState,
					name: text.trim()
				});
			}
		}
	}
}