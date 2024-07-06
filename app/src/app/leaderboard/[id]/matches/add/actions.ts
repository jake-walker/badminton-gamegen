"use server";

import { eq, param } from "drizzle-orm";
import db from "../../../../../../db/db";
import { match, matchPlayer, player as playerModel } from "../../../../../../db/schema";
import { z } from "zod";

const newMatchSchema = z.object({
  teamA: z.string().min(1).nullable().array().min(1),
  teamB: z.string().min(1).nullable().array().min(1),
  teamAScore: z.number().min(0).safe().finite(),
  teamBScore: z.number().min(0).safe().finite()
});

export async function getPlayers(groupId: string) {
  const res = await db.query.player.findMany({
    where: eq(playerModel.groupId, groupId)
  });

  return res;
}

async function createOrGetPlayer(players: Awaited<ReturnType<typeof getPlayers>>, name: string | null, createPlayer: (name: string) => Promise<typeof playerModel.$inferSelect>) {
  if (name === null) {
    return null;
  }

  let player = players.find((pl) => pl.name === name);

  if (typeof player === "undefined") {
    player = await createPlayer(name);
  }

  return player;
};

export async function addMatch(groupId: string, data: z.infer<typeof newMatchSchema>) {
  const validated = newMatchSchema.safeParse(data);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors
    }
  };

  const teams = [
    ...validated.data.teamA.map((item) => ({ team: "teamA" as const, name: item })),
    ...validated.data.teamB.map((item) => ({ team: "teamB" as const, name: item }))
  ];

  const players = await getPlayers(groupId);

  const createPlayer = async (name: string) => {
    const res = await db.insert(playerModel).values({
      groupId,
      name
    }).returning();

    if (!res) {
      throw Error("Expected to have created player");
    }

    return res[0];
  };

  const teamPlayers = await Promise.all(teams.map(async (item) => ({
    id: (await createOrGetPlayer(players, item.name, createPlayer))?.id || null,
    ...item
  })));

  const m = await db.insert(match).values({
    groupId,
    teamAScore: validated.data.teamAScore,
    teamBScore: validated.data.teamBScore,
  }).returning();

  if (!m) {
    throw Error("Expected to have created match");
  }

  const matchId = m[0].id;

  const matchPlayers = await db.insert(matchPlayer).values(teamPlayers.map((item) => ({
    matchId,
    playerId: item.id,
    side: item.team
  })));

  if (!matchPlayers) {
    throw Error("Expected to have created match players");
  }

  return { created: matchId };
}
