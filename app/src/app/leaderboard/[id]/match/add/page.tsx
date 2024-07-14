"use client";

import { Alert, Autocomplete, Box, Button, Card, CardActions, CardContent, FormControlLabel, FormGroup, List, ListItem, Stack, Switch, TextField, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Unstable_Grid2";
import { useRouter } from "next/navigation";
import React from "react";
import { addMatch, getPlayers } from "./actions";

type Players = Awaited<ReturnType<typeof getPlayers>>;

interface AddMatchProps {
  params: {
    id: string
  }
}

interface PlayerItemProps {
  name: string | null,
  players: Players,
  onChange: (newValue: string | null) => void
}

function PlayerItem({name, players, onChange}: PlayerItemProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const selectItems = players.map((player) => player.name);

  return (
    <ListItem>
      <Stack direction={isMobile ? "column" : "row"} spacing={isMobile ? 0 : 2} sx={[!isMobile && { "& > .MuiAutocomplete-root": { flexGrow: 1 }, flexGrow: 1, alignItems: "center" }, { width: "100%" }]}>
        <Autocomplete
          inputValue={name === null ? "Anonymous" : name}
          onInputChange={(_, newInputValue) => onChange(newInputValue)}
          freeSolo
          disabled={name === null}
          options={selectItems}
          // eslint-disable-next-line react/jsx-props-no-spreading
          renderInput={(params) => <TextField {...params} label="Player" />}
        />
        <FormGroup sx={{ pt: isMobile ? 1 : "23px" }}>
          <FormControlLabel control={<Switch checked={name === null} onChange={(_, checked) => onChange(checked ? null : "")} />} label="Anonymous?" />
        </FormGroup>
      </Stack>
    </ListItem>
  )
}

export default function AddMatchPage({ params }: AddMatchProps) {
  const router = useRouter();

  const [players, setPlayers] = React.useState<Players>([]);

  const [teamA, setTeamA] = React.useState<(string | null)[]>([]);
  const [teamB, setTeamB] = React.useState<(string | null)[]>([]);
  const [teamAScore, setTeamAScore] = React.useState<number>(0);
  const [teamBScore, setTeamBScore] = React.useState<number>(0);

  const [isRanked, setIsRanked] = React.useState<boolean>(true);

  const [errorMessage, setErrorMessage] = React.useState<string>("");

  React.useEffect(() => {
    getPlayers(params.id).then((data) => {
      setPlayers(data);
    })
  }, [params.id]);

  const onPlayerItemChange = (index: number, newValue: string | null, currentState: (string | null)[], setter: React.Dispatch<React.SetStateAction<(string | null)[]>>) => {
    const items = [...currentState];
    items[index] = newValue;
    setter(items);
  }

  const handleSubmit = async () => {
    const res = await addMatch(params.id, {
      teamA,
      teamB,
      teamAScore,
      teamBScore,
      ranked: isRanked
    });

    if (res.errors) {
      setErrorMessage(Object.values(res.errors).flat().join(". "))
      return;
    }

    router.push(`/leaderboard/${params.id}`);
  };

  return (
    <Box sx={{ p: 2 }}>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <p>Record the results of a match here. The order of the teams does not matter, and you should add in blank spaces for any players that don&apos;t want to take part in the leaderboard.</p>

      <FormGroup>
        <FormControlLabel
          control={<Switch checked={isRanked} onChange={(_, checked) => setIsRanked(checked)} />}
          label={isRanked ? "Ranked Game" : "Casual Game"}
        />
      </FormGroup>

      <Grid container spacing={2}>
        <Grid xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h5">
                Team A
              </Typography>

              <TextField label="Score" type="number" value={teamAScore} onChange={(e) => setTeamAScore(parseInt(e.target.value, 10))} />
            </CardContent>

            <List disablePadding sx={{ borderTop: 1, borderColor: "divider" }}>
              {/* eslint-disable-next-line react/no-array-index-key */}
              {teamA.map((item, i) => <PlayerItem key={i} name={item} onChange={(newValue) => onPlayerItemChange(i, newValue, teamA, setTeamA)} players={players} />)}
            </List>

            <CardActions>
              <Button size="small" onClick={() => setTeamA([...teamA, ""])}>Add Player</Button>
              <Button size="small" onClick={() => setTeamA(teamA.slice(0, -1))}>Remove Last Player</Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h5">
                Team B
              </Typography>

              <TextField label="Score" type="number" value={teamBScore} onChange={(e) => setTeamBScore(parseInt(e.target.value, 10))} />
            </CardContent>

            <List disablePadding sx={{ borderTop: 1, borderColor: "divider" }}>
              {/* eslint-disable-next-line react/no-array-index-key */}
              {teamB.map((item, i) => <PlayerItem key={i} name={item} onChange={(newValue) => onPlayerItemChange(i, newValue, teamB, setTeamB)} players={players} />)}
            </List>

            <CardActions>
              <Button size="small" onClick={() => setTeamB([...teamB, ""])}>Add Player</Button>
              <Button size="small" onClick={() => setTeamB(teamB.slice(0, -1))}>Remove Last Player</Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="caption" color="CaptionText" sx={{ textAlign: "right", display: "block", mt: 2, mb: 1 }}>
        {isRanked
          ? "This is a ranked game, players ranks will be affected."
          : "This is a casual game, the game will be recorded without ranks being effected."
        }
      </Typography>

      <Button variant="contained" size="large" sx={{ float: "right", mb: 2 }} onClick={handleSubmit}>Submit</Button>
    </Box>
  );
}
