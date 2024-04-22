use std::{collections::{HashMap, HashSet}, env};
use itertools::Itertools;

#[derive(Debug)]
struct Game {
    pub team_a: Vec<usize>,
    pub team_b: Vec<usize>
}

impl Game {    
    fn players(&self) -> Vec<usize> {
        let mut players = self.team_a.clone();
        players.extend(self.team_b.clone());
        players
    }
    
    fn pairs(&self) -> [&Vec<usize>; 2] {
        [&self.team_a, &self.team_b]
    }
}

#[derive(Debug)]
struct Session {
    pub player_names: Vec<String>,
    pub games: Vec<Game>
}

impl Session {
    fn new() -> Self {
        Self { player_names: Vec::new(), games: Vec::new() }
    }
    
    fn add_game(&mut self, g: Game) {
        self.games.push(g)
    }

    fn player_game_counts(&self) -> HashMap<usize, usize> {
        let mut counts = HashMap::new();

        for player in self.games.iter().map(|g| g.players()).flatten() {
            *counts.entry(player).or_insert(0) += 1;
        }

        counts
    }
    
    fn pair_game_counts(&self) -> HashMap<&Vec<usize>, usize> {
        let mut counts = HashMap::new();
        
        for pair in self.games.iter().map(|g| g.pairs()).flatten() {
            *counts.entry(pair).or_insert(0) += 1;
        }
        
        counts
    }

    fn next_game(&self) -> Option<Game> {
        let player_game_counts = self.player_game_counts();
        let pair_game_counts = self.pair_game_counts();
        let mut game_candidates = self.player_names.iter().enumerate().map(|(index, _)| index).combinations(2).combinations(2).filter(|teams| {
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

fn main() {
    let args: Vec<String> = env::args().collect();

    let players: Vec<String> = args.get(1).and_then(|x| Some(x.split(",").map(|s| s.to_string()).collect_vec())).unwrap_or_else(|| Vec::new());
    let game_count = args.get(2).and_then(|x| x.parse::<u32>().ok()).unwrap_or_else(|| 20);
    
    let mut session = Session::new();
    session.player_names = players;
    
    for i in 0..game_count {
        if let Some(game) = session.next_game() {
            let game_player_names = game.pairs().map(|pair| pair.iter().map(|i| session.player_names.get(*i).expect("should have a player name for index")).join(" and ")).join(" vs. ");
            println!("Game {} - {}", i+1, game_player_names);
            session.add_game(game);
        } else {
            eprintln!("Unable to get next game");
            break
        }
    }
}
