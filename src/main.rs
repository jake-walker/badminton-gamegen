use std::env;
use itertools::Itertools;
use badminton_gamegen::Session;

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
