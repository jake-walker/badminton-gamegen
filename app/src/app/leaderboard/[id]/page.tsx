"use server";

import db from "../../../../db/db";
import { group } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { Alert, Box, Button, Card, CardActions, CardContent, Divider, List, ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";

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
      players: true,
      matches: true
    }
  });

  return {
    ...res
  };
}

export default async function ViewGroup({ params }: ViewGroupProps) {
  const data = await getData(params.id);

  if (!data) {
    return <p>Not found</p>;
  }

  return (
    <Box sx={{ p: 2 }}>
      {isNew(data.createdAt) && (
        <Alert severity="info">
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
            {/* <CardActions>
              <Button size="small">Record Match</Button>
            </CardActions> */}
          </Card>
        </Grid>
        <Grid xs={12} sm={6}>
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
                data.matches?.map((match) => (
                  <ListItemButton key={match.id}>
                    <ListItemText>{match.id}</ListItemText>
                  </ListItemButton>
                ))
              )}
            </List>
          </Card>
        </Grid>
        <Grid xs={12} sm={6}>
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
                data.players?.map((player) => (
                  <ListItemButton key={player.id}>
                    <ListItemText>{player.id}</ListItemText>
                  </ListItemButton>
                ))
              )}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
