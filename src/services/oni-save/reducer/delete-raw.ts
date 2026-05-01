import { AnyAction } from "redux";
import { SaveGame } from "oni-save-parser";
import { get } from "lodash";
import { set as setFp, unset } from "lodash/fp";

import { OniSaveState, defaultOniSaveState } from "../state";
import { isDeleteRawAction } from "../actions/delete-raw";
import { tryModifySaveGame } from "./utils";

export default function deleteRawReducer(
  state: OniSaveState = defaultOniSaveState,
  action: AnyAction
): OniSaveState {
  if (!isDeleteRawAction(action)) {
    return state;
  }

  const { path } = action.payload;

  return tryModifySaveGame(state, saveGame =>
    performDeleteRaw(saveGame, path)
  );
}

function performDeleteRaw(saveGame: SaveGame, path: string[]): SaveGame {
  const parentPath = path.slice(0, -1);
  const key = path[path.length - 1];
  const parent: any =
    parentPath.length === 0 ? saveGame : get(saveGame, parentPath);

  if (Array.isArray(parent)) {
    const idx = parseInt(key, 10);
    const newArr = [...parent.slice(0, idx), ...parent.slice(idx + 1)];
    return parentPath.length === 0
      ? (newArr as unknown as SaveGame)
      : (setFp(parentPath, newArr, saveGame) as SaveGame);
  }

  return unset(path, saveGame) as SaveGame;
}
