"use server";

import { Box, Card, CardContent, Chip, List, ListItem, ListItemText, Typography } from "@mui/material";
import { eq } from "drizzle-orm";
import db from "../../../../../../db/db";
import * as schema from "../../../../../../db/schema";

interface ViewMatchProps {
  params: {
    id: string,
    matchId: string
  }
}

async function getData(id: string) {
  const res = await db.query.match.findFirst({
    where: eq(schema.match.id, id),
    with: {
      matchPlayer: {
        with: {
          player: true
        }
      }
    }
  });

  return res;
}

function PlayerItem({ matchPlayer, winningTeam }: { matchPlayer: typeof schema.matchPlayer.$inferSelect & { player: typeof schema.player.$inferSelect | null }, winningTeam: "teamA" | "teamB" | null }) {
  const win = matchPlayer.side === winningTeam;
  const draw = winningTeam === null;

  // eslint-disable-next-line no-nested-ternary -- In this simple instance, ternary is cleaner than if, else if, arrangement
  const color = draw ? "blue" : (win ? "green" : "red");

  const delta = (matchPlayer.newRank || 0) - (matchPlayer.oldRank || 0);
  const deltaSign = delta > 0 ? "+" : "";

  return (
    <ListItem>
      <ListItemText
        primary={<Typography color={color}>{matchPlayer.player?.name || "Anonymous"}</Typography>}
        secondary={
          matchPlayer.oldRank && matchPlayer.newRank && <>
            {matchPlayer.oldRank} → {matchPlayer.newRank} {` `}
            <Typography sx={{ display: "inline" }} variant="body2" component="span">({deltaSign}{delta})</Typography>
          </>
        }
      />
    </ListItem>
  )
}

export default async function ViewMatchPage({ params }: ViewMatchProps) {
  const data = await getData(params.matchId);

  if (!data) {
    return <p>Not found!</p>;
  }

let winningTeam: "teamA" | "teamB" | null = null

if (data.teamAScore !== data.teamBScore) {
  winningTeam = data.teamAScore > data.teamBScore ? "teamA" : "teamB"
}

  /* eslint-disable prefer-destructuring */
  let teamAScore: string | number = data.teamAScore;
  let teamBScore: string | number = data.teamBScore;
  /* eslint-enable prefer-destructuring */

  if (data.inexactScore) {
    if (teamAScore === teamBScore) {
      teamAScore = "Draw";
      teamBScore = "Draw";
    } else if (teamAScore > teamBScore) {
      teamAScore = "Win";
      teamBScore = "Lose";
    } else {
      teamAScore = "Lose";
      teamBScore = "Win";
    }
  }

  const teamA = data.matchPlayer.filter((mp) => mp.side === "teamA");
  const teamB = data.matchPlayer.filter((mp) => mp.side === "teamB");

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h5">
              {data.ranked && (<><Chip label="Ranked" color="primary" />&ensp;</>)}
              {[teamA, teamB].map((team) => team.map((p) => p.player?.name || "Anonymous").join(" and ")).join(" vs. ")}
            </Typography>
            <Typography sx={{ mt: 1.5 }}>
              {data.date.toLocaleString()}
              &ensp;&bull;&ensp;
              {teamAScore} - {teamBScore}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <List disablePadding>
        {data.matchPlayer.map((mp) => <PlayerItem key={mp.id} winningTeam={winningTeam} matchPlayer={mp} /> )}
      </List>
    </>
  )
}
