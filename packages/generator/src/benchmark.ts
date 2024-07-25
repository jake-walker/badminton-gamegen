import * as generator from "./main";

const TEST_GAMES = [100, 80, 60, 40, 20];
const TRIALS = 10;

function createSession(): generator.Session {
  return {
    matches: [],
    players: ["a", "b", "c", "d", "e", "f"].map((id) => ({
      id,
      name: id.toUpperCase(),
    })),
  };
}

function addGames(
  session: generator.Session,
  gameCount: number,
): generator.Session {
  for (let i = 0; i < gameCount; i += 1) {
    const game = generator.nextGame(session, 1);

    if (game !== null) {
      session.matches.push(game);
    }
  }

  return session;
}

TEST_GAMES.forEach((gameCount) => {
  let gameCountMin: number | null = null;
  let gameCountMax: number | null = null;
  let pairCountMin: number | null = null;
  let pairCountMax: number | null = null;

  for (let i = 0; i < TRIALS; i += 1) {
    const session = createSession();
    addGames(session, gameCount);

    const gameCounts = Array.from(generator.playerGameCounts(session).values());
    const pairCounts = Array.from(generator.pairGameCounts(session).values());

    const trialGameCountMin = Math.min(...gameCounts);
    const trialGameCountMax = Math.max(...gameCounts);
    const trialPairCountMin = Math.min(...pairCounts);
    const trialPairCountMax = Math.max(...pairCounts);

    if (gameCountMin === null || trialGameCountMin < gameCountMin) {
      gameCountMin = trialGameCountMin;
    }

    if (gameCountMax === null || trialGameCountMax > gameCountMax) {
      gameCountMax = trialGameCountMax;
    }

    if (pairCountMin === null || trialPairCountMin < pairCountMin) {
      pairCountMin = trialPairCountMin;
    }

    if (pairCountMax === null || trialPairCountMax > gameCountMax) {
      pairCountMax = trialPairCountMax;
    }
  }

  console.log(
    `With ${gameCount} matches, each player will play between ${gameCountMin} and ${gameCountMax} matches (+/- ${gameCountMax! - gameCountMin!})`,
  );
  console.log(
    `  and will play with each other player between ${pairCountMin} and ${pairCountMax} times (+/- ${pairCountMax! - pairCountMin!})`,
  );
});

const session = createSession();
addGames(session, 20);

session.matches.forEach((game) => {
  console.log(generator.formatMatch(game));
});

console.log(generator.pairGameCounts(session));
