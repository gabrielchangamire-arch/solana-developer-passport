# Day 2 — Persistent wallet

This project creates a devnet-only Solana wallet, saves its 64-byte keypair to a
local `wallet.json`, reloads the same wallet on later runs, and retrieves its
live balance from Solana devnet.

## Run

```sh
npm install
npm start
npm start
```

The first run should report `created and saved a new wallet`. The second should
report `loaded existing wallet`, with the same address both times.

## Security

`wallet.json` contains a private key. It has owner-only file permissions and is
excluded by the repository's `.gitignore`. This devnet learning wallet must
never be reused for mainnet funds.
