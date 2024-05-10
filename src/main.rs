use itertools::Itertools;
use badminton_gamegen::{GenStrategy, Session};
use yew::prelude::*;

#[function_component]
fn App() -> Html {
    let session = use_state(|| Session {
        games: Vec::new(),
        gen_strategy: GenStrategy::NORMAL,
        player_names: Vec::from(["Jake".into(), "Alice".into(), "Bob".into(), "Carol".into()])
    });

    html!{
        <div>
            <p>{ session.next_game().unwrap().pairs().map(|pair| pair.iter().map(|i| session.player_names.get(*i).expect("should have a player name for index")).join(" and ")).join(" vs. ") }</p>
        </div>
    }
}

fn main() {
    yew::Renderer::<App>::new().render();
}
