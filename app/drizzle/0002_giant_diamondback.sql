ALTER TABLE "player" ALTER COLUMN "rank" SET DEFAULT 1500;--> statement-breakpoint
ALTER TABLE "match" ADD COLUMN "inexact_score" boolean DEFAULT false NOT NULL;