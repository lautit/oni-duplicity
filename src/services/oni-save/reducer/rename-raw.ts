import { AnyAction } from "redux";
import { SaveGame } from "oni-save-parser";
import { get } from "lodash";
import { set as setFp, unset } from "lodash/fp";

import { OniSaveState, defaultOniSaveState } from "../state";
import { isRenameRawAction } from "../actions/rename-raw";
import { tryModifySaveGame } from "./utils";

export default function renameRawReducer(
  state: OniSaveState = defaultOniSaveState,
  action: AnyAction
): OniSaveState {
  if (!isRenameRawAction(action)) {
    return state;
  }

  const { path, newKey } = action.payload;

  return tryModifySaveGame(state, saveGame =>
    performRenameRaw(saveGame, path, newKey)
  );
}

function performRenameRaw(
  saveGame: SaveGame,
  path: string[],
  newKey: string
): SaveGame {
  const parentPath = path.slice(0, -1);
  const oldKey = path[path.length - 1];
  const parent: any =
    parentPath.length === 0 ? saveGame : get(saveGame, parentPath);

  if (Array.isArray(parent)) {
    return saveGame;
  }

  const value = parent[oldKey];
  const without = unset(path, saveGame) as SaveGame;
  return setFp([...parentPath, newKey], value, without) as SaveGame;
}
