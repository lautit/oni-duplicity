import { AnyAction } from "redux";

export const ACTION_ONISAVE_RENAME_RAW = "oni-save/rename-raw";
export const renameRaw = (path: string[], newKey: string) => ({
  type: ACTION_ONISAVE_RENAME_RAW as typeof ACTION_ONISAVE_RENAME_RAW,
  payload: { path, newKey }
});
export type RenameRawAction = ReturnType<typeof renameRaw>;
export function isRenameRawAction(
  action: AnyAction
): action is RenameRawAction {
  return action.type === ACTION_ONISAVE_RENAME_RAW;
}
