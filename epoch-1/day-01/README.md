# Day 1 — Generate a keypair and get devnet SOL

This project generates a new Solana keypair locally, prints only its public
address, and checks balances through Solana's public devnet RPC endpoint.

## Run

```sh
npm install
npm start
```

Copy the generated public address into [Solana Faucet](https://faucet.solana.com/)
and select **Devnet**. Once the airdrop completes, verify the balance without
creating another wallet:

```sh
npm run check -- YOUR_SOLANA_ADDRESS
```

Open the printed Explorer link to verify the address and funded devnet balance
for the exercise record.

## What I learned

- A Solana keypair is generated locally; the public key becomes the wallet address.
- Devnet and mainnet use the same address format but maintain different state.
- One SOL equals 1,000,000,000 lamports.
- A private key proves authority and must never be logged or committed.

The Day 1 key only lives in memory, as required by the exercise. Day 2 introduces
a separate devnet-only keypair that persists safely between script runs.
