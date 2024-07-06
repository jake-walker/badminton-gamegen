"use server";

import { eq, param } from "drizzle-orm";
import db from "../../../../../../db/db";
import { match, matchPlayer, player as playerModel } from "../../../../../../db/schema";
import { z } from "zod";
import { createMatch } from "@/app/leaderboard/leaderboard";

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

  const match = await createMatch({
    groupId,
    inexactScore: false,
    teamAPlayerIds: await Promise.all(validated.data.teamA
      .map(async (name) => name !== null ? (await createOrGetPlayer(players, name, createPlayer))?.id || null : null)),
    teamAScore: validated.data.teamAScore,
    teamBPlayerIds: await Promise.all(validated.data.teamB
      .map(async (name) => name !== null ? (await createOrGetPlayer(players, name, createPlayer))?.id || null : null)),
    teamBScore: validated.data.teamBScore
  });

  return { created: match.id };
}
