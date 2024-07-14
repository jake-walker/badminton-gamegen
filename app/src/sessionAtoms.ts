import { type Session } from "generator";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

type GeneratorConfiguration = {
  courts: number;
  teamSize: number;
};

export const session = atom<Session>({ players: [], matches: [] });
export const configuration = atom<GeneratorConfiguration>({
  courts: 1,
  teamSize: 2,
});
export const playerHistory = atomWithStorage<string[]>("player_history", []);
