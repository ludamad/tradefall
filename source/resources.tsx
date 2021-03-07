import React, { useState } from "react";
import { Text } from "ink";
import { ChoiceMenu, CustomCell, Input } from "./inkUtils";
import Table from "ink-table";
import {
  getResource,
  getSpread,
  highestPrice,
  lowestPrice,
  getRegion,
  getRegionResource,
  getLocalPrice,
  doAction,
} from "./game";
import {
  Action,
  ForegroundColor,
  GameState,
  PlayerTradeAction,
  Resource,
  ResourcePile,
  RESOURCES,
} from "./types";
import { MenuProps, RecentLogs } from "./ui";
import { clearLogs, log } from "./log";

export function generateResourcesActions(
  state: GameState
): PlayerTradeAction[] {
  let i = 0;
  const actions: PlayerTradeAction[] = [];
  for (const resource of RESOURCES) {
    const highest = highestPrice(state, resource);
    highest[0] /= getSpread(state, resource);
    const lowest = lowestPrice(state, resource);
    lowest[0] *= getSpread(state, resource);
    const localSell =
      getLocalPrice(state, resource) / getSpread(state, resource);
    const localBuy =
      getLocalPrice(state, resource) * getSpread(state, resource);

    const haveEnoughToSell = getResource(state, resource).amount > 4;
    const haveEnoughToBuy = state.money / localBuy > 4;
    if (haveEnoughToSell && localSell > lowest[0] * 1.05) {
      actions.push({
        kind: "trade",
        isBuy: false,
        resource,
        amount: getResource(state, resource).amount,
      });
    }
    if (haveEnoughToBuy && localBuy < highest[0] / 1.05) {
      actions.push({
        kind: "trade",
        isBuy: true,
        resource,
        amount: Math.floor(state.money / localBuy),
      });
    }
    i++;
  }
  // Used by the AI
  // This is essentially abridged, but informs the special options in the UI
  return actions;
}

function ResourceMenuView({ state, title, children }) {
  return (
    <>
      <Text>
        Day {state.day} {Math.round(state.money)}GP {state.region} Energy{" "}
        {state.energy}
      </Text>
      <Table data={state.resources.map(toEntry)} cell={CustomCell} />
      <RecentLogs />
      <Text>{title}</Text>
      {children}
    </>
  );
  function toEntry(resource: ResourcePile, _i) {
    const regionResource = getRegionResource(
      getRegion(state, state.region),
      resource.resource
    );
    const highest = highestPrice(state, resource.resource);
    highest[0] /= getSpread(state, resource.resource);
    const lowest = lowestPrice(state, resource.resource);
    lowest[0] *= getSpread(state, resource.resource);
    let highestSell = `${highest[0].toFixed(1)}GP (${highest[1]})`;
    let lowestBuy = `${lowest[0].toFixed(1)}GP (${lowest[1]})`;
    if (highest[0] > lowest[0] * 1.2) {
      highestSell = "[G]" + highestSell;
      lowestBuy = "[G]" + lowestBuy;
    } else if (highest[0] > lowest[0] * 1.05) {
      highestSell = "[g]" + highestSell;
      lowestBuy = "[g]" + lowestBuy;
    } else if (highest[0] < lowest[0] / 1.4) {
      highestSell = "[R]" + highestSell;
      lowestBuy = "[R]" + lowestBuy;
    } else if (highest[0] < lowest[0] / 1.2) {
      highestSell = "[r]" + highestSell;
      lowestBuy = "[r]" + lowestBuy;
    } else {
      highestSell = "   " + highestSell;
      lowestBuy = "   " + lowestBuy;
    }
    const sellPrice =
      regionResource.amount / getSpread(state, resource.resource);
    const buyPrice =
      regionResource.amount * getSpread(state, resource.resource);
    let sellStr = `${sellPrice.toFixed(1)}GP`;
    let buyStr = `${buyPrice.toFixed(1)}GP`;
    if (sellPrice > lowest[0] * 1.05) {
      sellStr = "[g]" + sellStr;
    } else {
      sellStr = "   " + sellStr;
    }
    if (buyPrice < highest[0] / 1.05) {
      buyStr = "[g]" + buyStr;
    } else {
      buyStr = "   " + buyStr;
    }
    return {
      Name: resource.resource,
      Amount: resource.amount,
      Sell: sellStr,
      Buy: buyStr,
      "Highest Sell": highestSell,
      "Lowest Buy": lowestBuy,
    };
  }
}

