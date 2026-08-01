import { createClient } from "@solana/kit";
import { solanaRpc } from "@solana/kit-plugin-rpc";
import { walletSigner } from "@solana/kit-plugin-wallet";

export const RPC_URL =
  import.meta.env.VITE_SOLANA_RPC_URL || "https://api.devnet.solana.com";

export const client = createClient()
  .use(walletSigner({ chain: "solana:devnet" }))
  .use(solanaRpc({ rpcUrl: RPC_URL }));

export type AppClient = Awaited<typeof client>;
