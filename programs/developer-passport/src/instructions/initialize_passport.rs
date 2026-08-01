use anchor_lang::prelude::*;

use crate::{instructions::validation::validate_display_name, Passport, PASSPORT_SEED};

#[derive(Accounts)]
pub struct InitializePassport<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = Passport::SPACE,
        seeds = [PASSPORT_SEED, authority.key().as_ref()],
        bump
    )]
    pub passport: Account<'info, Passport>,
    pub system_program: Program<'info, System>,
}

pub fn initialize_passport_handler(
    ctx: Context<InitializePassport>,
    display_name: String,
) -> Result<()> {
    validate_display_name(&display_name)?;

    let now = Clock::get()?.unix_timestamp;
    let passport = &mut ctx.accounts.passport;
    passport.authority = ctx.accounts.authority.key();
    passport.display_name = display_name;
    passport.milestone_count = 0;
    passport.bump = ctx.bumps.passport;
    passport.created_at = now;
    passport.updated_at = now;

    emit!(PassportInitialized {
        authority: passport.authority,
        passport: passport.key(),
        created_at: now,
    });

    Ok(())
}

#[event]
pub struct PassportInitialized {
    pub authority: Pubkey,
    pub passport: Pubkey,
    pub created_at: i64,
}
