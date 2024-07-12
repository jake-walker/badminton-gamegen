import { eq } from "drizzle-orm";
import db from "../db/db";
import * as schema from "../db/schema";

export async function removeMatch(matchId: string) {
  await db.delete(schema.matchPlayer).where(eq(schema.matchPlayer.matchId, matchId));
  await db.delete(schema.match).where(eq(schema.match.id, matchId));
}

if (process.argv.length < 3) {
  console.error("Please specify a match ID to remove");
  process.exit(1);
}

const matchId = process.argv[2]
console.log(`Deleting match ${matchId}...`)
removeMatch(matchId);
