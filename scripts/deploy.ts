import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { network } from "hardhat";
import "dotenv/config";

const connection = await network.create();
const { ethers } = connection;
const [deployer, firstAccount, secondAccount] = await ethers.getSigners();

const supplierAddress = process.env.SUPPLIER_ADDRESS || firstAccount.address;
const receiverAddress = process.env.RECEIVER_ADDRESS || secondAccount.address;

if (supplierAddress.toLowerCase() === receiverAddress.toLowerCase()) {
  throw new Error("SUPPLIER_ADDRESS and RECEIVER_ADDRESS must be different.");
}

const supplyChain = await ethers.deployContract("TwoPartnerSupplyChain", [
  supplierAddress,
  receiverAddress,
]);
await supplyChain.waitForDeployment();

const address = await supplyChain.getAddress();
const networkName = connection.networkName;
const isSepolia = networkName === "sepolia";

console.log(`Deployer: ${deployer.address}`);
console.log(`Supplier: ${supplierAddress}`);
console.log(`Receiver: ${receiverAddress}`);
console.log(`Network: ${networkName}`);
console.log(`TwoPartnerSupplyChain: ${address}`);

await writeFrontendEnv({
  address,
  mode: isSepolia ? "sepolia" : "local",
});

async function writeFrontendEnv({
  address,
  mode,
}: {
  address: string;
  mode: "local" | "sepolia";
}) {
  const appEnv = resolve("app/.env");
  const appEnvLocal = resolve("app/.env.local");
  const existing = await readEnvFile(appEnv);
  const existingLocal = await readEnvFile(appEnvLocal);
  const merged = { ...existing, ...existingLocal };
  const infuraKey =
    merged.NEXT_PUBLIC_INFURA_API_KEY ?? process.env.NEXT_PUBLIC_INFURA_API_KEY ?? "";

  const nextEnv: Record<string, string> = {
    NEXT_PUBLIC_CHAIN_MODE: mode,
    NEXT_PUBLIC_REOWN_PROJECT_ID:
      merged.NEXT_PUBLIC_REOWN_PROJECT_ID ??
      process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ??
      "",
    NEXT_PUBLIC_SUPPLY_CHAIN_CONTRACT_ADDRESS: address,
    NEXT_PUBLIC_LOCAL_RPC_URL:
      merged.NEXT_PUBLIC_LOCAL_RPC_URL ?? "http://127.0.0.1:8545",
    NEXT_PUBLIC_SEPOLIA_RPC_URL:
      merged.NEXT_PUBLIC_SEPOLIA_RPC_URL ??
      process.env.SEPOLIA_RPC_URL ??
      (infuraKey ? `https://sepolia.infura.io/v3/${infuraKey}` : ""),
    NEXT_PUBLIC_INFURA_API_KEY: infuraKey,
    NEXT_PUBLIC_BLOCK_EXPLORER_URL:
      mode === "sepolia"
        ? merged.NEXT_PUBLIC_BLOCK_EXPLORER_URL ??
          "https://sepolia.etherscan.io"
        : "",
  };

  const body = `${Object.entries(nextEnv)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n")}\n`;

  await mkdir(dirname(appEnvLocal), { recursive: true });
  await writeFile(appEnvLocal, body);
  console.log(`Updated ${appEnvLocal}`);
}

async function readEnvFile(filePath: string) {
  try {
    const body = await readFile(filePath, "utf8");
    return Object.fromEntries(
      body
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const index = line.indexOf("=");
          return [line.slice(0, index), line.slice(index + 1)];
        }),
    );
  } catch {
    return {};
  }
}
