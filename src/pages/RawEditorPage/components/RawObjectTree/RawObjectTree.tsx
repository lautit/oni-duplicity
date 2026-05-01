import * as React from "react";
import { get } from "lodash";
import { SaveGame } from "oni-save-parser";
import { useDispatch } from "react-redux";

import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TreeItem from "@material-ui/lab/TreeItem";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import { makeStyles } from "@material-ui/core/styles";

import { getSegmentName } from "../../editor-data";
import { deleteRaw } from "@/services/oni-save/actions/delete-raw";
import { renameRaw } from "@/services/oni-save/actions/rename-raw";

export interface RawObjectTreeProps {
  className?: string;
  saveGame: SaveGame;
  onChangePath(path: string[]): void;
}

const RawObjectTree: React.FC<RawObjectTreeProps> = ({
  className,
  saveGame,
  onChangePath
}) => {
  return (
    <TreeView
      className={className}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
    >
      <RawTreeChildren
        saveGame={saveGame}
        path={[]}
        onChangePath={onChangePath}
      />
    </TreeView>
  );
};

export default RawObjectTree;

interface RawTreeChildrenProps {
  saveGame: SaveGame;
  path: string[];
  onChangePath(path: string[]): void;
}
const RawTreeChildren: React.FC<RawTreeChildrenProps> = ({
  saveGame,
  path,
  onChangePath
}) => {
  const target = path.length == 0 ? saveGame : get(saveGame, path);
  const childrenKeys = Object.keys(target).filter(key =>
    isObjectKey(target, key)
  );
  const children = childrenKeys.map(key => {
    const childPath = [...path, key];
    return (
      <RawTreeChild
        key={childPath.join(".")}
        saveGame={saveGame}
        path={childPath}
        onChangePath={onChangePath}
      />
    );
  });

  return <>{children}</>;
};

const useNodeLabelStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center",
    "& $actions": {
      visibility: "hidden"
    },
    "&:hover $actions": {
      visibility: "visible"
    }
  },
  label: {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  actions: {}
});

interface NodeLabelProps {
  label: string;
  path: string[];
  onChangePath(path: string[]): void;
}
const NodeLabel: React.FC<NodeLabelProps> = ({ label, path, onChangePath }) => {
  const classes = useNodeLabelStyles();
  const dispatch = useDispatch();
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState("");

  const lastKey = path[path.length - 1];
  const isArrayIndex = !isNaN(parseInt(lastKey, 10));

  const handleDeleteClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(deleteRaw(path));
    },
    [dispatch, path]
  );

  const handleRenameClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setRenameValue(lastKey);
      setIsRenaming(true);
    },
    [lastKey]
  );

  const handleRenameCommit = React.useCallback(() => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== lastKey) {
      dispatch(renameRaw(path, trimmed));
      onChangePath(path.slice(0, -1).concat(trimmed));
    }
    setIsRenaming(false);
  }, [dispatch, path, lastKey, renameValue, onChangePath]);

  const handleRenameKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        handleRenameCommit();
      } else if (e.key === "Escape") {
        setIsRenaming(false);
      }
    },
    [handleRenameCommit]
  );

  const handleRenameClick2 = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
    },
    []
  );

  return (
    <div className={classes.root}>
      {isRenaming ? (
        <TextField
          value={renameValue}
          onChange={e => setRenameValue(e.target.value)}
          onBlur={handleRenameCommit}
          onKeyDown={handleRenameKeyDown}
          onClick={handleRenameClick2}
          autoFocus
          size="small"
        />
      ) : (
        <span className={classes.label}>{label}</span>
      )}
      <span className={classes.actions}>
        <IconButton
          size="small"
          title="Rename"
          disabled={isArrayIndex}
          onClick={handleRenameClick}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" title="Delete" onClick={handleDeleteClick}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </span>
    </div>
  );
};

interface RawTreeChildProps {
  saveGame: SaveGame;
  path: string[];
  onChangePath(path: string[]): void;
}
const RawTreeChild: React.FC<RawTreeChildProps> = ({
  saveGame,
  path,
  onChangePath
}) => {
  const onClick = React.useCallback(() => {
    onChangePath(path);
  }, [onChangePath, path]);

  const segmentName = getSegmentName(saveGame, path);

  return (
    <TreeItem
      nodeId={path.join(".")}
      label={
        <NodeLabel
          label={segmentName}
          path={path}
          onChangePath={onChangePath}
        />
      }
      onClick={onClick}
    >
      <RawTreeChildren
        saveGame={saveGame}
        path={path}
        onChangePath={onChangePath}
      />
    </TreeItem>
  );
};

function isObjectKey(obj: any, key: string): boolean {
  return obj[key] != null && typeof obj[key] === "object";
}
