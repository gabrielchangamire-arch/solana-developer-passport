use anchor_lang::prelude::*;

use crate::{
    instructions::validation::validate_evidence_uri, Milestone, Passport,
    PassportError, MILESTONE_SEED, PASSPORT_SEED,
};

#[derive(Accounts)]
#[instruction(milestone_id: u16)]
pub struct UpdateEvidence<'info> {
    pub authority: Signer<'info>,
    #[account(
        mut,
        has_one = authority @ PassportError::Unauthorized,
        seeds = [PASSPORT_SEED, authority.key().as_ref()],
        bump = passport.bump
    )]
    pub passport: Account<'info, Passport>,
    #[account(
        mut,
        has_one = passport,
        has_one = authority @ PassportError::Unauthorized,
        seeds = [MILESTONE_SEED, passport.key().as_ref(), &milestone_id.to_le_bytes()],
        bump = milestone.bump
    )]
    pub milestone: Account<'info, Milestone>,
}

pub fn update_evidence_handler(
    ctx: Context<UpdateEvidence>,
    _milestone_id: u16,
    evidence_uri: String,
) -> Result<()> {
    validate_evidence_uri(&evidence_uri)?;

    let now = Clock::get()?.unix_timestamp;
    ctx.accounts.milestone.evidence_uri = evidence_uri;
    ctx.accounts.passport.updated_at = now;

    Ok(())
}
