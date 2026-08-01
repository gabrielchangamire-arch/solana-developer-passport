use anchor_lang::prelude::*;

use crate::constants::{
    MAX_DISPLAY_NAME_LENGTH, MAX_EVIDENCE_URI_LENGTH, MAX_TITLE_LENGTH,
};

#[account]
pub struct Passport {
    pub authority: Pubkey,
    pub display_name: String,
    pub milestone_count: u16,
    pub bump: u8,
    pub created_at: i64,
    pub updated_at: i64,
}

impl Passport {
    pub const SPACE: usize = 8
        + 32
        + 4
        + MAX_DISPLAY_NAME_LENGTH
        + 2
        + 1
        + 8
        + 8;
}

#[account]
pub struct Milestone {
    pub passport: Pubkey,
    pub authority: Pubkey,
    pub milestone_id: u16,
    pub title: String,
    pub evidence_uri: String,
    pub completed_at: i64,
    pub bump: u8,
}

impl Milestone {
    pub const SPACE: usize = 8
        + 32
        + 32
        + 2
        + 4
        + MAX_TITLE_LENGTH
        + 4
        + MAX_EVIDENCE_URI_LENGTH
        + 8
        + 1;
}
