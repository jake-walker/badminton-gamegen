import { atom } from "jotai";
import { type Session } from "generator"

type GeneratorConfiguration = {
  courts: number,
  teamSize: number
}

export const session = atom<Session>({ players: [], matches: [] });
export const configuration = atom<GeneratorConfiguration>({ courts: 1, teamSize: 2 });
