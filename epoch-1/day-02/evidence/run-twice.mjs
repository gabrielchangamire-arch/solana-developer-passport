import { spawnSync } from "node:child_process";

const projectDirectory = new URL("../", import.meta.url);
const walletScript = new URL("../persistent-wallet.mjs", import.meta.url);

function runWallet(label) {
  console.log(`\n================ ${label} ================\n`);

  const result = spawnSync(process.execPath, [walletScript.pathname], {
    cwd: projectDirectory,
    encoding: "utf8",
  });

  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

runWallet("RUN 1 — LOAD PERSISTED WALLET");
runWallet("RUN 2 — LOAD THE SAME WALLET AGAIN");