export function ResourceMenu({ state }: MenuProps) {
  const [useCustom, setCustom] = useState(false);
  if (useCustom) {
    return <ResourceMenuCustom state={state} />;
  }
  const [selectedAction, setSelectedAction] = useState(
    undefined as PlayerTradeAction | undefined
  );
  if (selectedAction) {
    return (
      <ResourceFinalMenu
        state={state}
        focusResource={selectedAction.resource}
        isBuy={selectedAction.isBuy}
        onFinalize={() => {
          setSelectedAction(undefined);
        }}
      />
    );
  }
  const actions = generateResourcesActions(state);
  const options: string[] = [];
  const optionToAction = {};
  for (const action of actions) {
    const option = `${action.isBuy ? "Buy" : "Sell"} ${action.resource}`;
    options.push(option);
    optionToAction[option] = action;
  }
  options.push("More");
  return (
    <ResourceMenuView state={state} title="Trade which resource?">
      <ChoiceMenu
        options={options}
        onSubmit={(option: string) => {
          if (option === "More") {
            setCustom(true);
            return;
          }
          clearLogs();
          setSelectedAction(optionToAction[option]);
        }}
        onExit={() => {
          // TODO proper react practice
          state.menu = "Main";
          clearLogs();
        }}
      />
    </ResourceMenuView>
  );
}
// generateResourcesActions
export function ResourceMenuCustom({ state }: MenuProps) {
  const [focusResource, setFocusResource] = useState(
    undefined as string | undefined
  );
  const [buySell, setBuySell] = useState(undefined as string | undefined);

  if (!focusResource) {
    return (
      <ResourceMenuView state={state} title="Trade which resource?">
        <ChoiceMenu
          options={RESOURCES}
          onSubmit={(resource: Resource) => {
            clearLogs();
            setFocusResource(resource);
          }}
          onExit={() => {
            // TODO proper react practice
            state.menu = "Main";
            clearLogs();
          }}
        />
      </ResourceMenuView>
    );
  }
  if (!buySell) {
    return (
      <ResourceMenuView state={state} title="Buy or sell?">
        <ChoiceMenu
          options={["Buy", "Sell"]}
          onSubmit={setBuySell}
          onExit={() => {
            // TODO proper react practice
            state.menu = "Main";
            clearLogs();
          }}
        />
      </ResourceMenuView>
    );
  }
  return (
    <ResourceFinalMenu
      focusResource={focusResource as Resource}
      state={state}
      isBuy={buySell === "buy"}
      onFinalize={() => {
        setFocusResource(undefined);
        setBuySell(undefined);
      }}
    />
  );
}

function ResourceFinalMenu({
  state,
  focusResource,
  isBuy,
  onFinalize,
}: {
  state: GameState;
  focusResource: Resource;
  isBuy: boolean;
  onFinalize;
}) {
  const regionR = getRegionResource(
    getRegion(state, state.region),
    focusResource
  );
  let maxAmount: number = 0;
  if (isBuy) {
    maxAmount = Math.floor(
      state.money / regionR.amount / getSpread(state, regionR.resource)
    );
  } else {
    maxAmount = getResource(state, regionR.resource).amount;
  }
  return (
    <ResourceMenuView
      state={state}
      title={`How much do you want to ${isBuy ? "buy" : "sell"}?`}
    >
      <Input defaultValue={`${maxAmount}`} onSubmit={onSubmit} />
    </ResourceMenuView>
  );
  function onSubmit(rawAmount: string) {
    clearLogs();
    onFinalize();
    const amount = parseInt(rawAmount);
    if (amount === 0 || isNaN(+amount)) {
      log("Did not input a valid amount.");
      return;
    }
    const regionResource = getRegionResource(
      getRegion(state, state.region),
      focusResource as Resource
    );
    if (!isBuy) {
      if (amount > getResource(state, focusResource as Resource).amount) {
        log("Cannot sell more than we have!");
        return;
      }
      const price =
        regionResource.amount / getSpread(state, regionResource.resource);
      getResource(state, focusResource as Resource).amount += -amount;
      state.money += amount * price;
      log(`Sold ${amount} for ${Math.round(amount * price)}GP`);
    } else {
      const price =
        regionResource.amount * getSpread(state, regionResource.resource);
      if (price * amount > state.money) {
        log(
          `You can't afford that much, it would cost ${Math.round(
            price * amount
          )}GP!`
        );
        return;
      }
      getResource(state, focusResource as Resource).amount += +amount;
      state.money -= amount * price;
      log(`Bought ${amount} for ${Math.round(amount * price)}GP`);
    }
  }
}
