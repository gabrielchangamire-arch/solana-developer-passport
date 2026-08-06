import { FormEvent, useCallback, useEffect, useState } from "react";
import { useClient } from "@solana/react";
import { address } from "@solana/kit";
import {
  useConnect,
  useConnectedWallet,
  useDisconnect,
  useWalletStatus,
  useWallets,
} from "@solana/kit-plugin-wallet/react";
import type { AppClient } from "../lib/client";
import {
  fetchPassport,
  getInitializePassportInstruction,
  getRecordMilestoneInstruction,
  PROGRAM_ADDRESS,
  type PassportAccount,
} from "../lib/passport";
import {
  explorerAddressUrl,
  explorerTransactionUrl,
  shortenAddress,
} from "../lib/solana";

type ActionState = "idle" | "submitting" | "success" | "error";

function messageFrom(reason: unknown): string {
  if (reason instanceof Error) return reason.message;
  return "The transaction could not be completed.";
}

export function PassportPanel() {
  const client = useClient<AppClient>();
  const wallets = useWallets(client);
  const walletStatus = useWalletStatus(client);
  const connected = useConnectedWallet(client);
  const connect = useConnect(client);
  const disconnect = useDisconnect(client);
  const [passport, setPassport] = useState<PassportAccount | null>(null);
  const [displayName, setDisplayName] = useState("Gabriel");
  const [milestoneId, setMilestoneId] = useState("1");
  const [title, setTitle] = useState("First devnet transaction");
  const [evidenceUri, setEvidenceUri] = useState("");
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [actionMessage, setActionMessage] = useState("");
  const [lastSignature, setLastSignature] = useState("");

  const refreshPassport = useCallback(async () => {
    if (!connected) {
      setPassport(null);
      return;
    }
    const account = await fetchPassport(
      connected.signer?.address ?? address(connected.account.address),
    );
    setPassport(account);
  }, [connected]);

  useEffect(() => {
    void refreshPassport().catch(() => setPassport(null));
  }, [refreshPassport]);

  async function initializePassport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!connected?.signer) return;
    setActionState("submitting");
    setActionMessage("Confirm the passport transaction in your wallet.");
    setLastSignature("");

    try {
      const instruction = await getInitializePassportInstruction(
        connected.signer,
        displayName.trim(),
      );
      const result = await client.sendTransaction([instruction]);
      const signature = result.context.signature;
      setLastSignature(signature);
      setActionState("success");
      setActionMessage("Passport created on Solana devnet.");
      await refreshPassport();
    } catch (reason) {
      setActionState("error");
      setActionMessage(messageFrom(reason));
    }
  }

  async function recordMilestone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!connected?.signer) return;
    setActionState("submitting");
    setActionMessage("Confirm the milestone transaction in your wallet.");
    setLastSignature("");

    try {
      const parsedId = Number(milestoneId);
      if (!Number.isInteger(parsedId) || parsedId < 0 || parsedId > 65_535) {
        throw new Error("Milestone ID must be a whole number from 0 to 65,535.");
      }
      const instruction = await getRecordMilestoneInstruction(
        connected.signer,
        parsedId,
        title.trim(),
        evidenceUri.trim(),
      );
      const result = await client.sendTransaction([instruction]);
      const signature = result.context.signature;
      setLastSignature(signature);
      setActionState("success");
      setActionMessage(`Milestone ${parsedId} recorded on devnet.`);
      await refreshPassport();
    } catch (reason) {
      setActionState("error");
      setActionMessage(messageFrom(reason));
    }
  }

  return (
    <section className="passport-section" id="passport">
      <div className="section-heading">
        <div>
          <p className="kicker">Live Anchor program</p>
          <h2>Own your developer passport</h2>
        </div>
        <a
          className="text-link"
          href={explorerAddressUrl(PROGRAM_ADDRESS)}
          target="_blank"
          rel="noreferrer"
        >
          View program ↗
        </a>
      </div>

      <div className="passport-grid">
        <article className="wallet-card">
          <p className="kicker">Wallet-standard connection</p>
          {walletStatus === "pending" || walletStatus === "reconnecting" ? (
            <p className="wallet-copy">Checking for a previous wallet connection…</p>
          ) : connected ? (
            <>
              <div className="connected-row">
                <span className="status-icon success">✓</span>
                <div>
                  <strong>{connected.wallet.name}</strong>
                  <small>{shortenAddress(connected.account.address, 7)}</small>
                </div>
              </div>
              <p className="wallet-copy">
                The app receives a public address and asks the wallet to approve
                each transaction. It never receives the private key.
              </p>
              <button
                className="button-secondary"
                type="button"
                disabled={disconnect.isRunning}
                onClick={() => disconnect.dispatch()}
              >
                {disconnect.isRunning ? "Disconnecting…" : "Disconnect wallet"}
              </button>
            </>
          ) : (
            <>
              <h3>Connect a devnet wallet</h3>
              <p className="wallet-copy">
                Use Phantom, Solflare, or another Wallet Standard wallet. Keep
                the wallet set to devnet and approve only transactions you expect.
              </p>
              <div className="wallet-options">
                {wallets.length > 0 ? (
                  wallets.map((wallet) => (
                    <button
                      className="button-primary"
                      type="button"
                      key={wallet.name}
                      disabled={connect.isRunning}
                      onClick={() => connect.dispatch(wallet)}
                    >
                      Connect {wallet.name}
                    </button>
                  ))
                ) : (
                  <p className="inline-note">
                    No compatible browser wallet was detected. Install or unlock
                    one, then refresh this page.
                  </p>
                )}
              </div>
              {connect.error && (
                <p className="form-error" role="alert">
                  {messageFrom(connect.error)}
                </p>
              )}
            </>
          )}
        </article>

        <article className="passport-card">
          {connected && passport ? (
            <>
              <div className="passport-card-topline">
                <span>Passport PDA</span>
                <span className="roadmap-status status-live">Live</span>
              </div>
              <h3>{passport.displayName}</h3>
              <p className="wallet-copy">
                {passport.milestoneCount} verified milestone
                {passport.milestoneCount === 1 ? "" : "s"} recorded by this wallet.
              </p>
              <a
                className="mono-link"
                href={explorerAddressUrl(passport.address)}
                target="_blank"
                rel="noreferrer"
              >
                {shortenAddress(passport.address, 10)} ↗
              </a>
            </>
          ) : connected ? (
            <form className="program-form" onSubmit={initializePassport}>
              <p className="kicker">Step 1</p>
              <h3>Create your passport PDA</h3>
              <label htmlFor="display-name">Display name</label>
              <input
                id="display-name"
                value={displayName}
                maxLength={32}
                required
                onChange={(event) => setDisplayName(event.target.value)}
              />
              <button
                className="button-primary"
                type="submit"
                disabled={!connected.signer || actionState === "submitting"}
              >
                {actionState === "submitting" ? "Submitting…" : "Create passport"}
              </button>
            </form>
          ) : (
            <div className="locked-state">
              <span aria-hidden="true">◎</span>
              <h3>Your on-chain profile appears here</h3>
              <p>Connect a wallet to derive and read its unique Passport PDA.</p>
            </div>
          )}
        </article>
      </div>

      {connected && passport && (
        <form className="milestone-form" onSubmit={recordMilestone}>
          <div className="form-intro">
            <p className="kicker">Step 2</p>
            <h3>Record a project milestone</h3>
            <p>
              The title and evidence link are stored in a milestone PDA owned by
              your passport authority.
            </p>
          </div>
          <label>
            Milestone ID
            <input
              value={milestoneId}
              type="number"
              min="0"
              max="65535"
              required
              onChange={(event) => setMilestoneId(event.target.value)}
            />
          </label>
          <label>
            Title
            <input
              value={title}
              maxLength={64}
              required
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label>
            Evidence URL
            <input
              value={evidenceUri}
              maxLength={200}
              type="url"
              placeholder="https://github.com/you/project"
              required
              onChange={(event) => setEvidenceUri(event.target.value)}
            />
          </label>
          <button
            className="button-primary"
            type="submit"
            disabled={!connected.signer || actionState === "submitting"}
          >
            {actionState === "submitting" ? "Submitting…" : "Record milestone"}
          </button>
        </form>
      )}

      {actionMessage && (
        <div className={`action-message action-${actionState}`} role="status">
          <span>{actionMessage}</span>
          {lastSignature && (
            <a
              href={explorerTransactionUrl(lastSignature)}
              target="_blank"
              rel="noreferrer"
            >
              View transaction ↗
            </a>
          )}
        </div>
      )}
    </section>
  );
}
