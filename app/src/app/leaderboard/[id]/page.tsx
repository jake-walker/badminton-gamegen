"use server";

import db from "../../../../db/db";
import { group, match as matchModel, matchPlayer as matchPlayerModel, player as playerModel } from "../../../../db/schema";
import { desc, eq } from "drizzle-orm";
import { Alert, Box, Button, Card, CardActions, CardContent, Divider, List, ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import Link from "next/link";

interface ViewGroupProps {
  params: {
    id: string
  }
}

function isNew(date?: Date): boolean {
  if (!date) {
    return false;
  }

  const now = new Date();
  const diffInMinutes = Math.abs(now.getTime() - date.getTime()) / (1000 * 60);

  return diffInMinutes <= 10;
}

async function getData(id: string) {
  const res = await db.query.group.findFirst({
    where: eq(group.id, id),
    with: {
      players: {
        orderBy: desc(playerModel.rank)
      },
      matches: {
        limit: 6,
        orderBy: desc(matchModel.date),
        with: {
          matchPlayer: {
            with: {
              player: {
                columns: { name: true }
              }
            }
          }
        }
      }
    }
  });

  return {
    ...res
  };
}

type MatchWithPlayers = typeof matchModel.$inferSelect & {
  matchPlayer: (typeof matchPlayerModel.$inferSelect & { player: { name: string } | null })[]
}

function MatchItem({ match }: { match: MatchWithPlayers }) {
  const teamA = match.matchPlayer.filter((p) => p.side === "teamA").map((p) => p.player?.name || "X").join(" and ");
  const teamB = match.matchPlayer.filter((p) => p.side === "teamB").map((p) => p.player?.name || "X").join(" and ");

  let teamAScore: string | number = match.teamAScore;
  let teamBScore: string | number = match.teamBScore;

  if (match.inexactScore) {
    if (teamAScore === teamBScore) {
      teamAScore = "Draw";
      teamBScore = "Draw"
    } else if (teamAScore > teamBScore) {
      teamAScore = "Win";
      teamBScore = "Lose";
    } else {
      teamAScore = "Lose";
      teamBScore = "Win";
    }
  }

  return (
    <ListItem>
      <ListItemText
        primary={`${teamA} vs. ${teamB}`}
        secondary={<span>{match.teamAScore} - {match.teamBScore} &nbsp;&bull;&nbsp; {match.date.toLocaleString()}</span>}
      />
    </ListItem>
  );
}

export default async function ViewGroup({ params }: ViewGroupProps) {
  const data = await getData(params.id);

  if (!data) {
    return <p>Not found</p>;
  }

  return (
    <Box sx={{ p: 2 }}>
      {isNew(data.createdAt) && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please make sure to save the link to this group to ensure it doesn&apos;t get lost.
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h5">
                {data.name}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" LinkComponent={Link} href={`/leaderboard/${params.id}/matches/add`}>Record Match</Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h5">
                Recent Matches
              </Typography>
            </CardContent>

            <List disablePadding sx={{ borderTop: 1, borderColor: "divider" }}>
              {(data.matches?.length || 0) == 0 ? (
                <ListItem>
                  <ListItemText primary="Nothing yet" />
                </ListItem>
              ) : (
                data.matches?.map((match) => <MatchItem key={match.id} match={match} />)
              )}
            </List>
          </Card>
        </Grid>
        <Grid xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h5">
                Members
              </Typography>
            </CardContent>

            <List disablePadding sx={{ borderTop: 1, borderColor: "divider" }}>
              {(data.players?.length || 0) == 0 ? (
                <ListItem>
                  <ListItemText primary="Nobody yet" />
                </ListItem>
              ) : (
                data.players?.map((player, i) => (
                  <ListItem key={player.id}>
                    <ListItemText primary={`${i+1}. ${player.name}`} secondary={`Rating: ${player.rank}`} />
                  </ListItem>
                ))
              )}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
