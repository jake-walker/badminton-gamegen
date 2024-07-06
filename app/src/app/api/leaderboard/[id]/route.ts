import { desc, eq } from "drizzle-orm";
import db from "../../../../../db/db";
import * as schema from "../../../../../db/schema";

export async function GET(request: Request, { params }: { params: { id: string }}) {
  const res = await db.query.group.findFirst({
    where: eq(schema.group.id, params.id),
    with: {
      matches: {
        orderBy: desc(schema.match.date),
        limit: 50,
        with: {
          matchPlayer: {
            with: {
              player: true
            }
          }
        }
      },
      players: {
        orderBy: desc(schema.player.rank)
      }
    }
  });

  if (!res) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(res);
}
