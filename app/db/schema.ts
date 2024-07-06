import { relations } from "drizzle-orm";
import { integer, text, uuid, timestamp, pgEnum, pgTable, unique, boolean } from "drizzle-orm/pg-core";

export const group = pgTable("group", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  name: text("name").notNull()
});

export const groupRelations = relations(group, ({ many }) => ({
  players: many(player),
  matches: many(match)
}));

export const player = pgTable("player", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  name: text("name").notNull(),
  groupId: uuid("group_id").notNull().references(() => group.id),
  rank: integer("rank").notNull().default(1500)
}, (t) => ({
  unq: unique().on(t.groupId, t.name)
}));

export const playerRelations = relations(player, ({ one, many }) => ({
  group: one(group, { fields: [player.groupId], references: [group.id] }),
  matchPlayer: many(matchPlayer)
}))

export const match = pgTable("match", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  date: timestamp('date').notNull().defaultNow(),
  teamAScore: integer('team_a_score').notNull(),
  teamBScore: integer('team_b_score').notNull(),
  inexactScore: boolean('inexact_score').notNull().default(false),
  groupId: uuid("group_id").notNull().references(() => group.id),
});

export const matchRelations = relations(match, ({ one, many }) => ({
  group: one(group, { fields: [match.groupId], references: [group.id] }),
  matchPlayer: many(matchPlayer)
}));

export const sideEnum = pgEnum("side", ["teamA", "teamB"]);

export const matchPlayer = pgTable("match_player", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  matchId: uuid("match_id").notNull().references(() => match.id),
  playerId: uuid("player_id").references(() => player.id),
  side: sideEnum("side").notNull()
});

export const matchPlayerRelations = relations(matchPlayer, ({ one }) => ({
  match: one(match, { fields: [matchPlayer.matchId], references: [match.id] }),
  player: one(player, { fields: [matchPlayer.playerId], references: [player.id] })
}));
