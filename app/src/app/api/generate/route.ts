import * as generator from "generator";
import { v4 as uuid } from "uuid";
import { z } from "zod";

const teamSize = 2;

const schema = z
  .object({
    players: z.string().min(1).array(),
    courtCount: z.number().min(1).max(100).finite().safe().int().default(1),
    gameCount: z.number().min(1).max(100).finite().safe().int().default(20),
  })
  .refine((data) => data.players.length >= teamSize * data.courtCount, {
    message: "There are not enough players defined.",
  });

export async function POST(request: Request) {
  const { data, error, success } = schema.safeParse(await request.json());

  if (!success) {
    return Response.json({ errors: error.errors }, { status: 400 });
  }

  const session: generator.Session = {
    matches: [],
    players: data.players.map((name) => ({
      id: uuid(),
      name,
    })),
  };

  for (let i = 0; i < data.gameCount; i += 1) {
    const nextGame = generator.nextGame(session, data.courtCount);

    if (nextGame === null) {
      return Response.json(
        { error: "Failed to generate game" },
        { status: 500 },
      );
    }

    session.matches.push(nextGame);
  }

  return Response.json({
    matches: session.matches.map((match, i) => ({
      ...match,
      index: i,
      formatted: generator.formatMatch(match),
    })),
  });
}
