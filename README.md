# Badminton Game Generator

This is a simple program that makes a list of matches given a list of players.

I wrote the initial algorithm with Rust, then wanted to make a Web UI and was lazy so decided to use WASM so I didn't have to re-write the algorithm in TypeScript or JavaScript. The UI uses [Sycamore](https://sycamore-rs.netlify.app/) which is like React for Rust, and [Pico CSS](https://picocss.com/) a classless CSS framework.

## Getting Started

```bash
cargo install --locked trunk
trunk serve
```
