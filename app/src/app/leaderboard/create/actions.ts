"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import db from "../../../../db/db";
import { group } from "../../../../db/schema";

const schema = z.object({
  name: z.string().min(1),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO - make this any to an unknown and type check
export default async function newGroup(prevState: any, formData: FormData) {
  const validatedFields = schema.safeParse({
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const createdGroup = await db
    .insert(group)
    .values({
      name: validatedFields.data.name,
    })
    .returning({
      id: group.id,
    });

  console.log(createdGroup);

  return redirect(`/leaderboard/${createdGroup[0].id}`);
}
