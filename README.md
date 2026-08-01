# Solana Developer Passport

An application-ready Solana portfolio that turns a learning journey into a
verifiable on-chain developer profile.

The project combines a live devnet dashboard with a deployed Anchor program.
Learners connect a browser wallet, create a wallet-owned Passport PDA, and
record independently verifiable learning evidence in milestone PDAs.

## Current capabilities

- Query any Solana address on devnet.
- Display its live SOL balance and recent transactions.
- Link every result to Solana Explorer.
- Validate addresses and show useful RPC errors.
- Discover Wallet Standard wallets without handling private keys.
- Create a learner-owned Passport PDA on devnet.
- Record bounded evidence links in authority-protected milestone PDAs.
- Exercise authorization, duplicate-account, and input-boundary failures in a
  local Solana VM test suite.
- Preserve the original 100 Days of Solana exercises as supporting evidence.

## Live devnet deployment

- [Anchor program](https://explorer.solana.com/address/AeTzaLcDfnov1q64W2GPEupKh427cDnUCW5NbKR9q2Ck?cluster=devnet)
- [Passport PDA](https://explorer.solana.com/address/CUQG45g65XCuvxwUjjssGQAboDTuGsCU6PLzNMrjzn5k?cluster=devnet)
- [Milestone PDA](https://explorer.solana.com/address/Fxfascpz5bEjTtqXthWvDUTmf9BmCsqDKLNgyXBuQMcv?cluster=devnet)
- [Passport creation transaction](https://explorer.solana.com/tx/4kas3UNH7UfzDtdeG6V7NapdC6sDrUGd4JaGF6dbpPeqRckovQqJtv5AMYaLuf3BxbLoW4Knj9kioUpLr6RAcng?cluster=devnet)
- [Milestone transaction](https://explorer.solana.com/tx/32TcKRCo2QbUp32jJNrZLAnAnJFdFrVGvVZ714eVm6hW6kEzb6e5spYLEedCSoNV8knrPKhTneZQ7NRzWgNrLKh9?cluster=devnet)

## Repository layout

```text
apps/web/          React + TypeScript portfolio dashboard
epoch-1/           Completed MLH learning exercises and evidence
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

## Learning progress

| Day | Challenge | Status | Evidence |
| ---: | --- | --- | --- |
| 01 | Generate a keypair and get devnet SOL | Complete | `epoch-1/day-01/evidence/README.md` |
| 02 | Create a wallet and check its balance programmatically | Complete | `epoch-1/day-02/evidence/README.md` |
| Project | Deploy a secure Passport PDA app | Complete | Live Explorer links above |

## Security

All current on-chain activity uses Solana devnet. Never commit a seed phrase,
private key, wallet JSON file, or mainnet credential. The exercise wallet files
are ignored by Git and must never be uploaded manually.
