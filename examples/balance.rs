use std::collections::HashMap;

use badminton_gamegen::Session;

const TEST_GAMES: [usize; 5] = [100, 80, 60, 40, 20];
const TRIALS: usize = 10;

fn create_session() -> Session {
    Session {
        player_names: vec![
            "A".to_string(),
            "B".to_string(),
            "C".to_string(),
            "D".to_string(),
            "E".to_string(),
            "F".to_string()
        ],
        games: Vec::new()
    }
}

fn add_games(session: &mut Session, n: usize) {
    for _ in 0..n {
        let g = session.next_game().expect("should be able to generate next game");
        session.add_game(g);
    }
}

fn main() {
    println!("== Similar game counts ==");

    for test_games in TEST_GAMES {
        let mut min: Option<i32> = None;
        let mut max: Option<i32> = None;

        for _ in 0..TRIALS {
            // create a new session and add a number of suggested games
            let mut s = create_session();
            add_games(&mut s, test_games);

            // get counts for the number of games each player has been in
            let mut counts = HashMap::new();
            for player in s.games.iter().map(|g| g.players()).flatten() {
                *counts.entry(player).or_insert(0) += 1;
            }

            let trial_min = *counts.values().min().unwrap();
            let trial_max = *counts.values().max().unwrap();

            if min.is_none() || trial_min < min.unwrap() {
                min = Some(trial_min);
            }

            if max.is_none() || trial_max > max.unwrap() {
                max = Some(trial_max);
            }
        }

        println!("With {} matches, each player will play between {} and {} matches (+/- {})", test_games, min.unwrap(), max.unwrap(), max.unwrap() - min.unwrap());
    }

    println!("== Similar pairings ==");

    for test_games in TEST_GAMES {
        let mut min: Option<i32> = None;
        let mut max: Option<i32> = None;

        for _ in 0..TRIALS {
            // create a new session and add a number of suggested games
            let mut s = create_session();
            add_games(&mut s, test_games);

            for i in 0..s.player_names.len() {
                let mut counts = HashMap::new();

                for game in &s.games {
                    for pair in game.pairs() {
                        if pair.contains(&i) {
                            for player in pair {
                                if player != &i {
                                    *counts.entry(player).or_insert(0) += 1;
                                }
                            }
                        }
                    }
                }

                let trial_min = *counts.values().min().unwrap();
                let trial_max = *counts.values().max().unwrap();

                if min.is_none() || trial_min < min.unwrap() {
                    min = Some(trial_min);
                }

                if max.is_none() || trial_max > max.unwrap() {
                    max = Some(trial_max);
                }

                if counts.len() != s.player_names.len() - 1 {
                    println!("With {} matches, player {} does not play with every other player!", test_games, i);
                }
            }
        }

        println!("With {} matches, each player will play with each player between {} and {} times (+/- {})", test_games, min.unwrap(), max.unwrap(), max.unwrap() - min.unwrap());
    }
}
