import { v4 as uuid } from "uuid";

export type Player = {
  id: string;
  name: string;
};

export type Match = {
  teamA: Player[];
  teamB: Player[];
  court: number;
};

export type Session = {
  players: Player[];
  matches: Match[];
};

function countOccurances<T>(arr: Array<T>): Map<string, number> {
  const occurances = new Map<string, number>();

  arr.forEach((item) => {
    const key = JSON.stringify(item);
    occurances.set(key, (occurances.get(key) || 0) + 1);
  });

  return occurances;
}

function combinations<T>(arr: Array<T>): Array<Array<T>> {
  return arr.flatMap((v, i) => arr.slice(i + 1).map((w) => [v, w]));
}

export function formatMatch(match: Match): string {
  return [match.teamA, match.teamB]
    .map((team) => team.map((p) => p.name).join(" and "))
    .join(" vs. ");
}

export function addPlayer(session: Session, name: string): Session {
  return {
    matches: session.matches,
    players: [
      ...session.players,
      {
        id: uuid(),
        name,
      },
    ],
  };
}

export function removePlayer(session: Session, playerId: string): Session {
  return {
    matches: session.matches,
    players: session.players.filter((p) => p.id !== playerId),
  };
}

export function getPlayerById(
  session: Session,
  id: string,
): Player | undefined {
  return session.players.find((p) => p.id === id);
}

export function playerGameCounts(session: Session) {
  return countOccurances(
    session.matches.flatMap((m) => [...m.teamA, ...m.teamB]).map((p) => p.id),
  );
}

export function pairGameCounts(session: Session) {
  return countOccurances(
    session.matches.flatMap((m) => [
      m.teamA.map((p) => p.id),
      m.teamB.map((p) => p.id),
    ]),
  );
}

export function getNextCourt(
  session: Session,
  totalCourts: number,
): number | undefined {
  const lastGame = session.matches[session.matches.length - 1];

  if (lastGame === undefined) return undefined;

  return (lastGame.court + 1) % totalCourts;
}

export function getExcludedPlayerIds(
  session: Session,
  nextCourt: number,
): Array<string> {
  if (nextCourt === 0) return [];

  const otherCourtGames = session.matches.slice(-nextCourt);
  return otherCourtGames.flatMap((m) =>
    [...m.teamA, ...m.teamB].map((p) => p.id),
  );
}

export function nextGame(session: Session, courts: number): Match | null {
  const thisCourt = getNextCourt(session, courts) || 0;
  const excludedPlayers = getExcludedPlayerIds(session, thisCourt);

  const playerCounts = playerGameCounts(session);
  const pairCounts = pairGameCounts(session);

  const players = session.players.map((p) => p.id);

  const gameCandidates = combinations(combinations(players))
    .filter(([teamA, teamB]) => {
      const unique = new Set();

      [...teamA, ...teamB].forEach((item) => {
        if (excludedPlayers.includes(item)) {
          return false;
        }

        if (unique.has(item)) {
          return false;
        }
        unique.add(item);
        return true;
      });

      return true;
    })
    .sort((a, b) => {
      const aGameCount = a
        .flat()
        .map((t) => playerCounts.get(t) || 0)
        .reduce((partialSum, i) => partialSum + i, 0);
      const bGameCount = b
        .flat()
        .map((t) => playerCounts.get(t) || 0)
        .reduce((partialSum, i) => partialSum + i, 0);

      const aTeamCount = a
        .map((t) => pairCounts.get(JSON.stringify(t)) || 0)
        .reduce((partialSum, i) => partialSum + i, 0);
      const bTeamCount = b
        .map((t) => pairCounts.get(JSON.stringify(t)) || 0)
        .reduce((partialSum, i) => partialSum + i, 0);

      const aTotal = aGameCount + 2 * aTeamCount;
      const bTotal = bGameCount + 2 * bTeamCount;

      return aTotal - bTotal;
    });

  if (gameCandidates.length < 1) {
    return null;
  }

  return {
    court: thisCourt,
    teamA: gameCandidates[0][0].map((id) => getPlayerById(session, id)!),
    teamB: gameCandidates[0][1].map((id) => getPlayerById(session, id)!),
  };
}
