use anchor_lang::{
    prelude::Pubkey, system_program, AccountDeserialize, InstructionData,
    ToAccountMetas,
};
use litesvm::LiteSVM;
use solana_instruction::Instruction;
use solana_keypair::Keypair;
use solana_message::{Message, VersionedMessage};
use solana_signer::Signer;
use solana_transaction::versioned::VersionedTransaction;

use developer_passport::{Milestone, Passport, MILESTONE_SEED, PASSPORT_SEED};

const STARTING_BALANCE: u64 = 10_000_000_000;

fn new_test_context() -> (LiteSVM, Keypair) {
    let authority = Keypair::new();
    let mut svm = LiteSVM::new();
    svm.add_program(
        developer_passport::id(),
        include_bytes!("../../../target/deploy/developer_passport.so"),
    )
    .expect("program should load");
    svm.airdrop(&authority.pubkey(), STARTING_BALANCE)
        .expect("authority should be funded");
    (svm, authority)
}

fn send_instruction(
    svm: &mut LiteSVM,
    signer: &Keypair,
    instruction: Instruction,
) -> litesvm::types::TransactionResult {
    let message = Message::new_with_blockhash(
        &[instruction],
        Some(&signer.pubkey()),
        &svm.latest_blockhash(),
    );
    let transaction = VersionedTransaction::try_new(
        VersionedMessage::Legacy(message),
        &[signer],
    )
    .expect("transaction should sign");
    svm.send_transaction(transaction)
}

fn passport_address(authority: &Pubkey) -> Pubkey {
    Pubkey::find_program_address(
        &[PASSPORT_SEED, authority.as_ref()],
        &developer_passport::id(),
    )
    .0
}

fn milestone_address(passport: &Pubkey, milestone_id: u16) -> Pubkey {
    Pubkey::find_program_address(
        &[
            MILESTONE_SEED,
            passport.as_ref(),
            &milestone_id.to_le_bytes(),
        ],
        &developer_passport::id(),
    )
    .0
}

fn initialize_instruction(authority: Pubkey, display_name: &str) -> Instruction {
    let passport = passport_address(&authority);
    Instruction {
        program_id: developer_passport::id(),
        accounts: developer_passport::accounts::InitializePassport {
            authority,
            passport,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
        data: developer_passport::instruction::InitializePassport {
            display_name: display_name.to_owned(),
        }
        .data(),
    }
}

fn record_instruction(
    authority: Pubkey,
    passport: Pubkey,
    milestone_id: u16,
) -> Instruction {
    let milestone = milestone_address(&passport, milestone_id);
    Instruction {
        program_id: developer_passport::id(),
        accounts: developer_passport::accounts::RecordMilestone {
            authority,
            passport,
            milestone,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
        data: developer_passport::instruction::RecordMilestone {
            milestone_id,
            title: "First devnet transaction".to_owned(),
            evidence_uri: "https://explorer.solana.com/tx/example?cluster=devnet".to_owned(),
        }
        .data(),
    }
}

#[test]
fn creates_a_passport_and_records_a_milestone() {
    let (mut svm, authority) = new_test_context();
    let passport_key = passport_address(&authority.pubkey());
    let milestone_key = milestone_address(&passport_key, 1);

    send_instruction(
        &mut svm,
        &authority,
        initialize_instruction(authority.pubkey(), "Gabriel"),
    )
    .expect("passport initialization should succeed");
    send_instruction(
        &mut svm,
        &authority,
        record_instruction(authority.pubkey(), passport_key, 1),
    )
    .expect("milestone creation should succeed");

    let passport_account = svm
        .get_account(&passport_key)
        .expect("passport account should exist");
    let passport = Passport::try_deserialize(&mut passport_account.data.as_slice())
        .expect("passport account should deserialize");
    assert_eq!(passport.authority, authority.pubkey());
    assert_eq!(passport.display_name, "Gabriel");
    assert_eq!(passport.milestone_count, 1);

    let milestone_account = svm
        .get_account(&milestone_key)
        .expect("milestone account should exist");
    let milestone = Milestone::try_deserialize(&mut milestone_account.data.as_slice())
        .expect("milestone account should deserialize");
    assert_eq!(milestone.passport, passport_key);
    assert_eq!(milestone.authority, authority.pubkey());
    assert_eq!(milestone.milestone_id, 1);
    assert_eq!(milestone.title, "First devnet transaction");
}

#[test]
fn rejects_an_unauthorized_milestone_writer() {
    let (mut svm, authority) = new_test_context();
    let attacker = Keypair::new();
    svm.airdrop(&attacker.pubkey(), STARTING_BALANCE)
        .expect("attacker should be funded for the test");
    let passport_key = passport_address(&authority.pubkey());

    send_instruction(
        &mut svm,
        &authority,
        initialize_instruction(authority.pubkey(), "Gabriel"),
    )
    .expect("passport initialization should succeed");

    let result = send_instruction(
        &mut svm,
        &attacker,
        record_instruction(attacker.pubkey(), passport_key, 2),
    );
    assert!(result.is_err(), "unauthorized write must fail");

    let passport_account = svm
        .get_account(&passport_key)
        .expect("passport should remain intact");
    let passport = Passport::try_deserialize(&mut passport_account.data.as_slice())
        .expect("passport account should deserialize");
    assert_eq!(passport.milestone_count, 0);
}

#[test]
fn rejects_duplicate_milestones_and_oversized_names() {
    let (mut svm, authority) = new_test_context();
    let passport_key = passport_address(&authority.pubkey());

    let long_name = "x".repeat(33);
    let oversized_result = send_instruction(
        &mut svm,
        &authority,
        initialize_instruction(authority.pubkey(), &long_name),
    );
    assert!(oversized_result.is_err(), "oversized display name must fail");
    assert!(svm.get_account(&passport_key).is_none());

    send_instruction(
        &mut svm,
        &authority,
        initialize_instruction(authority.pubkey(), "Gabriel"),
    )
    .expect("valid passport initialization should succeed");
    send_instruction(
        &mut svm,
        &authority,
        record_instruction(authority.pubkey(), passport_key, 7),
    )
    .expect("first milestone creation should succeed");

    let duplicate_result = send_instruction(
        &mut svm,
        &authority,
        record_instruction(authority.pubkey(), passport_key, 7),
    );
    assert!(duplicate_result.is_err(), "duplicate milestone PDA must fail");
}
