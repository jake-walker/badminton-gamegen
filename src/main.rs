use badminton_gamegen::Session;
use sycamore::prelude::*;
use web_sys::KeyboardEvent;

#[derive(Debug, Clone, Copy)]
struct AppState {
    pub session: Signal<Session>
}

impl Default for AppState {
    fn default() -> Self {
        AppState {
            session: create_signal(Session::new())
        }
    }
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
                app_state.session.update(|session| session.player_names.push(name));
                // Reset input field.
                input_value.set("".to_string());
            }
        }
    };

    view! {
        h2 { "👥 Players" }

        ul {
            Indexed(
                iterable=player_list,
                view=|player_name| view! {
                    li { (player_name) }
                }
            )
        }

        input(bind:value=input_value, on:keyup=handle_keyup, placeholder="Name")
    }
}

#[component]
fn App<G: Html>() -> View<G> {
    let app_state = AppState::default();
    provide_context(app_state);
    let games_list = create_memo(move || app_state.session.get_clone().games);
    let player_count = create_memo(move || app_state.session.get_clone().player_names.len());

    let handle_add_games = move |_| {
        app_state.session.update(|s| {
            for _ in 0..10 {
                s.add_game(s.next_game().expect("should be able to generate next game"))
            }
        })
    };

    view! {
        header {
            h1 { "🏸 Badminton Game Generator" }
        }

        main {
            section {
                ol {
                    Indexed(
                        iterable=games_list,
                        view=move |game| view! {
                            li { (app_state.session.get_clone().format_game(&game)) }
                        }
                    )
                }

                button(class="btn btn-primary", on:click=handle_add_games, disabled=player_count.get() < 4) { "➕ Add 10 Games" }
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
