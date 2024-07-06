"use server";

import { z } from "zod";
import db from "../../../../db/db";
import { group, player } from "../../../../db/schema";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";

const schema = z.object({
  name: z.string().min(1)
});

export async function newGroup(prevState: any, formData: FormData) {
  const validatedFields = schema.safeParse({
    name: formData.get("name")
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors
    }
  }

  const createdGroup = await db.insert(group).values({
    name: validatedFields.data.name
  }).returning({
    id: group.id
  });

  console.log(createdGroup);

  return redirect(`/leaderboard/${createdGroup[0].id}`);
}
