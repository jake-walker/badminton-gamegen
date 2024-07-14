// eslint-disable-next-line import/order, import/no-unresolved, import/extensions
import { createMatch, resolvePlayerIds } from "@/app/leaderboard/leaderboard";
import { eq } from "drizzle-orm";
import { z } from "zod";
import db from "../../../../../../db/db";
import * as schema from "../../../../../../db/schema";

const newMatchSchema = z.object({
  teamA: z.string().min(1).nullable().array().min(1),
  teamB: z.string().min(1).nullable().array().min(1),
  teamAScore: z.number().min(0).safe().finite(),
  teamBScore: z.number().min(0).safe().finite(),
  inexactScore: z.boolean().default(false),
  ranked: z.boolean().default(true),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { data, error, success } = newMatchSchema.safeParse(
    await request.json(),
  );

  if (!success) {
    return Response.json({ errors: error.errors }, { status: 400 });
  }

  const players = await db.query.player.findMany({
    where: eq(schema.player.groupId, params.id),
  });

  const match = await createMatch({
    groupId: params.id,
    inexactScore: data.inexactScore,
    teamAPlayerIds: await resolvePlayerIds(params.id, players, data.teamA),
    teamAScore: data.teamAScore,
    teamBPlayerIds: await resolvePlayerIds(params.id, players, data.teamB),
    teamBScore: data.teamBScore,
    ranked: data.ranked,
  });

  return Response.json(match);
}
