use anchor_lang::prelude::*;

#[error_code]
pub enum PassportError {
    #[msg("Display name cannot be empty")]
    EmptyDisplayName,
    #[msg("Display name exceeds 32 bytes")]
    DisplayNameTooLong,
    #[msg("Milestone title cannot be empty")]
    EmptyTitle,
    #[msg("Milestone title exceeds 64 bytes")]
    TitleTooLong,
    #[msg("Evidence URI cannot be empty")]
    EmptyEvidenceUri,
    #[msg("Evidence URI exceeds 200 bytes")]
    EvidenceUriTooLong,
    #[msg("Only the passport authority may perform this action")]
    Unauthorized,
    #[msg("Milestone counter overflow")]
    MilestoneCounterOverflow,
    #[msg("Milestone counter underflow")]
    MilestoneCounterUnderflow,
    #[msg("Close all milestone accounts before closing the passport")]
    PassportHasMilestones,
}
