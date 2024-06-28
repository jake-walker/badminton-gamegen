"use client";

import { List, ListItem, ListItemText, ListSubheader } from "@mui/material";
import { session as sessionAtom } from "../../sessionAtoms";
import { useAtom } from "jotai";

export default function PlayerList() {
  const [generatorState, setGeneratorState] = useAtom(sessionAtom);

  return (
    <List>
      <ListSubheader disableGutters>Players</ListSubheader>
      {generatorState.players.map((player) => (
        <ListItem key={player.id} disableGutters>
          <ListItemText primary={player.name} />
        </ListItem>
      ))}
    </List>
  )
}
