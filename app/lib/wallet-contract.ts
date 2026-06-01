import { BrowserProvider, Contract, type Eip1193Provider } from "ethers";
import { contractAddress } from "@/lib/config";
import { supplyChainAbi } from "@/lib/supply-chain-abi";

export async function getWriteContract(walletProvider: unknown) {
  if (!walletProvider) throw new Error("Connect your wallet first.");

  const provider = new BrowserProvider(walletProvider as Eip1193Provider);
  const signer = await provider.getSigner();
  return new Contract(contractAddress, supplyChainAbi, signer);
}
