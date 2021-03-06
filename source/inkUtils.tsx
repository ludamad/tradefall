import React, { useContext, useEffect, useState } from "react";
import TextInput from "ink-text-input";
import { useInput, Text, Key, Box } from "ink";
import { RESOURCES } from "./types";
import { splitArray } from "./jsUtils";

export interface InputProps {
  onSubmit(text: string): void;
}
export function Input(props: InputProps) {
  const [query, setQuery] = React.useState("");
  return (
    <TextInput
      showCursor={true}
      value={query}
      onChange={setQuery}
      onSubmit={props.onSubmit}
    />
  );
}

export interface FocusItemProps {
  text: string;
  isFocused: boolean;
}
export function FocusableItem(props: FocusItemProps) {
  if (props.isFocused) {
    return (
      <Text>
        {">"}
        {props.text}
      </Text>
    );
  } else {
    return <Text>{props.text}</Text>;
  }
}

export interface ChoiceMenuProps {
  options: string[];
  onSubmit(text: string): void;
}
export function ChoiceMenu(props: ChoiceMenuProps) {
  const [selected, setSelected] = useState(props.options[0]);
  const chunks = splitArray(props.options, 4);

  function getOptionXy(option: string) {
    for (let y = 0; y < chunks.length; y++) {
      for (let x = 0; x < chunks[y].length; x++) {
        if (chunks[y][x] === option) {
          return [x, y];
        }
      }
    }
    return undefined;
  }

  useInput((input: string, key: Key) => {
    // Submit with enter
    if (key.return) {
      props.onSubmit(selected);
      return;
    }
    const optionIdx = props.options.indexOf(selected);
    // Loop until we hit the same value again, then exit
    for (
      let i = (optionIdx + 1) % props.options.length;
      i != optionIdx;
      i = (i + 1) % props.options.length
    ) {
      if (props.options[i].toLowerCase().startsWith(input.toLowerCase())) {
        setSelected(props.options[i]);
        return;
      }
    }
    let [x, y] = getOptionXy(selected) || [0, 0];
    if (key.leftArrow) {
      x -= 1;
    }
    if (key.tab || key.rightArrow) {
      x += 1;
    }
    if (key.downArrow) {
      y += 1;
    }
    if (key.upArrow) {
      y -= 1;
    }
    y = (y + chunks.length) % chunks.length;
    x = (x + chunks[0].length) % chunks[0].length;
    const chunkValueOrUndefined = (chunks[y] || [])[x];
    setSelected(chunkValueOrUndefined || props.options[0]);
  });

  return (
    <Box padding={2} width={80} flexDirection="column">
      {chunks.map(toRow)}
    </Box>
  );
  function toRow(chunk: string[]) {
    return (
      <Box key={chunk[0]} width={80} flexDirection="row">
        {chunk.map((option) => (
          <Box key={option} width={20}>
            <FocusableItem text={option} isFocused={option === selected} />
          </Box>
        ))}
      </Box>
    );
  }
}

export function ChoiceTest() {
  return (
    <ChoiceMenu
      onSubmit={(option) => console.log(option)}
      options={RESOURCES}
    />
  );
}
