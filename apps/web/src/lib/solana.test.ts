import { describe, expect, it } from "vitest";
import {
  explorerAddressUrl,
  formatSol,
  shortenAddress,
} from "./solana";

describe("Solana formatting helpers", () => {
  it("formats whole and fractional SOL without floating-point rounding", () => {
    expect(formatSol(0n)).toBe("0");
    expect(formatSol(500_000_000n)).toBe("0.5");
    expect(formatSol(1_000_000_001n)).toBe("1.000000001");
  });

  it("shortens long addresses while preserving both ends", () => {
    expect(shortenAddress("1234567890abcdef", 4)).toBe("1234…cdef");
    expect(shortenAddress("short", 4)).toBe("short");
  });

  it("builds a devnet Explorer URL", () => {
    expect(explorerAddressUrl("abc")).toBe(
      "https://explorer.solana.com/address/abc?cluster=devnet",
    );
  });
});
