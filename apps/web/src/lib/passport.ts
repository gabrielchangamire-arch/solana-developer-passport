import {
  AccountRole,
  addEncoderSizePrefix,
  address,
  createSolanaRpc,
  devnet,
  getAddressDecoder,
  getAddressEncoder,
  getBase64Encoder,
  getBytesEncoder,
  getProgramDerivedAddress,
  getStructEncoder,
  getU16Encoder,
  getU32Encoder,
  getUtf8Encoder,
  type Address,
  type Instruction,
  type InstructionWithSigners,
  type TransactionSigner,
} from "@solana/kit";
import { RPC_URL } from "./client";

export const PROGRAM_ADDRESS = address(
  "AeTzaLcDfnov1q64W2GPEupKh427cDnUCW5NbKR9q2Ck",
);
export const SYSTEM_PROGRAM_ADDRESS = address(
  "11111111111111111111111111111111",
);

const PASSPORT_SEED = new TextEncoder().encode("passport");
const MILESTONE_SEED = new TextEncoder().encode("milestone");
const INITIALIZE_PASSPORT_DISCRIMINATOR = new Uint8Array([
  61, 77, 198, 139, 101, 90, 68, 137,
]);
const RECORD_MILESTONE_DISCRIMINATOR = new Uint8Array([
  98, 35, 253, 46, 171, 193, 85, 205,
]);

const borshStringEncoder = addEncoderSizePrefix(
  getUtf8Encoder(),
  getU32Encoder(),
);

export type PassportAccount = {
  address: Address;
  authority: Address;
  displayName: string;
  milestoneCount: number;
  createdAt: bigint;
  updatedAt: bigint;
};

export async function derivePassportAddress(
  authority: Address,
): Promise<Address> {
  return (
    await getProgramDerivedAddress({
      programAddress: PROGRAM_ADDRESS,
      seeds: [PASSPORT_SEED, getAddressEncoder().encode(authority)],
    })
  )[0];
}

export async function deriveMilestoneAddress(
  passport: Address,
  milestoneId: number,
): Promise<Address> {
  return (
    await getProgramDerivedAddress({
      programAddress: PROGRAM_ADDRESS,
      seeds: [
        MILESTONE_SEED,
        getAddressEncoder().encode(passport),
        getU16Encoder().encode(milestoneId),
      ],
    })
  )[0];
}

export async function getInitializePassportInstruction(
  authority: TransactionSigner,
  displayName: string,
): Promise<Instruction & InstructionWithSigners> {
  const passport = await derivePassportAddress(authority.address);
  const data = getStructEncoder([
    ["discriminator", getBytesEncoder()],
    ["displayName", borshStringEncoder],
  ]).encode({
    discriminator: INITIALIZE_PASSPORT_DISCRIMINATOR,
    displayName,
  });

  const accounts = [
    {
      address: authority.address,
      role: AccountRole.WRITABLE_SIGNER,
      signer: authority,
    },
    { address: passport, role: AccountRole.WRITABLE },
    { address: SYSTEM_PROGRAM_ADDRESS, role: AccountRole.READONLY },
  ] as const;

  return {
    programAddress: PROGRAM_ADDRESS,
    accounts,
    data,
  };
}

export async function getRecordMilestoneInstruction(
  authority: TransactionSigner,
  milestoneId: number,
  title: string,
  evidenceUri: string,
): Promise<Instruction & InstructionWithSigners> {
  const passport = await derivePassportAddress(authority.address);
  const milestone = await deriveMilestoneAddress(passport, milestoneId);
  const data = getStructEncoder([
    ["discriminator", getBytesEncoder()],
    ["milestoneId", getU16Encoder()],
    ["title", borshStringEncoder],
    ["evidenceUri", borshStringEncoder],
  ]).encode({
    discriminator: RECORD_MILESTONE_DISCRIMINATOR,
    milestoneId,
    title,
    evidenceUri,
  });

  const accounts = [
    {
      address: authority.address,
      role: AccountRole.WRITABLE_SIGNER,
      signer: authority,
    },
    { address: passport, role: AccountRole.WRITABLE },
    { address: milestone, role: AccountRole.WRITABLE },
    { address: SYSTEM_PROGRAM_ADDRESS, role: AccountRole.READONLY },
  ] as const;

  return {
    programAddress: PROGRAM_ADDRESS,
    accounts,
    data,
  };
}

function readBorshString(data: Uint8Array, offset: number) {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const length = view.getUint32(offset, true);
  const start = offset + 4;
  const end = start + length;
  return {
    value: new TextDecoder().decode(data.subarray(start, end)),
    nextOffset: end,
  };
}

export function decodePassportAccount(
  accountAddress: Address,
  data: Uint8Array,
): PassportAccount {
  if (data.length < 63) {
    throw new Error("Passport account data is incomplete.");
  }

  const authority = getAddressDecoder().decode(data.subarray(8, 40));
  const displayName = readBorshString(data, 40);
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const milestoneCount = view.getUint16(displayName.nextOffset, true);
  const createdAtOffset = displayName.nextOffset + 3;

  return {
    address: accountAddress,
    authority,
    displayName: displayName.value,
    milestoneCount,
    createdAt: view.getBigInt64(createdAtOffset, true),
    updatedAt: view.getBigInt64(createdAtOffset + 8, true),
  };
}

export async function fetchPassport(
  authority: Address,
): Promise<PassportAccount | null> {
  const passportAddress = await derivePassportAddress(authority);
  const rpc = createSolanaRpc(devnet(RPC_URL));
  const response = await rpc
    .getAccountInfo(passportAddress, {
      commitment: "confirmed",
      encoding: "base64",
    })
    .send();

  if (!response.value) return null;
  const bytes = new Uint8Array(
    getBase64Encoder().encode(response.value.data[0]),
  );
  return decodePassportAccount(passportAddress, bytes);
}
