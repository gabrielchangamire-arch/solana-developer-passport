import {
  createKeyPairSignerFromBytes,
  createSignerFromKeyPair,
  createSolanaRpc,
  devnet,
} from "@solana/kit";
import { chmod, readFile, writeFile } from "node:fs/promises";

const DEVNET_RPC_URL = "https://api.devnet.solana.com";
const LAMPORTS_PER_SOL = 1_000_000_000n;
const WALLET_FILE = new URL("./wallet.json", import.meta.url);
const rpc = createSolanaRpc(devnet(DEVNET_RPC_URL));

function formatSol(lamports) {
  const whole = lamports / LAMPORTS_PER_SOL;
  const fraction = (lamports % LAMPORTS_PER_SOL)
    .toString()
    .padStart(9, "0")
    .replace(/0+$/, "");

  return fraction ? `${whole}.${fraction}` : whole.toString();
}

async function loadWallet() {
  const contents = await readFile(WALLET_FILE, "utf8");
  const parsed = JSON.parse(contents);

  if (!Array.isArray(parsed.secretKey) || parsed.secretKey.length !== 64) {
    throw new Error("wallet.json does not contain a valid 64-byte keypair");
  }

  const wallet = await createKeyPairSignerFromBytes(
    new Uint8Array(parsed.secretKey),
  );
  console.log("Status: loaded existing wallet");
  return wallet;
}

async function createWallet() {
  // Kit 5 generates non-extractable keys by default. Persistence requires an
  // explicitly extractable Ed25519 keypair, so generate it with Web Crypto.
  const keyPair = await crypto.subtle.generateKey(
    { name: "Ed25519" },
    true,
    ["sign", "verify"],
  );
  const publicKey = new Uint8Array(
    await crypto.subtle.exportKey("raw", keyPair.publicKey),
  );
  const privateKeyPkcs8 = new Uint8Array(
    await crypto.subtle.exportKey("pkcs8", keyPair.privateKey),
  );
  const privateKey = privateKeyPkcs8.slice(-32);

  const secretKey = new Uint8Array(64);
  secretKey.set(privateKey, 0);
  secretKey.set(publicKey, 32);

  await writeFile(
    WALLET_FILE,
    `${JSON.stringify({ secretKey: Array.from(secretKey) })}\n`,
    { mode: 0o600 },
  );
  await chmod(WALLET_FILE, 0o600);

  console.log("Status: created and saved a new wallet");
  return createSignerFromKeyPair(keyPair);
}

async function loadOrCreateWallet() {
  try {
    return await loadWallet();
  } catch (error) {
    if (error?.code === "ENOENT") {
      return createWallet();
    }
    throw error;
  }
}

try {
  const wallet = await loadOrCreateWallet();
  const { value: balance } = await rpc.getBalance(wallet.address).send();

  console.log(`Address: ${wallet.address}`);
  console.log(`Devnet balance: ${formatSol(balance)} SOL`);
  console.log(
    `Explorer: https://explorer.solana.com/address/${wallet.address}?cluster=devnet`,
  );
  console.log("Wallet file: wallet.json (local only; ignored by Git)");
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
