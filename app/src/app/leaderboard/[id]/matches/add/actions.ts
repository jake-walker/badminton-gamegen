"use server";

import { eq } from "drizzle-orm";
import db from "../../../../../../db/db";
import { player as playerModel } from "../../../../../../db/schema";
import { z } from "zod";
import { createMatch, resolvePlayerIds } from "@/app/leaderboard/leaderboard";

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

export async function addMatch(groupId: string, data: z.infer<typeof newMatchSchema>) {
  const validated = newMatchSchema.safeParse(data);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors
    }
  };

  const players = await getPlayers(groupId);

  const match = await createMatch({
    groupId,
    inexactScore: false,
    teamAPlayerIds: await resolvePlayerIds(groupId, players, validated.data.teamA),
    teamAScore: validated.data.teamAScore,
    teamBPlayerIds: await resolvePlayerIds(groupId, players, validated.data.teamB),
    teamBScore: validated.data.teamBScore
  });

  return { created: match.id };
}
