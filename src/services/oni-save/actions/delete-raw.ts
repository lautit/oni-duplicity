import { AnyAction } from "redux";

export const ACTION_ONISAVE_DELETE_RAW = "oni-save/delete-raw";
export const deleteRaw = (path: string[]) => ({
  type: ACTION_ONISAVE_DELETE_RAW as typeof ACTION_ONISAVE_DELETE_RAW,
  payload: { path }
});
export type DeleteRawAction = ReturnType<typeof deleteRaw>;
export function isDeleteRawAction(
  action: AnyAction
): action is DeleteRawAction {
  return action.type === ACTION_ONISAVE_DELETE_RAW;
}
