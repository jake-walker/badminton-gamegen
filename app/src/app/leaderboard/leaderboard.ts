"use server";
import { and, eq } from "drizzle-orm";
import db from "../../../db/db";
import * as schema from "../../../db/schema";

const kFactor: number = 32;

type NewMatchInfo = {
  groupId: string,
  teamAPlayerIds: (string | null)[],
  teamBPlayerIds: (string | null)[],
  teamAScore: number,
  teamBScore: number,
  inexactScore: boolean,
  ranked: boolean
};

export async function resolvePlayerIds(groupId: string, players: (typeof schema.player.$inferSelect)[], names: (string | null)[]): Promise<(string | null)[]> {
  return Promise.all(names.map(async (name) => {
    if (name === null) return null;

    let player = players.find((p) => p.name === name);

    if (typeof player === "undefined") {
      const res = await db.insert(schema.player).values({
        groupId,
        name,
      }).returning();

      if (!res) {
        throw Error("Could not create player");
      }

      player = res[0];
    }

    return player.id;
  }));
}

async function getPlayerEloRank(playerId: string | null): Promise<number> {
  if (playerId === null) return schema.defaultElo;

  const player = await db.query.player.findFirst({
    where: eq(schema.player.id, playerId)
  });

  if (!player) throw Error(`Could not find player with ID ${playerId}`);

  return player.rank;
}

async function updatePlayerElo(matchId: string, playerId: string, currentRank: number, rankIncrease: number): Promise<void> {
  const newRank = Math.round(currentRank + rankIncrease);
  console.log(`Updating ${playerId} rank from ${currentRank} to ${newRank}`);

  await db.update(schema.player).set({
    rank: newRank
  }).where(eq(schema.player.id, playerId));

  await db.update(schema.matchPlayer).set({
    oldRank: currentRank,
    newRank,
  }).where(and(eq(schema.matchPlayer.playerId, playerId), eq(schema.matchPlayer.matchId, matchId)));
}

export async function updateEloRankings(matchId: string, winnerPlayerIds: (string | null)[], loserPlayerIds: (string | null)[]) {
  const winners = await Promise.all(winnerPlayerIds.map(async (playerId) => ({ playerId, currentRank: await getPlayerEloRank(playerId) })));
  const losers = await Promise.all(loserPlayerIds.map(async (playerId) => ({ playerId, currentRank: await getPlayerEloRank(playerId) })));

  const winnerRating = winners.map((x) => x.currentRank).reduce((partialSum, a) => partialSum + a, 0) / winnerPlayerIds.length;
  const loserRating = losers.map((x) => x.currentRank).reduce((partialSum, a) => partialSum + a, 0) / loserPlayerIds.length;

  const expectedWinner = 1 / (1 + 10 ** ((loserRating - winnerRating) / 400))
  const expectedLoser = 1 - expectedWinner;

  await Promise.all(winners
    .filter(({ playerId }) => playerId !== null)
    .map(async (p) => updatePlayerElo(matchId, p.playerId!, p.currentRank, kFactor * (1 - expectedWinner))));

  await Promise.all(losers
    .filter(({ playerId }) => playerId !== null)
    .map(async (p) => updatePlayerElo(matchId, p.playerId!, p.currentRank, kFactor * (0 - expectedLoser))));
}

export async function createMatch(info: NewMatchInfo): Promise<typeof schema.match.$inferSelect> {
  const match = (await db.insert(schema.match).values({
    groupId: info.groupId,
    teamAScore: info.teamAScore,
    teamBScore: info.teamBScore,
    inexactScore: info.inexactScore,
    ranked: info.ranked
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

  if (info.ranked) {
    if (info.teamAScore > info.teamBScore) {
      await updateEloRankings(match.id, info.teamAPlayerIds, info.teamBPlayerIds);
    } else if (info.teamBScore > info.teamAScore) {
      await updateEloRankings(match.id, info.teamBPlayerIds, info.teamAPlayerIds);
    }
  }

  return match;
}
