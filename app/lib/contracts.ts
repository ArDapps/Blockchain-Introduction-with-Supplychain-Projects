import { Contract, JsonRpcProvider } from "ethers";
import { activeRpcUrl, contractAddress } from "@/lib/config";
import { supplyChainAbi } from "@/lib/supply-chain-abi";
import type { HistoryEntry, PartnerRole, Product, ProductStatus } from "@/lib/types";

type ProductTuple = {
  id: bigint;
  name: string;
  description: string;
  origin: string;
  createdBy: string;
  status: bigint | number;
  createdAt: bigint;
  exists: boolean;
};

type HistoryTuple = {
  status: bigint | number;
  actor: string;
  location: string;
  note: string;
  timestamp: bigint;
};

export const statusLabels: ProductStatus[] = [
  "Created",
  "Shipped",
  "Received",
  "Completed",
];

export const roleLabels: PartnerRole[] = ["Viewer", "Supplier", "Receiver"];

export function getReadContract() {
  return new Contract(contractAddress, supplyChainAbi, new JsonRpcProvider(activeRpcUrl));
}

export function parseProduct(product: ProductTuple): Product {
  return {
    id: Number(product.id),
    name: product.name,
    description: product.description,
    origin: product.origin,
    createdBy: product.createdBy,
    status: statusLabels[Number(product.status)] ?? "Created",
    createdAt: Number(product.createdAt),
    exists: product.exists,
  };
}

export function parseHistory(entry: HistoryTuple): HistoryEntry {
  return {
    status: statusLabels[Number(entry.status)] ?? "Created",
    actor: entry.actor,
    location: entry.location,
    note: entry.note,
    timestamp: Number(entry.timestamp),
  };
}

export async function fetchProducts(limit = 50) {
  const contract = getReadContract();
  const products = (await contract.getProducts(0, limit)) as ProductTuple[];
  return products.map(parseProduct).reverse();
}

export async function fetchProduct(id: string | number) {
  const contract = getReadContract();
  const [product, history] = await Promise.all([
    contract.getProduct(id),
    contract.getProductHistory(id),
  ]);
  return {
    product: parseProduct(product as ProductTuple),
    history: (history as HistoryTuple[]).map(parseHistory),
  };
}

export async function fetchRole(address?: string) {
  if (!address) return "Viewer";
  const role = await getReadContract().getPartnerRole(address);
  return roleLabels[Number(role)] ?? "Viewer";
}

export async function fetchPartners() {
  const contract = getReadContract();
  const [supplier, receiver] = await Promise.all([
    contract.supplier(),
    contract.receiver(),
  ]);
  return { supplier: String(supplier), receiver: String(receiver) };
}

export function formatAddress(address?: string) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp * 1000));
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "shortMessage" in error) {
    return String((error as { shortMessage: unknown }).shortMessage);
  }
  return "Transaction failed. Please check your wallet and try again.";
}
