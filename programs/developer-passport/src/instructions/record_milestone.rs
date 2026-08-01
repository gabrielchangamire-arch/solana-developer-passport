use anchor_lang::prelude::*;

use crate::{
    instructions::validation::{validate_evidence_uri, validate_title},
    Milestone, Passport, PassportError, MILESTONE_SEED, PASSPORT_SEED,
};

#[derive(Accounts)]
#[instruction(milestone_id: u16)]
pub struct RecordMilestone<'info> {
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
        init,
        payer = authority,
        space = Milestone::SPACE,
        seeds = [MILESTONE_SEED, passport.key().as_ref(), &milestone_id.to_le_bytes()],
        bump
    )]
    pub milestone: Account<'info, Milestone>,
    pub system_program: Program<'info, System>,
}

pub fn record_milestone_handler(
    ctx: Context<RecordMilestone>,
    milestone_id: u16,
    title: String,
    evidence_uri: String,
) -> Result<()> {
    validate_title(&title)?;
    validate_evidence_uri(&evidence_uri)?;

    let now = Clock::get()?.unix_timestamp;
    let passport = &mut ctx.accounts.passport;
    passport.milestone_count = passport
        .milestone_count
        .checked_add(1)
        .ok_or(PassportError::MilestoneCounterOverflow)?;
    passport.updated_at = now;

    let milestone = &mut ctx.accounts.milestone;
    milestone.passport = passport.key();
    milestone.authority = ctx.accounts.authority.key();
    milestone.milestone_id = milestone_id;
    milestone.title = title;
    milestone.evidence_uri = evidence_uri;
    milestone.completed_at = now;
    milestone.bump = ctx.bumps.milestone;

    emit!(MilestoneRecorded {
        passport: passport.key(),
        milestone: milestone.key(),
        milestone_id,
        completed_at: now,
    });

    Ok(())
}

#[event]
pub struct MilestoneRecorded {
    pub passport: Pubkey,
    pub milestone: Pubkey,
    pub milestone_id: u16,
    pub completed_at: i64,
}
