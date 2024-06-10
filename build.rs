use std::error::Error;

use vergen::EmitBuilder;

pub fn main() -> Result<(), Box<dyn Error>> {
    // NOTE: This will output everything, and requires all features enabled.
    // NOTE: See the EmitBuilder documentation for configuration options.
    EmitBuilder::builder().all_build().git_sha(true).git_commit_message().emit()?;
    Ok(())
}
