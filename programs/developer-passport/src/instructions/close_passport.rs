use anchor_lang::prelude::*;

use crate::{Passport, PassportError, PASSPORT_SEED};

#[derive(Accounts)]
pub struct ClosePassport<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        close = authority,
        has_one = authority @ PassportError::Unauthorized,
        seeds = [PASSPORT_SEED, authority.key().as_ref()],
        bump = passport.bump,
        constraint = passport.milestone_count == 0 @ PassportError::PassportHasMilestones
    )]
    pub passport: Account<'info, Passport>,
}

pub fn close_passport_handler(_ctx: Context<ClosePassport>) -> Result<()> {
    Ok(())
}
