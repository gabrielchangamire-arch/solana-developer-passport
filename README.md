# Solana Developer Passport

Solana Developer Passport is a self-directed Solana project that implements a
verifiable on-chain developer profile with a deployed Anchor program and a
React/TypeScript dashboard.

Inspired by MLH’s available 100 Days of Solana curriculum.

The project combines a live devnet dashboard with a deployed Anchor program.
A connected browser wallet creates an authority-owned Passport PDA and records
independently verifiable project evidence in Milestone PDAs.

The `epoch-1/` directory contains two introductory wallet and RPC exercises
that provided background context. The core Developer Passport is original work
that goes beyond those exercises: it includes the Rust/Anchor program, PDA
architecture, authorization rules, input validation, tests, React/TypeScript
integration, and devnet deployment.

## Current capabilities

- Query any Solana address on devnet.
- Display its live SOL balance and recent transactions.
- Link every result to Solana Explorer.
- Validate addresses and show useful RPC errors.
- Discover Wallet Standard wallets without handling private keys.
- Create an authority-owned Passport PDA on devnet.
- Record bounded evidence links in authority-protected milestone PDAs.
- Exercise authorization, duplicate-account, and input-boundary failures in a
  local Solana VM test suite.
- Retain two introductory wallet and RPC exercises as background context.

## Code Sample Guide

This is a solo project. Engineering reviewers can start with these
representative original files:

- `programs/developer-passport/src/instructions/initialize_passport.rs` —
  creates the authority-derived Passport PDA and initializes its state.
- `programs/developer-passport/src/instructions/record_milestone.rs` — creates
  deterministic Milestone PDAs with authority checks and checked state updates.
- `programs/developer-passport/src/instructions/update_evidence.rs` — restricts
  evidence updates to the Passport authority.
- `programs/developer-passport/src/state.rs` — defines fixed account layouts
  and bounded storage capacity.
- `programs/developer-passport/tests/passport.rs` — exercises success,
  authorization failure, oversized input, and duplicate PDA behavior in
  LiteSVM.
- `apps/web/src/components/PassportPanel.tsx` — connects Wallet Standard to the
  React transaction and account-reading flow.
- `apps/web/src/lib/solana.ts` — performs live devnet reads and builds Explorer
  links without floating-point balance conversion.
- `apps/web/src/lib/solana.test.ts` — verifies balance formatting, address
  shortening, and devnet Explorer URLs.

Reviewers can examine deterministic Passport and Milestone PDAs; signer,
ownership, and seed authorization; bounded string validation; checked state
updates; duplicate-account prevention; LiteSVM security and failure-path tests;
Wallet Standard and React/TypeScript integration; and live Solana devnet reads
with Explorer-verifiable evidence.

## Live devnet deployment

- [Anchor program](https://explorer.solana.com/address/AeTzaLcDfnov1q64W2GPEupKh427cDnUCW5NbKR9q2Ck?cluster=devnet)
- [Passport PDA](https://explorer.solana.com/address/CUQG45g65XCuvxwUjjssGQAboDTuGsCU6PLzNMrjzn5k?cluster=devnet)
- [Milestone PDA](https://explorer.solana.com/address/Fxfascpz5bEjTtqXthWvDUTmf9BmCsqDKLNgyXBuQMcv?cluster=devnet)
- [Passport creation transaction](https://explorer.solana.com/tx/4kas3UNH7UfzDtdeG6V7NapdC6sDrUGd4JaGF6dbpPeqRckovQqJtv5AMYaLuf3BxbLoW4Knj9kioUpLr6RAcng?cluster=devnet)
- [Milestone transaction](https://explorer.solana.com/tx/32TcKRCo2QbUp32jJNrZLAnAnJFdFrVGvVZ714eVm6hW6kEzb6e5spYLEedCSoNV8knrPKhTneZQ7NRzWgNrLKh9?cluster=devnet)

## Repository layout

```text
apps/web/          React + TypeScript portfolio dashboard
epoch-1/           Introductory wallet and RPC exercises retained for context
programs/          Rust + Anchor Developer Passport program
scripts/           Repeatable live-devnet verification
docs/              Architecture, roadmap, and security notes
```

## Run the dashboard

```sh
npm install
npm run dev
```

Then open the local URL printed by Vite. The dashboard defaults to the
persistent devnet wallet created in Day 2.

## Verify

```sh
npm test
npm run build
cargo test --package developer-passport
RUN_SOLANA_INTEGRATION=1 npm run test:integration
```

`npm run verify:devnet` is idempotent and verifies the live Passport and
milestone accounts. It requires a funded devnet keypair at
`target/deploy/devnet-deployer-keypair.json`, which is ignored by Git.

## Curriculum context

The introductory exercises cover generating a devnet keypair and loading a
persistent devnet wallet for RPC balance checks. They are retained as context,
not as evidence of official campaign participation or completion. I used the
available curriculum independently as inspiration, then designed and built the
Developer Passport as the original project described above.

## Security

All current on-chain activity uses Solana devnet. Never commit a seed phrase,
private key, wallet JSON file, or mainnet credential. The exercise wallet files
are ignored by Git and must never be uploaded manually.
