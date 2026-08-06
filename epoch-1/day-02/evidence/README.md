# Day 2 exercise evidence

This record shows the persistent wallet's address and balance across two
separate runs of the script.

The evidence visibly includes:

- two clearly separated invocations of the script;
- both runs loading the persisted wallet successfully;
- the same complete public address on both runs;
- the funded devnet balance on both runs;
- no private key material.

Record the final public details here after funding:

- Address: `4nD9FMSpm4EGVskBaeZjv9GjZ7HFwYUJFGUmZk56yyQ8`
- Explorer URL: <https://explorer.solana.com/address/4nD9FMSpm4EGVskBaeZjv9GjZ7HFwYUJFGUmZk56yyQ8?cluster=devnet>
- Funded balance: `0.5 SOL` on devnet
- Airdrop transaction: `2EXfT7sWeSQ4wwV67qQUp6FHqRrcCAyh49RAHQzXpecmx7ShD4Prcg8eLGKXySLRftobEC7KDsrztUBLjDDcjeVw`
- Confirmation: finalized at slot `480319806`

Run `npm run evidence` from the Day 2 directory to print the two verified runs
together for a single screenshot.
