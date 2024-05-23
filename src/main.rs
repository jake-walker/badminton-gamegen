use badminton_gamegen::{GenStrategy, Session};
use sycamore::prelude::*;
use web_sys::KeyboardEvent;

#[derive(Debug, Clone, Copy)]
struct AppState {
    pub session: Signal<Session>,
}

impl Default for AppState {
    fn default() -> Self {
        AppState {
            session: create_signal(Session::default()),
        }
    }
}

#[derive(Props, Clone)]
struct PlayerItemProps {
    name: String,
}

#[component]
fn Configuration<G: Html>() -> View<G> {
    let app_state = use_context::<AppState>();
    let input_value = create_signal("".to_string());
    let player_list = create_memo(move || app_state.session.get_clone().player_names);

    let handle_keyup = move |event: KeyboardEvent| {
        if event.key() == "Enter" {
            let name = input_value.with(|name| name.trim().to_string());

            if !name.is_empty() {
                app_state
                    .session
                    .update(|session| session.player_names.push(name));
                // Reset input field.
                input_value.set("".to_string());
            }
        }
    };

    let handle_increase_courts = move |_| {
        app_state.session.update(|s| {
            s.courts = s.courts.checked_add(1).unwrap_or(s.courts);
        })
    };

    let handle_decrease_courts = move |_| {
        app_state.session.update(|s| {
            if s.courts >= 2 {
                s.courts = s.courts.checked_sub(1).unwrap_or(s.courts);
            }
        })
    };

    let handle_increase_team_size = move |_| {
        app_state.session.update(|s| {
            s.team_size = s.team_size.checked_add(1).unwrap_or(s.team_size);
        })
    };

    let handle_decrease_team_size = move |_| {
        app_state.session.update(|s| {
            if s.team_size >= 2 {
                s.team_size = s.team_size.checked_sub(1).unwrap_or(s.team_size);
            }
        })
    };

    let handle_change_strategy = move |_| {
        app_state.session.update(|s| {
            s.gen_strategy = {
                match s.gen_strategy {
                    GenStrategy::NORMAL => GenStrategy::SHUFFLED,
                    GenStrategy::SHUFFLED => GenStrategy::NORMAL,
                }
            }
        })
    };

    view! {
        h2 { "🔧 Config" }

        ul {
            li {
                "Courts: " (app_state.session.get_clone().courts) " "
                a(href="#", on:click=handle_increase_courts) { "(+)" } " "
                a(href="#", on:click=handle_decrease_courts) { "(-)" }
            }
            li {
                "Team Size: " (app_state.session.get_clone().team_size) " "
                a(href="#", on:click=handle_increase_team_size) { "(+)" } " "
                a(href="#", on:click=handle_decrease_team_size) { "(-)" }
            }
            li {
                "Generation Strategy: " (app_state.session.get_clone().gen_strategy.to_string()) " "
                a(href="#", on:click=handle_change_strategy) { "(change)" }
            }
        }

        h2 { "👥 Players" }

        ul {
            Indexed(
                iterable=player_list,
                view=|player_name| view! {
                    PlayerItem(name=player_name)
                }
            )
        }

        input(bind:value=input_value, on:keyup=handle_keyup, placeholder="Name")
    }
}

#[component]
fn PlayerItem<G: Html>(props: PlayerItemProps) -> View<G> {
    let app_state = use_context::<AppState>();

    let props_clone = props.clone();

    let handle_remove_player = move |_| {
        app_state
            .session
            .update(|session| session.remove_player(&props_clone.name));
    };

    view! {
        li {
            (props.name)
            " "
            a(href="#", on:click=handle_remove_player) { "(remove)" }
        }
    }
}

#[component]
fn App<G: Html>() -> View<G> {
    let app_state = AppState::default();
    provide_context(app_state);

    let error_message: Signal<String> = create_signal("".into());
    let games_list = create_memo(move || app_state.session.get_clone().games);

    let handle_add_games = move |_| {
        app_state.session.update(|s| {
            for _ in 0..10 {
                if let Some(game) = s.next_game() {
                    s.add_game(game)
                } else {
                    error_message.set("Could not generate the next game. Ensure you have enough players to fill an entire game.".into());
                }
            }
        })
    };

    view! {
        header {
            h1 { "🏸 Badminton Game Generator" }
        }

        main {
            (if error_message.get_clone() != "" {
                view! {
                    p(class="pico-color-red-500") { "Uh oh! " (error_message.get_clone()) }
                }
            } else { view! {} })

            section {
                ol {
                    Indexed(
                        iterable=games_list,
                        view=move |game| view! {
                            li { (app_state.session.get_clone().format_game(&game)) }
                        }
                    )
                }

                button(on:click=handle_add_games) { "➕ Add 10 Games" }
            }

            section {
                Configuration {}
            }
        }

        footer {
            p {
                small {
                    "Made with ❤️ by "
                    a(href="https://jakew.me") { "Jake" }
                    " • "
                    a(href="https://github.com/jake-walker/badminton-gamegen") { "Source Code" }
                }
            }
        }
    }
}

fn main() {
    sycamore::render(App);
}
