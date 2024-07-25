"use client";

// eslint-disable-next-line import/order, import/no-unresolved, import/extensions
import Configuration from "@/components/generate/Configuration";
// eslint-disable-next-line import/order, import/no-unresolved, import/extensions
import PlayerList from "@/components/generate/PlayerList";
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
} from "@mui/material";
import * as generation from "generator";
import { useAtom } from "jotai";
import React from "react";
import {
  configuration as configurationAtom,
  session as sessionAtom,
} from "../../sessionAtoms";

interface TabPanelProps {
  children?: React.ReactNode;
  index: string;
  value: string;
}

function CustomTabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
    >
      {children}
    </div>
  );
}

export default function Generate() {
  const [generatorState, setGeneratorState] = useAtom(sessionAtom);
  const [configuration] = useAtom(configurationAtom);

  const [currentTab, setCurrentTab] = React.useState<string>("config");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  const addGame =
    (n: number): React.MouseEventHandler =>
    () => {
      const newState: generation.Session = { ...generatorState };

      for (let i = 0; i < n; i += 1) {
        const match = generation.nextGame(newState, configuration.courts);

        if (match === null) {
          setErrorMessage(
            "Could not generate the next game. Please make sure you have enough players to fill a game.",
          );
          return;
        }

        setErrorMessage(null);
        newState.matches.push(match);
      }

      setGeneratorState(newState);
    };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        generatorState.matches
          .map(
            (match, i) =>
              `_${i + 1} (c${match.court + 1}):_ ${generation.formatMatch(match)}`,
          )
          .join("\n"),
      );
    } catch (err) {
      alert("Failed to write to clipboard!");
    }
  };

  return (
    <Container>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs onChange={handleTabChange} centered>
          <Tab label="Matches" value="matches" />
          <Tab label="Config" value="config" />
        </Tabs>
      </Box>

      <CustomTabPanel index={currentTab} value="matches">
        <Button onClick={addGame(1)}>Add matches</Button>
        <Button onClick={addGame(10)}>Add 10 matches</Button>
        <Button onClick={copyToClipboard}>Copy to clipboard</Button>

        {errorMessage && (
          <Alert severity="error" sx={{ my: 2 }}>
            Whoops! {errorMessage}
          </Alert>
        )}

        <List>
          {generatorState.matches.map((match, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <ListItem key={i}>
              <ListItemText
                primary={`${i + 1}. [Court ${match.court + 1}] ${generation.formatMatch(match)}`}
              />
            </ListItem>
          ))}
        </List>
      </CustomTabPanel>

      <CustomTabPanel index={currentTab} value="config">
        <Alert severity="info" sx={{ mb: 2 }}>
          Something wrong? Use the old version{" "}
          <Link
            color="inherit"
            href="https://a3a9a6f8.badminton-bhs.pages.dev/"
          >
            here
          </Link>
          .
        </Alert>

        <Configuration />

        <PlayerList />
      </CustomTabPanel>
    </Container>
  );
}
