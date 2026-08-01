import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  AccountSnapshot,
  DEFAULT_DEMO_ADDRESS,
  explorerAddressUrl,
  explorerTransactionUrl,
  fetchAccountSnapshot,
  shortenAddress,
} from "./lib/solana";
import { PassportPanel } from "./components/PassportPanel";

type LoadState = "idle" | "loading" | "success" | "error";

const roadmap = [
  {
    eyebrow: "Milestone 01",
    title: "Read the network",
    description: "Live balance, account validation, and transaction history.",
    status: "Live",
  },
  {
    eyebrow: "Milestone 02",
    title: "Own progress on-chain",
    description: "Anchor program with a learner-owned passport PDA.",
    status: "Live",
  },
  {
    eyebrow: "Milestone 03",
    title: "Issue proof",
    description: "A non-transferable Token-2022 completion credential.",
    status: "Planned",
  },
];

function formatTimestamp(value: number | null): string {
  if (value === null) return "Pending timestamp";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value * 1000));
}

function App() {
  const [query, setQuery] = useState(DEFAULT_DEMO_ADDRESS);
  const [snapshot, setSnapshot] = useState<AccountSnapshot | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState("");

  const loadAccount = useCallback(async (value: string) => {
    setLoadState("loading");
    setError("");

    try {
      const result = await fetchAccountSnapshot(value);
      setSnapshot(result);
      setLoadState("success");
    } catch (reason) {
      setLoadState("error");
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to read this account from Solana devnet.",
      );
    }
  }, []);

  useEffect(() => {
    void loadAccount(DEFAULT_DEMO_ADDRESS);
  }, [loadAccount]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadAccount(query);
  }

  return (
    <main>
      <nav className="nav-shell" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Developer Passport home">
          <span className="brand-mark" aria-hidden="true">
            DP
          </span>
          <span>Developer Passport</span>
        </a>
        <div className="nav-meta">
          <span className="network-dot" aria-hidden="true" />
          Solana devnet
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker">Verifiable learning, built in public</p>
          <h1>
            Your Solana progress,
            <span> written on-chain.</span>
          </h1>
          <p className="hero-description">
            Developer Passport turns hands-on milestones into a public,
            inspectable profile—starting with live account data and growing into
            an authenticated Anchor program.
          </p>
        </div>

        <form className="lookup" onSubmit={handleSubmit}>
          <label htmlFor="wallet-address">Inspect a devnet address</label>
          <div className="lookup-row">
            <input
              id="wallet-address"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Paste a Solana address"
              spellCheck="false"
              autoComplete="off"
            />
            <button type="submit" disabled={loadState === "loading"}>
              {loadState === "loading" ? "Reading…" : "Read account"}
            </button>
          </div>
          {loadState === "error" && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </section>

      <section className="account-section" aria-live="polite">
        <div className="section-heading">
          <div>
            <p className="kicker">Live network snapshot</p>
            <h2>Account overview</h2>
          </div>
          {snapshot && (
            <a
              className="text-link"
              href={explorerAddressUrl(snapshot.address)}
              target="_blank"
              rel="noreferrer"
            >
              Open in Explorer ↗
            </a>
          )}
        </div>

        <div className={`snapshot-grid ${loadState === "loading" ? "is-loading" : ""}`}>
          <article className="metric-card metric-primary">
            <span>Balance</span>
            <strong>{snapshot ? `${snapshot.balanceSol} SOL` : "—"}</strong>
            <small>Confirmed on devnet</small>
          </article>
          <article className="metric-card">
            <span>Address</span>
            <strong className="address-value">
              {snapshot ? shortenAddress(snapshot.address, 7) : "—"}
            </strong>
            <small>{snapshot ? snapshot.address : "Waiting for account"}</small>
          </article>
          <article className="metric-card">
            <span>Recent activity</span>
            <strong>{snapshot ? snapshot.transactions.length : "—"}</strong>
            <small>Latest confirmed signatures</small>
          </article>
        </div>

        <div className="activity-panel">
          <div className="activity-header">
            <div>
              <p className="kicker">Public proof</p>
              <h3>Recent transactions</h3>
            </div>
            <span className="mono-caption">
              {snapshot
                ? `Fetched ${new Date(snapshot.fetchedAt).toLocaleTimeString()}`
                : "Waiting for RPC"}
            </span>
          </div>

          {snapshot && snapshot.transactions.length > 0 ? (
            <div className="transaction-list">
              {snapshot.transactions.map((transaction) => (
                <a
                  className="transaction-row"
                  href={explorerTransactionUrl(transaction.signature)}
                  key={transaction.signature}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className={`status-icon ${transaction.succeeded ? "success" : "failed"}`}>
                    {transaction.succeeded ? "✓" : "!"}
                  </span>
                  <span>
                    <strong>{shortenAddress(transaction.signature, 8)}</strong>
                    <small>{formatTimestamp(transaction.blockTime)} UTC</small>
                  </span>
                  <span className="transaction-status">
                    {transaction.confirmationStatus}
                  </span>
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              {loadState === "loading"
                ? "Reading Solana devnet…"
                : "No recent transactions found for this address."}
            </div>
          )}
        </div>
      </section>

      <PassportPanel />

      <section className="roadmap-section">
        <div className="section-heading">
          <div>
            <p className="kicker">Build roadmap</p>
            <h2>From reader to program author</h2>
          </div>
          <p className="section-note">
            Each milestone adds a verifiable layer to the same product.
          </p>
        </div>

        <div className="roadmap-grid">
          {roadmap.map((item) => (
            <article className="roadmap-card" key={item.eyebrow}>
              <div className="roadmap-topline">
                <span>{item.eyebrow}</span>
                <span className={`roadmap-status status-${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <p>Built for the MLH Solana learning journey.</p>
        <p>TypeScript · React · Solana Kit · Rust · Anchor</p>
      </footer>
    </main>
  );
}

export default App;
