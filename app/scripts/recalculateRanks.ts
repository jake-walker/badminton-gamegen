import { and, asc, eq, SQL } from "drizzle-orm";
import db from "../db/db";
import * as schema from "../db/schema";
import { updateEloRankings } from "../src/app/leaderboard/leaderboard";

export default async function recalculateRanks(where?: SQL) {
  // reset all ranks to the default
  await db
    .update(schema.player)
    .set({
      rank: schema.defaultElo,
    })
    .where(where);

  // work through each match in order, updating player elo rankings
  const matches = await db.query.match.findMany({
    where: and(eq(schema.match.ranked, true), where),
    orderBy: asc(schema.match.date),
    with: {
      matchPlayer: true,
    },
  });

  matches.forEach(async (match) => {
    console.log(
      `Calculating ranks for ${match.id} (${match.date.toLocaleString()})...`,
    );

    const winningTeam =
      match.teamAScore >= match.teamBScore ? "teamA" : "teamB";

    const winnerPlayerIds = match.matchPlayer
      .filter((mp) => mp.side === winningTeam)
      .map((mp) => mp.playerId);
    const losingPlayerIds = match.matchPlayer
      .filter((mp) => mp.side !== winningTeam)
      .map((mp) => mp.playerId);

    await updateEloRankings(match.id, winnerPlayerIds, losingPlayerIds);
  });
}

recalculateRanks();
