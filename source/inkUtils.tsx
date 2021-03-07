import React, { useContext, useEffect, useState } from "react";
import TextInput from "ink-text-input";
import { useInput, Text, Key, Box } from "ink";
import { ForegroundColor, RESOURCES } from "./types";
import { splitArray } from "./jsUtils";

export interface InputProps {
  defaultValue?: string;
  onSubmit(text: string): void;
}
export function Input(props: InputProps) {
  const [query, setQuery] = React.useState(props.defaultValue || "");
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
  onExit?: () => void;
}
export function ChoiceMenu(props: ChoiceMenuProps) {
  let options = props.options;
  if (props.onExit) {
    options = ["Back"].concat(options);
  }
  const [selected, setSelected] = useState(options[0]);
  const chunks = splitArray(options, 4);

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
      if (props.onExit && selected === "Back") {
        props.onExit();
      } else {
        props.onSubmit(selected);
      }
      return;
    }
    const optionIdx = Math.max(options.indexOf(selected), 0);
    // Loop until we hit the same value again, then exit
    for (
      let i = (optionIdx + 1) % options.length;
      i != optionIdx;
      i = (i + 1) % options.length
    ) {
      if (options[i].toLowerCase().startsWith(input.toLowerCase())) {
        setSelected(options[i]);
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
    setSelected(chunkValueOrUndefined || options[0]);
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

export function CustomCell({ children }: React.PropsWithChildren<{}>) {
  let color: ForegroundColor | undefined = undefined;
  let text = children as string;
  let bold: boolean | undefined = undefined;
  // Use a shorthand here as this actually adds padding length to table
  // Keeping this one character is practical here
  if (text.includes("[g]")) {
    color = "green";
    text = text.replace("[g]", "   ");
  } else if (text.includes("[G]")) {
    color = "green";
    text = text.replace("[G]", "   ");
    bold = true;
  } else if (text.includes("[r]")) {
    color = "red";
    text = text.replace("[r]", "   ");
  } else if (text.includes("[R]")) {
    color = "red";
    text = text.replace("[R]", "   ");
    bold = true;
  }
  return (
    <Text color={color} bold={bold}>
      {text}
    </Text>
  );
}
