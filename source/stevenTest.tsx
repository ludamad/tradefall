import React, { useState, useEffect, memo } from "react";
import { Box, Text, Newline, useFocus, useApp, useInput } from "ink";
import {
  Encounter,
  GameState,
  ResourcePile,
  RESOURCES,
  SkillCheck,
  SkillLevel,
} from "./types";
import { createGameState } from "./game";
import { random, removeOne } from "./jsUtils";
const seedrandom = require("seedrandom");

const focusableOptions = {
  quest: 1,
  option: 2,
};
type focusableType = keyof typeof focusableOptions;

export interface focusable {
  type: focusableType;
  contents: Encounter | Option;
}
export interface startMenuProps {
  gameState: GameState;
  focused: focusable | undefined;
  setFocused(option: focusable): any;
}
export interface itemProps {
  option: focusable;
  setFocused(option: focusable): void;
  focused: focusable | undefined;
}
export interface Option {
  name: string;
}

const attack: SkillCheck = {
  skill: "attack",
  basis: 2,
};
const defence: SkillCheck = {
  skill: "defence",
  basis: 2,
};
const information: SkillCheck = {
  skill: "information",
  basis: 2,
};

export const generateReward = (energyCost: number): ResourcePile[] => {
  const rewards: ResourcePile[] = [];
  for (var i = 0; i < 3; i++) {
    rewards.push({
      resource: random(RESOURCES),
      amount: 10 * energyCost,
    });
  }
  return rewards;
};

const questExample: Encounter = {
  type: "monster",
  name: "bob",
  checks: [attack, defence, information],
  daysLeft: 5,
  energyCost: 1,
  reward: generateReward(1),
};
const questExample2: Encounter = {
  type: "monster",
  name: "bob2",
  checks: [attack, defence, information],
  daysLeft: 5,
  energyCost: 1,
  reward: generateReward(1),
};

const Item = (props: itemProps) => {
  const { isFocused } = useFocus();
  if (isFocused) {
    props.setFocused(props.option);
  }
  return (
    <Text>
      {props.option.contents.name}{" "}
      {isFocused && <Text color="green">(focused)</Text>}
    </Text>
  );
};

const battleResultsScreen = (setFocused, focused) => {
  const proceed: focusable = {
    type: "option",
    contents: {
      name: "continue",
    },
  };
  return (
    <>
      <Text>Battle Results</Text>
      <Item setFocused={setFocused} option={proceed} focused={focused}></Item>
    </>
  );
};

const questInformation = (
  gameState: GameState,
  questSelected: Encounter | undefined,
  setOption,
  focused
) => {
  const yes: focusable = {
    type: "option",
    contents: {
      name: "yes",
    },
  };
  const no: focusable = {
    type: "option",
    contents: {
      name: "no",
    },
  };
  return (
    <>
      <Box flexDirection="row">
        <Box flexDirection="column">
          <Text>{gameState.energy}</Text>
        </Box>
        <Box flexDirection="column">
          <Text>{questSelected !== undefined && questSelected.daysLeft}</Text>
        </Box>
      </Box>
      <Box flexDirection="row">
        <Text>do you want to accept this battle?</Text>
        <Box flexDirection="column">
          <Item option={yes} setFocused={setOption} focused={focused}></Item>
          <Item option={no} setFocused={setOption} focused={focused}></Item>
        </Box>
      </Box>
    </>
  );
};

const StartMenu = (props: startMenuProps) => {
  return (
    <>
      <Text>energy: {JSON.stringify(props.gameState["energy"])}</Text>
      {props.gameState.quests.map((quest: Encounter) => {
        const questChosen: focusable = {
          type: "quest",
          contents: quest,
        };
        return (
          <Item
            key={quest.name}
            option={questChosen}
            setFocused={props.setFocused}
            focused={props.focused}
          />
        );
      })}
    </>
  );
};

const battle = (
  monsterSkills: SkillCheck[],
  playerSkills: SkillLevel[]
): boolean => {
  console.log(monsterSkills);
  console.log(playerSkills);
  return true;
};

export function StevenTest() {
  const [gameState, setGameState] = useState({
    ...createGameState("steven"),
    quests: [questExample, questExample2],
  });
  const [menu, setMenu] = useState<string>("start");
  const [counter, setCounter] = useState(0);
  const { exit } = useApp();
  const [battleResults, setBattleResults] = useState();
  const [focused, setFocused] = useState<focusable | undefined>(undefined);
  const [questSelected, setQuestSelected] = useState<Encounter>({
    type: "monster",
    name: "",
    checks: [],
    daysLeft: 0,
    energyCost: 0,
    reward: [],
  });
  useInput((input, key) => {
    if (input === "q") {
      exit();
    }
    if (key.return) {
      if (focused !== undefined) {
        switch (focused.type) {
          case "option":
            if (focused.contents.name === "yes") {
              if (battle(questSelected.checks, gameState.skills)) {
                removeOne(gameState.quests, questSelected);
              }
              setGameState({
                ...gameState,
                energy: gameState.energy - questSelected.energyCost,
              });
              setMenu("battleResults");
            } else {
              setMenu("start");
            }
            break;
          case "quest":
            setQuestSelected(focused.contents as Encounter);
            setMenu("questInformation");
            break;
        }
      }
    }
  });
  const printthing = (option: focusable) => {
    if (!deepEqual(option, focused)) {
      setFocused(option);
    }
  };
  switch (menu) {
    case "start":
      const startMenuProperties: startMenuProps = {
        gameState: gameState,
        focused: focused,
        setFocused: printthing,
      };
      return StartMenu(startMenuProperties);
    case "questInformation":
      return questInformation(gameState, questSelected, printthing, focused);
    case "battleResults":
      return battleResultsScreen(printthing, focused);
    default:
      return <Text>bad</Text>;
  }
}

function deepEqual(object1, object2) {
  if (object1 === undefined || object2 === undefined) {
    return false;
  }
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (
      (areObjects && !deepEqual(val1, val2)) ||
      (!areObjects && val1 !== val2)
    ) {
      return false;
    }
  }

  return true;
}

function isObject(object) {
  return object != null && typeof object === "object";
}
