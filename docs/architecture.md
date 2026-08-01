# Developer Passport architecture

## Product goal

Developer Passport gives a learner a public Solana profile whose claims can be
verified independently. The web app begins as a read-only account dashboard and
is also a client for an Anchor program deployed to devnet.

## Components

```text
React dashboard
    |
    | Solana Kit RPC reads and typed client writes
    v
Solana devnet
    |
    +-- System-owned wallet account
    +-- Passport PDA (deployed)
    +-- Milestone PDAs (deployed)
    +-- Token-2022 credential mint (Milestone 3)
```

### Web application

- React and TypeScript provide the public portfolio interface.
- Solana Kit validates addresses and performs devnet RPC reads.
- Wallet Standard requests explicit user approval before any write.
- Explorer links make every account and transaction independently verifiable.

### Passport program

The Anchor program derives one passport per learner:

```text
passport = PDA(["passport", authority_public_key], program_id)
```

Each completed milestone will have its own PDA so evidence is append-only and
can be queried without resizing one large account:

```text
milestone = PDA(["milestone", passport, milestone_id], program_id)
```

Implemented instructions:

1. `initialize_passport` creates the learner-owned passport.
2. `record_milestone` stores a bounded evidence URI and completion timestamp.
3. `update_evidence` lets only the passport authority correct its own URI.
4. `close_milestone` removes a milestone and decrements the count.
5. `close_passport` returns rent only after all milestones are closed.

The devnet program ID is
`AeTzaLcDfnov1q64W2GPEupKh427cDnUCW5NbKR9q2Ck`. Its upgrade authority is the
local devnet exercise wallet; no mainnet wallet or funds are involved.

## Trust boundaries

- Public addresses, balances, and transaction signatures are safe to display.
- Browser wallets retain keys and approve every signed transaction.
- The web app never receives seed phrases or raw private keys.
- Anchor constraints enforce signer, PDA seed, ownership, and size invariants
  before a handler mutates state.
