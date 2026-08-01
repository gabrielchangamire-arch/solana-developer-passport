import { readFile } from "node:fs/promises";
import {
  AccountRole,
  addEncoderSizePrefix,
  address,
  createClient,
  createKeyPairSignerFromBytes,
  getAddressEncoder,
  getBytesEncoder,
  getProgramDerivedAddress,
  getStructEncoder,
  getU16Encoder,
  getU32Encoder,
  getUtf8Encoder,
} from "@solana/kit";
import { solanaRpc } from "@solana/kit-plugin-rpc";
import { signer } from "@solana/kit-plugin-signer";

const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const KEYPAIR_PATH =
  process.env.SOLANA_KEYPAIR || "target/deploy/devnet-deployer-keypair.json";
const PROGRAM_ADDRESS = address(
  "AeTzaLcDfnov1q64W2GPEupKh427cDnUCW5NbKR9q2Ck",
);
const SYSTEM_PROGRAM_ADDRESS = address("11111111111111111111111111111111");
const PASSPORT_SEED = new TextEncoder().encode("passport");
const MILESTONE_SEED = new TextEncoder().encode("milestone");
const INITIALIZE_DISCRIMINATOR = new Uint8Array([
  61, 77, 198, 139, 101, 90, 68, 137,
]);
const RECORD_DISCRIMINATOR = new Uint8Array([
  98, 35, 253, 46, 171, 193, 85, 205,
]);
const MILESTONE_ID = 100;
const borshString = addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder());

const secretBytes = Uint8Array.from(
  JSON.parse(await readFile(KEYPAIR_PATH, "utf8")),
);
const authority = await createKeyPairSignerFromBytes(secretBytes);
const client = createClient()
  .use(signer(authority))
  .use(solanaRpc({ rpcUrl: RPC_URL }));

const passport = (
  await getProgramDerivedAddress({
    programAddress: PROGRAM_ADDRESS,
    seeds: [PASSPORT_SEED, getAddressEncoder().encode(authority.address)],
  })
)[0];
const milestone = (
  await getProgramDerivedAddress({
    programAddress: PROGRAM_ADDRESS,
    seeds: [
      MILESTONE_SEED,
      getAddressEncoder().encode(passport),
      getU16Encoder().encode(MILESTONE_ID),
    ],
  })
)[0];

async function accountExists(accountAddress) {
  const result = await client.rpc
    .getAccountInfo(accountAddress, { commitment: "confirmed", encoding: "base64" })
    .send();
  return result.value !== null;
}

function signerAccount() {
  return {
    address: authority.address,
    role: AccountRole.WRITABLE_SIGNER,
    signer: authority,
  };
}

if (!(await accountExists(passport))) {
  const data = getStructEncoder([
    ["discriminator", getBytesEncoder()],
    ["displayName", borshString],
  ]).encode({
    discriminator: INITIALIZE_DISCRIMINATOR,
    displayName: "Gabriel",
  });
  const result = await client.sendTransaction([
    {
      programAddress: PROGRAM_ADDRESS,
      accounts: [
        signerAccount(),
        { address: passport, role: AccountRole.WRITABLE },
        { address: SYSTEM_PROGRAM_ADDRESS, role: AccountRole.READONLY },
      ],
      data,
    },
  ]);
  console.log(`Passport transaction: ${result.context.signature}`);
} else {
  console.log(`Passport already exists: ${passport}`);
}

if (!(await accountExists(milestone))) {
  const data = getStructEncoder([
    ["discriminator", getBytesEncoder()],
    ["milestoneId", getU16Encoder()],
    ["title", borshString],
    ["evidenceUri", borshString],
  ]).encode({
    discriminator: RECORD_DISCRIMINATOR,
    milestoneId: MILESTONE_ID,
    title: "Developer Passport devnet deployment",
    evidenceUri: `https://explorer.solana.com/address/${PROGRAM_ADDRESS}?cluster=devnet`,
  });
  const result = await client.sendTransaction([
    {
      programAddress: PROGRAM_ADDRESS,
      accounts: [
        signerAccount(),
        { address: passport, role: AccountRole.WRITABLE },
        { address: milestone, role: AccountRole.WRITABLE },
        { address: SYSTEM_PROGRAM_ADDRESS, role: AccountRole.READONLY },
      ],
      data,
    },
  ]);
  console.log(`Milestone transaction: ${result.context.signature}`);
} else {
  console.log(`Milestone already exists: ${milestone}`);
}

console.log(`Passport PDA: ${passport}`);
console.log(`Milestone PDA: ${milestone}`);
