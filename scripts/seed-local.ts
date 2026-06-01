import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { network } from "hardhat";

const env = await readEnvFile(resolve("app/.env.local"));
const contractAddress = env.NEXT_PUBLIC_SUPPLY_CHAIN_CONTRACT_ADDRESS;

if (!contractAddress) {
  throw new Error("Deploy locally first with npm run deploy:local.");
}

const { ethers } = await network.create();
const [, supplier, receiver] = await ethers.getSigners();
const contract = await ethers.getContractAt(
  "TwoPartnerSupplyChain",
  contractAddress,
);

const createTx = await contract
  .connect(supplier)
  .createProduct(
    "Demo Coffee Lot",
    "A local Hardhat product used to verify the frontend.",
    "Cairo",
    "Supplier Warehouse",
    "Created during local seed.",
  );
await createTx.wait();

const shipTx = await contract
  .connect(supplier)
  .markAsShipped(1, "Cairo Port", "Ready for receiver confirmation.");
await shipTx.wait();

console.log(`Seeded product #1 on ${contractAddress}`);
console.log(`Supplier: ${supplier.address}`);
console.log(`Receiver: ${receiver.address}`);

async function readEnvFile(filePath: string) {
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
}
