use std::collections::{HashMap, HashSet};
use itertools::Itertools;
use rand::thread_rng;
use rand::seq::SliceRandom;

#[derive(Debug)]
pub struct Game {
    pub team_a: Vec<usize>,
    pub team_b: Vec<usize>
}

impl Game {
    pub fn players(&self) -> Vec<usize> {
        let mut players = self.team_a.clone();
        players.extend(self.team_b.clone());
        players
    }

    pub fn pairs(&self) -> [&Vec<usize>; 2] {
        [&self.team_a, &self.team_b]
    }
}

#[derive(Debug, PartialEq)]
pub enum GenStrategy {
    NORMAL = 0,
    SHUFFLED = 1
}

#[derive(Debug)]
pub struct Session {
    pub player_names: Vec<String>,
    pub games: Vec<Game>,
    pub gen_strategy: GenStrategy
}

impl Session {
    pub fn new() -> Self {
        Self { player_names: Vec::new(), games: Vec::new(), gen_strategy: GenStrategy::SHUFFLED }
    }

    pub fn add_game(&mut self, g: Game) {
        self.games.push(g)
    }

    pub fn player_game_counts(&self) -> HashMap<usize, usize> {
        let mut counts = HashMap::new();

        for player in self.games.iter().map(|g| g.players()).flatten() {
            *counts.entry(player).or_insert(0) += 1;
        }

        counts
    }

    pub fn pair_game_counts(&self) -> HashMap<&Vec<usize>, usize> {
        let mut counts = HashMap::new();

        for pair in self.games.iter().map(|g| g.pairs()).flatten() {
            *counts.entry(pair).or_insert(0) += 1;
        }

        counts
    }

    pub fn next_game(&self) -> Option<Game> {
        let player_game_counts = self.player_game_counts();
        let pair_game_counts = self.pair_game_counts();

        let mut player_ids = self.player_names.iter().enumerate().map(|(index, _)| index).collect_vec();

        if self.gen_strategy == GenStrategy::SHUFFLED {
            player_ids.shuffle(&mut thread_rng());
        }

        let mut game_candidates = player_ids.into_iter().combinations(2).combinations(2).filter(|teams| {
            let mut counts = HashSet::new();
            let mut repeated = HashSet::new();

            for team in teams {
                for player in team {
                    let count = counts.insert(player);
                    if !count {
                        repeated.insert(*player);
                    }
                }
            }

            repeated.len() == 0
        }).sorted_by(|a, b| {
            let a_game_count: usize = a.iter().flatten().map(|player| player_game_counts.get(player).unwrap_or_else(|| &0)).sum();
            let b_game_count: usize = b.iter().flatten().map(|player| player_game_counts.get(player).unwrap_or_else(|| &0)).sum();

            let a_pair_counts: usize = a.iter().map(|pair| pair_game_counts.get(pair).unwrap_or_else(|| &0)).sum();
            let b_pair_counts: usize = b.iter().map(|pair| pair_game_counts.get(pair).unwrap_or_else(|| &0)).sum();

            let a_total = a_game_count + a_pair_counts;
            let b_total = b_game_count + b_pair_counts;

            a_total.cmp(&b_total)
        }).map(|teams| {
            Game { team_a: teams[0].clone(), team_b: teams[1].clone() }
        });

        game_candidates.next()
    }
}
