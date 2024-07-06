"use server";
import { eq, sql } from "drizzle-orm";
import db from "../../../db/db";
import * as schema from "../../../db/schema";

const kFactor: number = 32;

type NewMatchInfo = {
  groupId: string,
  teamAPlayerIds: (string | null)[],
  teamBPlayerIds: (string | null)[],
  teamAScore: number,
  teamBScore: number,
  inexactScore: boolean
};

async function getPlayerEloRank(playerId: string | null): Promise<number> {
  if (playerId === null) return 1500;

  const player = await db.query.player.findFirst({
    where: eq(schema.player.id, playerId)
  });

  if (!player) throw Error(`Could not find player with ID ${playerId}`);

  return player.rank;
}

async function updatePlayerElo(playerId: string, rankIncrease: number): Promise<void> {
  console.log(`Updating ${playerId} rank by ${rankIncrease}`);

  await db.update(schema.player).set({
    rank: sql`${schema.player.rank} + ${Math.round(rankIncrease)}`
  }).where(eq(schema.player.id, playerId));
}

async function updateEloRankings(winnerPlayerIds: (string | null)[], loserPlayerIds: (string | null)[]) {
  const winnerRatings = await Promise.all(winnerPlayerIds.map(async (playerId) => getPlayerEloRank(playerId)));
  const loserRatings = await Promise.all(loserPlayerIds.map(async (playerId) => getPlayerEloRank(playerId)));

  const winnerRating = winnerRatings.reduce((partialSum, a) => partialSum + a, 0) / winnerPlayerIds.length;
  const loserRating = loserRatings.reduce((partialSum, a) => partialSum + a, 0) / loserPlayerIds.length;

  const expectedWinner = 1 / (1 + 10 ** ((loserRating - winnerRating) / 400))
  const expectedLoser = 1 - expectedWinner;

  await Promise.all(winnerPlayerIds
    .filter((playerId) => playerId !== null)
    .map(async (playerId) => updatePlayerElo(playerId, kFactor * (1 - expectedWinner))));

  await Promise.all(loserPlayerIds
    .filter((playerId) => playerId !== null)
    .map(async (playerId) => updatePlayerElo(playerId, kFactor * (0 - expectedLoser))));
}

export async function createMatch(info: NewMatchInfo): Promise<typeof schema.match.$inferSelect> {
  const match = (await db.insert(schema.match).values({
    groupId: info.groupId,
    teamAScore: info.teamAScore,
    teamBScore: info.teamBScore,
    inexactScore: info.inexactScore
  }).returning())[0];

  if (!match) {
    throw Error("Failed to create match");
  }

  const teamAMatchPlayers = await db.insert(schema.matchPlayer).values(info.teamAPlayerIds.map((playerId) => ({
    matchId: match.id,
    playerId,
    side: "teamA" as const
  })));

  if (!teamAMatchPlayers) {
    throw Error("Failed to create match players");
  }

  const teamBMatchPlayers = await db.insert(schema.matchPlayer).values(info.teamBPlayerIds.map((playerId) => ({
    matchId: match.id,
    playerId,
    side: "teamB" as const
  })));

  if (!teamBMatchPlayers) {
    throw Error("Failed to create match players");
  }

  if (info.teamAScore > info.teamBScore) {
    await updateEloRankings(info.teamAPlayerIds, info.teamBPlayerIds);
  } else if (info.teamBScore > info.teamAScore) {
    await updateEloRankings(info.teamBPlayerIds, info.teamAPlayerIds);
  }

  return match;
}
