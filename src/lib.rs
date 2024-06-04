use itertools::Itertools;
use std::collections::{HashMap, HashSet};
use std::ops::Rem;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct Game {
    pub team_a: Vec<usize>,
    pub team_b: Vec<usize>,
}

impl Game {
    /// List all player indexes in the game
    pub fn players(&self) -> Vec<usize> {
        let mut players = self.team_a.clone();
        players.extend(self.team_b.clone());
        players
    }

    /// List the pairs of player indexes in the game
    pub fn pairs(&self) -> [&Vec<usize>; 2] {
        [&self.team_a, &self.team_b]
    }
}

#[derive(Debug, Clone)]
/// A session where multiple games are played with the same group of people
pub struct Session {
    pub player_names: Vec<String>,
    pub games: Vec<Game>,
    /// The number of courts for the session
    pub courts: usize,
    /// The size of the team on one side of the court (i.e. 1 for singles, 2 for doubles)
    pub team_size: usize,
}

impl Default for Session {
    fn default() -> Self {
        Self {
            player_names: Vec::new(),
            games: Vec::new(),
            courts: 1,
            team_size: 2,
        }
    }
}

impl Session {
    pub fn add_game(&mut self, g: Game) {
        self.games.push(g)
    }

    /// Remove a player from the session by their name
    ///
    /// This requires the game history to be reset
    pub fn remove_player(&mut self, player: &str) {
        if let Some(player_index) = self.player_names.iter().position(|x| *x == player) {
            self.games = Vec::new();
            self.player_names.remove(player_index);
        }
    }

    /// Counts for the number of games each player has played
    pub fn player_game_counts(&self) -> HashMap<usize, usize> {
        let mut counts = HashMap::new();

        for player in self.games.iter().flat_map(|g| g.players()) {
            *counts.entry(player).or_insert(0) += 1;
        }

        counts
    }

    /// Counts for the number of games each pair has played
    pub fn pair_game_counts(&self) -> HashMap<&Vec<usize>, usize> {
        let mut counts = HashMap::new();

        for pair in self.games.iter().flat_map(|g| g.pairs()) {
            *counts.entry(pair).or_insert(0) += 1;
        }

        counts
    }

    /// Suggest the next game to be played
    pub fn next_game(&self) -> Option<Game> {
        // calculate the remainder for games divided by courts to get the 'court number' for this game
        let court_number = self.games.len().rem(self.courts);

        let to_exclude: Vec<usize> = {
            // if there is more than 1 court and it is not the first court
            if self.courts > 1 && court_number > 0 {
                // get the players from the first courts and make sure they are not included in the next game
                self.games
                    .iter()
                    .rev()
                    .take(court_number)
                    .flat_map(|game| game.players())
                    .collect_vec()
            } else {
                Vec::new()
            }
        };

        self.generate_game(to_exclude)
    }

    /// Generate a game given a list of players to exclude
    pub fn generate_game(&self, excluded_player_indexes: Vec<usize>) -> Option<Game> {
        // get the number of player and pair counts
        let player_game_counts = self.player_game_counts();
        let pair_game_counts = self.pair_game_counts();

        // get player indexes and remove those which are in the exclusion list
        let player_ids = self
            .player_names
            .iter()
            .enumerate()
            .map(|(index, _)| index)
            .filter(|i| !excluded_player_indexes.contains(i))
            .collect_vec();

        // calculate potential games for the list of player ids
        let mut game_candidates = player_ids
            .into_iter()
            // get team combinations (i.e. one side of a court)
            .combinations(self.team_size)
            // get game combinations (i.e. combinations of two teams)
            .combinations(2)
            // remove any games that aren't possible
            .filter(|teams| {
                let mut counts = HashSet::new();
                let mut repeated = HashSet::new();

                for team in teams {
                    for player in team {
                        let count = counts.insert(player);
                        // this player is used twice in the game
                        if !count {
                            repeated.insert(*player);
                        }
                    }
                }

                repeated.is_empty()
            })
            // sort games to find the best - prioritise games where players have played the least and where the pairs are new
            .sorted_by(|a, b| {
                // for both games, sum the number of games each player has played
                let a_game_count: usize = a
                    .iter()
                    .flatten()
                    .map(|player| player_game_counts.get(player).unwrap_or(&0))
                    .sum();
                let b_game_count: usize = b
                    .iter()
                    .flatten()
                    .map(|player| player_game_counts.get(player).unwrap_or(&0))
                    .sum();

                // for both games, sum the number of games each team has played
                let a_team_counts: usize = a
                    .iter()
                    .map(|pair| pair_game_counts.get(pair).unwrap_or(&0))
                    .sum();
                let b_team_counts: usize = b
                    .iter()
                    .map(|pair| pair_game_counts.get(pair).unwrap_or(&0))
                    .sum();

                // total the number of games each player and team has played
                let a_total = a_game_count + a_team_counts;
                let b_total = b_game_count + b_team_counts;

                // sort the games so the least number of plays comes first
                a_total.cmp(&b_total)
            })
            // convert the list into a game
            .map(|teams| Game {
                team_a: teams[0].clone(),
                team_b: teams[1].clone(),
            });

        // return the first game (i.e. the best)
        game_candidates.next()
    }

    /// Convert a game struct to a string with player names
    pub fn format_game(&self, game: &Game) -> String {
        let default: &String = &"?".to_string();
        game.pairs()
            .map(|pair| {
                pair.iter()
                    .map(|i| self.player_names.get(*i).unwrap_or(default))
                    .join(" and ")
            })
            .join(" vs. ")
    }
}

#[cfg(test)]
mod tests {
    use std::collections::HashSet;

    use crate::Session;

    const TEST_GAMES: usize = 20;

    fn create_test_session() -> Session {
        Session {
            player_names: Vec::from([
                "a".into(),
                "b".into(),
                "c".into(),
                "d".into(),
                "e".into(),
                "f".into(),
                "g".into(),
                "h".into(),
                "i".into(),
            ]),
            games: Vec::new(),
            courts: 1,
            team_size: 2,
        }
    }

    fn generate_test_games(s: &mut Session) {
        for _ in 0..TEST_GAMES {
            s.add_game(s.next_game().unwrap())
        }
    }

    #[test]
    fn game_has_correct_number_of_pairs() {
        let mut session = create_test_session();
        generate_test_games(&mut session);

        let pairs = session
            .games
            .iter()
            .flat_map(|g| g.pairs())
            .collect::<HashSet<_>>();

        assert_eq!(pairs.len(), 36);
    }
}
