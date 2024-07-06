ALTER TYPE "side" ADD VALUE 'teamA';--> statement-breakpoint
ALTER TYPE "side" ADD VALUE 'teamB';--> statement-breakpoint
ALTER TABLE "match" RENAME COLUMN "winning_score" TO "team_a_score";--> statement-breakpoint
ALTER TABLE "match" RENAME COLUMN "losing_score" TO "team_b_score";--> statement-breakpoint
ALTER TABLE "player" ADD CONSTRAINT "player_group_id_name_unique" UNIQUE("group_id","name");