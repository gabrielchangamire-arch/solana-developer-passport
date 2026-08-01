pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use error::*;
pub use instructions::*;
pub use state::*;

declare_id!("AeTzaLcDfnov1q64W2GPEupKh427cDnUCW5NbKR9q2Ck");

#[program]
pub mod developer_passport {
    use super::*;

    pub fn initialize_passport(
        ctx: Context<InitializePassport>,
        display_name: String,
    ) -> Result<()> {
        initialize_passport::initialize_passport_handler(ctx, display_name)
    }

    pub fn record_milestone(
        ctx: Context<RecordMilestone>,
        milestone_id: u16,
        title: String,
        evidence_uri: String,
    ) -> Result<()> {
        record_milestone::record_milestone_handler(
            ctx,
            milestone_id,
            title,
            evidence_uri,
        )
    }

    pub fn update_evidence(
        ctx: Context<UpdateEvidence>,
        milestone_id: u16,
        evidence_uri: String,
    ) -> Result<()> {
        update_evidence::update_evidence_handler(ctx, milestone_id, evidence_uri)
    }

    pub fn close_milestone(
        ctx: Context<CloseMilestone>,
        milestone_id: u16,
    ) -> Result<()> {
        close_milestone::close_milestone_handler(ctx, milestone_id)
    }

    pub fn close_passport(ctx: Context<ClosePassport>) -> Result<()> {
        close_passport::close_passport_handler(ctx)
    }
}
