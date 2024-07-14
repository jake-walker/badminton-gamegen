"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, List, ListItem, ListItemButton, ListItemText, ListSubheader } from "@mui/material";
import { addPlayer, removePlayer } from "generator";
import { useAtom } from "jotai";
import { MouseEventHandler } from "react";
import * as atoms from "../../sessionAtoms";

export default function PlayerList() {
  const [generatorState, setGeneratorState] = useAtom(atoms.session);
  const [playerHistory] = useAtom(atoms.playerHistory);

  const deletePlayer = (playerId: string): MouseEventHandler => () => {
    setGeneratorState((s) => removePlayer(s, playerId));
  }

  const handleAddPlayer = (name: string): MouseEventHandler => () => {
    setGeneratorState((s) => addPlayer(s, name));
  };

  return (
    <List dense>
      <ListSubheader disableGutters>Players</ListSubheader>
      {generatorState.players.map((player) => (
        <ListItem key={player.id} disableGutters secondaryAction={
          <IconButton edge="end" aria-label="delete" onClick={deletePlayer(player.id)}>
            <DeleteIcon />
          </IconButton>
        }>
          <ListItemText primary={player.name} />
        </ListItem>
      ))}
      <ListSubheader disableGutters>History</ListSubheader>
      {playerHistory.map((player) => (
        <ListItemButton key={player} disableGutters onClick={handleAddPlayer(player)}>
          <ListItemText primary={player} />
        </ListItemButton>
      ))}
    </List>
  )
}
