import { expect, it } from "vitest";
import { address } from "@solana/kit";
import { fetchPassport, PROGRAM_ADDRESS } from "./passport";
import { DEFAULT_DEMO_ADDRESS, fetchAccountSnapshot } from "./solana";

const liveIt = process.env.RUN_SOLANA_INTEGRATION === "1" ? it : it.skip;

liveIt("reads the funded demo wallet from Solana devnet", async () => {
  const snapshot = await fetchAccountSnapshot(DEFAULT_DEMO_ADDRESS);

  expect(snapshot.address).toBe(DEFAULT_DEMO_ADDRESS);
  expect(snapshot.cluster).toBe("devnet");
  expect(snapshot.balanceLamports).toBeGreaterThan(0n);
  expect(snapshot.transactions.length).toBeGreaterThan(0);
});

liveIt("reads the deployed Passport PDA from Solana devnet", async () => {
  const passport = await fetchPassport(address(DEFAULT_DEMO_ADDRESS));

  expect(PROGRAM_ADDRESS).toBe(
    "AeTzaLcDfnov1q64W2GPEupKh427cDnUCW5NbKR9q2Ck",
  );
  expect(passport?.displayName).toBe("Gabriel");
  expect(passport?.milestoneCount).toBeGreaterThanOrEqual(1);
});
