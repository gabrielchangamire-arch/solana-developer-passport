use anchor_lang::prelude::*;

use crate::{
    PassportError, MAX_DISPLAY_NAME_LENGTH, MAX_EVIDENCE_URI_LENGTH,
    MAX_TITLE_LENGTH,
};

pub fn validate_display_name(value: &str) -> Result<()> {
    require!(!value.trim().is_empty(), PassportError::EmptyDisplayName);
    require!(
        value.len() <= MAX_DISPLAY_NAME_LENGTH,
        PassportError::DisplayNameTooLong
    );
    Ok(())
}

pub fn validate_title(value: &str) -> Result<()> {
    require!(!value.trim().is_empty(), PassportError::EmptyTitle);
    require!(value.len() <= MAX_TITLE_LENGTH, PassportError::TitleTooLong);
    Ok(())
}

pub fn validate_evidence_uri(value: &str) -> Result<()> {
    require!(
        !value.trim().is_empty(),
        PassportError::EmptyEvidenceUri
    );
    require!(
        value.len() <= MAX_EVIDENCE_URI_LENGTH,
        PassportError::EvidenceUriTooLong
    );
    Ok(())
}
