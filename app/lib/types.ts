export type ProductStatus = "Created" | "Shipped" | "Received" | "Completed";
export type PartnerRole = "Viewer" | "Supplier" | "Receiver";

export type Product = {
  id: number;
  name: string;
  description: string;
  origin: string;
  createdBy: string;
  status: ProductStatus;
  createdAt: number;
  exists: boolean;
};

export type HistoryEntry = {
  status: ProductStatus;
  actor: string;
  location: string;
  note: string;
  timestamp: number;
};

export type TxState = {
  status: "idle" | "pending" | "success" | "error";
  message: string;
  hash?: string;
};
