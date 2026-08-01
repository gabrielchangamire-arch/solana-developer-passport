import {
  address,
  createSolanaRpc,
  devnet,
  generateKeyPairSigner,
} from "@solana/kit";

const DEVNET_RPC_URL = "https://api.devnet.solana.com";
const LAMPORTS_PER_SOL = 1_000_000_000n;
const rpc = createSolanaRpc(devnet(DEVNET_RPC_URL));

function formatSol(lamports) {
  const whole = lamports / LAMPORTS_PER_SOL;
  const fraction = (lamports % LAMPORTS_PER_SOL)
    .toString()
    .padStart(9, "0")
    .replace(/0+$/, "");

  return fraction ? `${whole}.${fraction}` : whole.toString();
}

async function getBalance(walletAddress) {
  const { value } = await rpc.getBalance(walletAddress).send();
  return value;
}

async function checkExistingWallet(rawAddress) {
  if (!rawAddress) {
    throw new Error(
      "Missing address. Usage: npm run check -- <SOLANA_ADDRESS>",
    );
  }

  const walletAddress = address(rawAddress);
  const balance = await getBalance(walletAddress);

  console.log(`Wallet address: ${walletAddress}`);
  console.log(`Devnet balance: ${formatSol(balance)} SOL`);
  console.log(
    `Explorer: https://explorer.solana.com/address/${walletAddress}?cluster=devnet`,
  );
}

async function createWallet() {
  const wallet = await generateKeyPairSigner();
  const balance = await getBalance(wallet.address);

  console.log("Your new Solana devnet wallet");
  console.log("--------------------------------");
  console.log(`Wallet address: ${wallet.address}`);
  console.log(`Devnet balance: ${formatSol(balance)} SOL`);
  console.log(
    `Explorer: https://explorer.solana.com/address/${wallet.address}?cluster=devnet`,
  );
  console.log("\nFund this address at https://faucet.solana.com/ (select Devnet).");
  console.log(
    `Then verify it with: npm run check -- ${wallet.address}`,
  );
  console.log(
    "\nThe private key existed only in memory and was never printed or saved.",
  );
}

const [command, value] = process.argv.slice(2);

try {
  if (command === "--check") {
    await checkExistingWallet(value);
  } else if (command) {
    throw new Error(`Unknown argument: ${command}`);
  } else {
    await createWallet();
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
