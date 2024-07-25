"use client";

import React from "react";

import AddIcon from "@mui/icons-material/Add";
import {
  Alert,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material";
import * as generation from "generator";
import { useAtom } from "jotai";
import * as atoms from "../../sessionAtoms";

export default function GeneratorConfiguration() {
  const [generatorState, setGeneratorState] = useAtom(atoms.session);
  const [configuration, setConfiguration] = useAtom(atoms.configuration);
  const [playerHistory, setPlayerHistory] = useAtom(atoms.playerHistory);
  const [newPlayer, setNewPlayer] = React.useState<string>("");

  const requiredPlayers =
    configuration.courts * (configuration.teamSize * 2) -
    generatorState.players.length;

  const addPlayer = () => {
    if (newPlayer.trim() === "") return;
    setGeneratorState((s) => generation.addPlayer(s, newPlayer));
    if (!playerHistory.includes(newPlayer))
      setPlayerHistory((h) => [...h, newPlayer]);
    setNewPlayer("");
  };

  const handleNewPlayerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addPlayer();
    }
  };

  return (
    <>
      {requiredPlayers > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You need to add {requiredPlayers} more players to fill a full set of
          matches.
        </Alert>
      )}

      <FormControl sx={{ mb: 2, mt: 1 }} fullWidth>
        <InputLabel id="courts-input-label">Courts</InputLabel>
        <Select
          labelId="courts-input-label"
          value={configuration.courts}
          label="Courts"
          onChange={(e) =>
            setConfiguration({
              ...configuration,
              courts: e.target.value as number,
            })
          }
        >
          {[...Array(10)].map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <MenuItem key={i} value={i + 1}>
              {i + 1}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ mb: 2 }} fullWidth>
        <InputLabel id="team-size-input-label">Team Size</InputLabel>
        <Select
          labelId="team-size-input-label"
          value={configuration.teamSize}
          label="Team Size"
          disabled
        >
          {[...Array(10)].map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <MenuItem key={i} value={i + 1}>
              {i + 1}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          This is the number of people on one side of the court. For example,
          use 1 for singles, 2 for doubles.
        </FormHelperText>
      </FormControl>

      <FormControl sx={{ mb: 2 }} fullWidth>
        <InputLabel id="add-player-input-label">New Player</InputLabel>
        <OutlinedInput
          label="New Player"
          value={newPlayer}
          onChange={(e) => setNewPlayer(e.target.value as string)}
          onKeyDown={handleNewPlayerKeyDown}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="add player"
                edge="end"
                onClick={addPlayer}
              >
                <AddIcon />
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
    </>
  );
}
