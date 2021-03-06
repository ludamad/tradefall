import React from "react";
import { Box, Text } from "ink";
import { ChoiceMenu, Input } from "./inkUtils";
import {
  createGameState,
  doAction,
  getPotentialDealActions,
  totalWorth,
  score,
  generateActions,
  getRegion,
} from "./game";
import { getMessages } from "./log";
import { dealToStringBrute } from "./connect";
import Gradient from "ink-gradient";
import BigText from "ink-big-text";
import {
  Action,
  ForegroundColor,
  GameState,
  PlayerDealAction,
  Region,
  REGIONS,
  RegionStats,
  Resource,
  RESOURCE_TO_INDEX,
} from "./types";
import { ResourceMenu } from "./resources";

const seedrandom = require("seedrandom");

function GameStart(props: { onChooseName }) {
  const [name, setName] = React.useState("trader");
  return (
    <Box flexDirection="column">
      <Gradient name="mind">
        <BigText text="TRADEFALL" />
      </Gradient>
      <Text>
        Alright, <Text color="green">{name}</Text>. Let's enter a world of
        questing and trading!
      </Text>
      {name !== "trader" ? undefined : showNameField()}
    </Box>
  );
  function showNameField() {
    return (
      <>
        <Text>
          Let's move quick. What's your <Text color="green">name</Text>, anyway?
        </Text>
        <Box>
          <Text>Your name: </Text>
          <Input onSubmit={onSubmit} />
        </Box>
      </>
    );
    function onSubmit(text: string) {
      if (text.length > 1) {
        setName(text);
        props.onChooseName(text);
      }
    }
  }
}
export type MenuProps = { state: GameState };

function Stats({ state }: MenuProps) {
  return (
    <>
      <Text>
        <Text color="green">{state.name}</Text> the Wise
      </Text>
      <Box flexDirection="row">
        <Box flexDirection="column" marginRight={5}>
          <Text>Health: {state.health}</Text>
          <Text>Cash: {Math.round(state.money)}GP</Text>
        </Box>
        <Box flexDirection="column">
          <Text>Energy: {state.energy}</Text>
          <Text>Score: {Math.round(score(state))}</Text>
        </Box>
      </Box>
    </>
  );
}

export function RecentLogs() {
  return <>{getMessages().slice(0, 5).map(msgText)}</>;
  function msgText(msg: string, i) {
    return <Text key={i}>{msg}</Text>;
  }
}

function MainMenu({ state }: MenuProps) {
  return (
    <>
      <Text>Day {state.day}</Text>
      <Text>You find yourself in {state.region}.</Text>
      <Stats state={state} />
      <RecentLogs />
      <ActionMenu state={state} />
    </>
  );
}

function OfferMenu({ state }: MenuProps) {
  return (
    <>
      <Text>Day {state.day}</Text>
      <Text>You decide to do some deals.</Text>
      <Stats state={state} />
      {getPotentialDealActions(state).slice(0, 5).map(dealText)}
    </>
  );
  function dealText(deal: PlayerDealAction, i) {
    return <Text key={i}>{dealToStringBrute(state, deal)}</Text>;
  }
}

function CraftingMenu({ state }: MenuProps) {
  return (
    <>
      <Text>Day {state.day}</Text>
      <Text>You decide to do some crafting.</Text>
      <Stats state={state} />
    </>
  );
}

export function TravelMenu({ state }: MenuProps) {
  return (
    <>
      <Text>Where would you like to travel?</Text>
      <ChoiceMenu
        options={REGIONS}
        onSubmit={setRegion}
        onExit={() => {
          // TODO proper react practice
          state.menu = "Main";
        }}
      />
    </>
  );
  function setRegion(region: Region) {
    state.region = region;
    state.energy -= 1;
    state.menu = "Main";
  }
}

export function ActionMenu({ state }: MenuProps) {
  const actions = generateActions(state);
  const options: string[] = [];
  const optionToAction: { [s: string]: Action } = {};
  for (const action of actions) {
    if (action.kind === "set-menu") {
      options.push(action.menu);
      optionToAction[action.menu] = action;
    }
  }
  return <ChoiceMenu options={options} onSubmit={onSubmit} />;
  function onSubmit(option: string) {
    const action = optionToAction[option];
    doAction(state, action);
  }
}

function Game({ state }: MenuProps) {
  const [counter, setCounter] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => {
      seedrandom(`hello${counter}`, { global: true });
      // const mcts = new MCTS(state);
      // const [mctsAction, _mctsScore] = withLogDisabled(()=> {
      // 	return mcts.selectMove();
      // })
      // if (mctsAction) {
      // 	doAction(state, mctsAction);
      // }
      // clearLogs();
      setCounter((previousCounter) => previousCounter + 1);
    }, 1);
    return () => {
      clearInterval(timer);
    };
  }, []);
  switch (state.menu) {
    case "Main":
      return <MainMenu state={state} />;
    case "Offer":
      return <OfferMenu state={state} />;
    case "Crafting":
      return <CraftingMenu state={state} />;
    case "Resources":
      return <ResourceMenu state={state} />;
    case "Travel":
      return <TravelMenu state={state} />;
    default:
      throw new Error("UNEXPECTED");
  }
}

export function App() {
  const [state, setState] = React.useState(undefined as GameState | undefined);

  if (!state) {
    return (
      <GameStart
        onChooseName={(name) => {
          const state = createGameState(name);
          // for (var i = 0; i < 40; i++) {
          // 	state.outstandingConnects.push({
          // 		kind: 'connect',
          // 		connection: generateConnect(ConnectionTier.JUNKIE, i%2===0),
          // 		daysLeft: 2,
          // 		cost: 30
          // 	});
          // }
          setState(state);
        }}
      />
    );
  }
  return <Game state={state} />;
}
