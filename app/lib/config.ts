export const SEPOLIA_CHAIN_ID = 11155111;
export const LOCAL_CHAIN_ID = 31337;
export const chainMode =
  process.env.NEXT_PUBLIC_CHAIN_MODE === "local" ? "local" : "sepolia";
export const activeChainId =
  chainMode === "local" ? LOCAL_CHAIN_ID : SEPOLIA_CHAIN_ID;

export const reownProjectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? "";
export const contractAddress =
  process.env.NEXT_PUBLIC_SUPPLY_CHAIN_CONTRACT_ADDRESS ?? "";
export const blockExplorerUrl =
  process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL ?? "https://sepolia.etherscan.io";
export const infuraApiKey = process.env.NEXT_PUBLIC_INFURA_API_KEY ?? "";

export const sepoliaRpcUrl =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
  (infuraApiKey
    ? `https://sepolia.infura.io/v3/${infuraApiKey}`
    : "https://ethereum-sepolia-rpc.publicnode.com");
export const localRpcUrl =
  process.env.NEXT_PUBLIC_LOCAL_RPC_URL ?? "http://127.0.0.1:8545";
export const activeRpcUrl = chainMode === "local" ? localRpcUrl : sepoliaRpcUrl;
export const activeNetworkName =
  chainMode === "local" ? "Hardhat Local" : "Sepolia";

export const appConfig = {
  hasProjectId: Boolean(reownProjectId),
  hasContract: /^0x[a-fA-F0-9]{40}$/.test(contractAddress),
  hasRpc: Boolean(activeRpcUrl),
  chainMode,
};

export function explorerTxUrl(hash: string) {
  if (!blockExplorerUrl) return "";
  return `${blockExplorerUrl.replace(/\/$/, "")}/tx/${hash}`;
}

export function explorerAddressUrl(address: string) {
  if (!blockExplorerUrl) return "";
  return `${blockExplorerUrl.replace(/\/$/, "")}/address/${address}`;
}
