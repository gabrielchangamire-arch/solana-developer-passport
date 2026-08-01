import { address, createSolanaRpc, devnet } from "@solana/kit";

const DEFAULT_RPC_URL = "https://api.devnet.solana.com";
const LAMPORTS_PER_SOL = 1_000_000_000n;

export const DEFAULT_DEMO_ADDRESS =
  "4nD9FMSpm4EGVskBaeZjv9GjZ7HFwYUJFGUmZk56yyQ8";

export type RecentTransaction = {
  blockTime: number | null;
  confirmationStatus: string;
  signature: string;
  succeeded: boolean;
};

export type AccountSnapshot = {
  address: string;
  balanceLamports: bigint;
  balanceSol: string;
  cluster: "devnet";
  fetchedAt: string;
  transactions: RecentTransaction[];
};

export function formatSol(lamports: bigint): string {
  const whole = lamports / LAMPORTS_PER_SOL;
  const fraction = (lamports % LAMPORTS_PER_SOL)
    .toString()
    .padStart(9, "0")
    .replace(/0+$/, "");

  return fraction ? `${whole}.${fraction}` : whole.toString();
}

export function shortenAddress(value: string, size = 5): string {
  if (value.length <= size * 2 + 1) return value;
  return `${value.slice(0, size)}…${value.slice(-size)}`;
}

export function explorerAddressUrl(value: string): string {
  return `https://explorer.solana.com/address/${value}?cluster=devnet`;
}

export function explorerTransactionUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

export async function fetchAccountSnapshot(
  rawAddress: string,
): Promise<AccountSnapshot> {
  const accountAddress = address(rawAddress.trim());
  const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || DEFAULT_RPC_URL;
  const rpc = createSolanaRpc(devnet(rpcUrl));

  const [balanceResponse, signatureResponse] = await Promise.all([
    rpc.getBalance(accountAddress, { commitment: "confirmed" }).send(),
    rpc
      .getSignaturesForAddress(accountAddress, {
        commitment: "confirmed",
        limit: 6,
      })
      .send(),
  ]);

  return {
    address: accountAddress,
    balanceLamports: balanceResponse.value,
    balanceSol: formatSol(balanceResponse.value),
    cluster: "devnet",
    fetchedAt: new Date().toISOString(),
    transactions: signatureResponse.map((transaction) => ({
      blockTime:
        transaction.blockTime === null
          ? null
          : Number(transaction.blockTime),
      confirmationStatus: transaction.confirmationStatus ?? "unknown",
      signature: transaction.signature,
      succeeded: transaction.err === null,
    })),
  };
}
