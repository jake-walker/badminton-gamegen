"use server";

// eslint-disable-next-line import/order, import/no-unresolved, import/extensions
import { createMatch, resolvePlayerIds } from "@/app/leaderboard/leaderboard";
import { eq } from "drizzle-orm";
import { z } from "zod";
import db from "../../../../../../db/db";
import { player as playerModel } from "../../../../../../db/schema";

const newMatchSchema = z.object({
  teamA: z
    .string()
    .min(1, { message: "Player name must be at least 1 character long" })
    .nullable()
    .array()
    .min(1, { message: "Team A must have at least 1 player" }),
  teamB: z
    .string()
    .min(1, { message: "Player name must be at least 1 character long" })
    .nullable()
    .array()
    .min(1, { message: "Team B must have at least 1 player" }),
  teamAScore: z
    .number()
    .min(0, { message: "The score of team A must be at least 0" })
    .safe()
    .finite(),
  teamBScore: z
    .number()
    .min(0, { message: "The score of team B must be at least 0" })
    .safe()
    .finite(),
  ranked: z.boolean().default(true),
});

export async function getPlayers(groupId: string) {
  const res = await db.query.player.findMany({
    where: eq(playerModel.groupId, groupId),
  });

  return res;
}

export async function addMatch(
  groupId: string,
  data: z.infer<typeof newMatchSchema>,
) {
  const validated = newMatchSchema.safeParse(data);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const players = await getPlayers(groupId);

  const match = await createMatch({
    groupId,
    inexactScore: false,
    teamAPlayerIds: await resolvePlayerIds(
      groupId,
      players,
      validated.data.teamA,
    ),
    teamAScore: validated.data.teamAScore,
    teamBPlayerIds: await resolvePlayerIds(
      groupId,
      players,
      validated.data.teamB,
    ),
    teamBScore: validated.data.teamBScore,
    ranked: validated.data.ranked,
  });

  return { created: match.id };
}
