use anchor_lang::prelude::*;

use crate::{
    Milestone, Passport, PassportError, MILESTONE_SEED, PASSPORT_SEED,
};

#[derive(Accounts)]
#[instruction(milestone_id: u16)]
pub struct CloseMilestone<'info> {
    #[account(mut)]
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
        close = authority,
        has_one = passport,
        has_one = authority @ PassportError::Unauthorized,
        seeds = [MILESTONE_SEED, passport.key().as_ref(), &milestone_id.to_le_bytes()],
        bump = milestone.bump
    )]
    pub milestone: Account<'info, Milestone>,
}

pub fn close_milestone_handler(
    ctx: Context<CloseMilestone>,
    _milestone_id: u16,
) -> Result<()> {
    let passport = &mut ctx.accounts.passport;
    passport.milestone_count = passport
        .milestone_count
        .checked_sub(1)
        .ok_or(PassportError::MilestoneCounterUnderflow)?;
    passport.updated_at = Clock::get()?.unix_timestamp;
    Ok(())
}
