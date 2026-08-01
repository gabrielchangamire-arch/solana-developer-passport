use anchor_lang::prelude::*;

#[constant]
pub const PASSPORT_SEED: &[u8] = b"passport";

#[constant]
pub const MILESTONE_SEED: &[u8] = b"milestone";

pub const MAX_DISPLAY_NAME_LENGTH: usize = 32;
pub const MAX_TITLE_LENGTH: usize = 64;
pub const MAX_EVIDENCE_URI_LENGTH: usize = 200;
