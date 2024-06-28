"use client";

import { Alert, Box, Button, FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, Link, List, ListItem, ListItemText, ListSubheader, MenuItem, NativeSelect, OutlinedInput, Select, Tab, Tabs } from "@mui/material";
import React from "react";
import * as generation from "generator";
import { session as sessionAtom, configuration as configurationAtom } from "../../sessionAtoms";
import { useAtom } from "jotai";
import Configuration from "@/components/generate/Configuration";
import PlayerList from "@/components/generate/PlayerList"
import { TabContext, TabList, TabPanel } from "@mui/lab";

export default function Generate() {
  const [generatorState, setGeneratorState] = useAtom(sessionAtom);
  const [configuration, setConfiguration] = useAtom(configurationAtom);

  const [currentTab, setCurrentTab] = React.useState<string>("config");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }

  const addGame = () => {
    const match = generation.nextGame(generatorState, configuration.courts);

    if (match === null) {
      setErrorMessage("Could not generate the next game. Please make sure you have enough players to fill a game.");
      return
    };

    setErrorMessage(null);

    setGeneratorState((s) => ({
      ...s,
      matches: [...s.matches, match],
    }))
  }

  return (
    <TabContext value={currentTab}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <TabList onChange={handleTabChange} centered>
          <Tab label="Games" value="games" />
          <Tab label="Config" value="config" />
        </TabList>
      </Box>

      <TabPanel value="games">
        <Button onClick={addGame}>Add game</Button>

        {errorMessage && <Alert severity="error" sx={{ my: 2 }}>
          Whoops! {errorMessage}
        </Alert>}

        <List>
          {generatorState.matches.map((match, i) => (
            <ListItem key={i}>
              <ListItemText primary={`${i+1}. [Court ${match.court + 1}] ${generation.formatMatch(match)}`} />
            </ListItem>
          ))}
        </List>
      </TabPanel>

      <TabPanel value="config">
        <Alert severity="info" sx={{ mb: 2 }}>
          Something wrong? Use the old version <Link color="inherit" href="https://a3a9a6f8.badminton-bhs.pages.dev/">here</Link>.
        </Alert>

        <Configuration />

        <PlayerList />
      </TabPanel>
    </TabContext>
  );
}