# Two-Partner Supply Chain DApp Constitution

## Project Purpose

Build a basic decentralized supply-chain tracking DApp using:

- Solidity
- Next.js App Router
- TypeScript
- Tailwind CSS
- ethers.js v6
- Reown AppKit

The application must support exactly two supply-chain partners:

1. **Partner One — Supplier**
2. **Partner Two — Receiver**

The Supplier creates and ships a product.  
The Receiver confirms delivery and completes the supply-chain process.

The project must remain simple and suitable for learning.

---

## Core Workflow

Each product must follow this sequence:

```text
Created → Shipped → Received → Completed
```

Permissions:

```text
Supplier:
- Create a product.
- Mark a product as shipped.

Receiver:
- Mark a product as received.
- Mark a product as completed.

Public users:
- View products.
- Search by product ID.
- View the complete product timeline.
```

A product must never:

- Skip a stage.
- Return to an earlier stage.
- Be updated after completion.
- Be updated by an unauthorized wallet.

---

## Smart-Contract Participants

The contract must contain exactly two partner wallet addresses.

```solidity
address public supplier;
address public receiver;
```

The deployer must pass both wallet addresses to the contract constructor.

```solidity
constructor(address _supplier, address _receiver) {
    require(_supplier != address(0), "Invalid supplier address");
    require(_receiver != address(0), "Invalid receiver address");
    require(_supplier != _receiver, "Partners must be different");

    supplier = _supplier;
    receiver = _receiver;
}
```

Recommended modifiers:

```solidity
modifier onlySupplier() {
    require(msg.sender == supplier, "Only supplier can perform this action");
    _;
}

modifier onlyReceiver() {
    require(msg.sender == receiver, "Only receiver can perform this action");
    _;
}
```

Do not add complex role management, multiple organizations, or dynamic permissions in version 1.

---

## Product Data Structure

Use a simple structure:

```solidity
enum ProductStatus {
    Created,
    Shipped,
    Received,
    Completed
}

struct Product {
    uint256 id;
    string name;
    string description;
    string origin;
    address createdBy;
    ProductStatus status;
    uint256 createdAt;
    bool exists;
}
```

Each product must have a unique incrementing ID.

```solidity
uint256 public productCount;
mapping(uint256 => Product) public products;
```

---

## Product History

Every status update must create a permanent history record.

```solidity
struct HistoryEntry {
    ProductStatus status;
    address actor;
    string location;
    string note;
    uint256 timestamp;
}

mapping(uint256 => HistoryEntry[]) private productHistory;
```

Existing history records must never be modified or deleted.

---

## Smart-Contract Functions

The Solidity contract must include functions equivalent to:

```solidity
function createProduct(
    string calldata name,
    string calldata description,
    string calldata origin,
    string calldata location,
    string calldata note
) external onlySupplier returns (uint256 productId);

function markAsShipped(
    uint256 productId,
    string calldata location,
    string calldata note
) external onlySupplier;

function markAsReceived(
    uint256 productId,
    string calldata location,
    string calldata note
) external onlyReceiver;

function completeProduct(
    uint256 productId,
    string calldata location,
    string calldata note
) external onlyReceiver;

function getProduct(
    uint256 productId
) external view returns (Product memory);

function getProductHistory(
    uint256 productId
) external view returns (HistoryEntry[] memory);
```

---

## Events

Emit events after every successful blockchain update.

```solidity
event ProductCreated(
    uint256 indexed productId,
    string name,
    address indexed supplier,
    uint256 timestamp
);

event ProductShipped(
    uint256 indexed productId,
    address indexed supplier,
    uint256 timestamp
);

event ProductReceived(
    uint256 indexed productId,
    address indexed receiver,
    uint256 timestamp
);

event ProductCompleted(
    uint256 indexed productId,
    address indexed receiver,
    uint256 timestamp
);
```

---

## Reown AppKit Wallet Connection

Use Reown AppKit instead of manually connecting only to MetaMask.

Install:

```bash
npm install @reown/appkit @reown/appkit-adapter-ethers ethers
```

Create a Reown project ID and store it in an environment variable:

```env
NEXT_PUBLIC_REOWN_PROJECT_ID=
NEXT_PUBLIC_CHAIN_ID=
NEXT_PUBLIC_SUPPLY_CHAIN_CONTRACT_ADDRESS=
NEXT_PUBLIC_BLOCK_EXPLORER_URL=
```

The frontend must:

- Display a **Connect Wallet** button.
- Open the Reown AppKit wallet modal.
- Support wallet disconnection.
- Display the connected wallet address.
- Detect whether the connected wallet is the Supplier, Receiver, or a Viewer.
- Display the current blockchain network.
- Disable blockchain write buttons when the user is not connected.
- Disable Supplier actions for the Receiver.
- Disable Receiver actions for the Supplier.
- Wait for transaction confirmation before showing success.
- Display transaction hashes and explorer links.

Use AppKit hooks:

```ts
import {
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider,
  useDisconnect
} from "@reown/appkit/react";
```

Use ethers.js for contract calls:

```ts
import { BrowserProvider, Contract } from "ethers";
```

Example write flow:

```ts
const { address, isConnected } = useAppKitAccount();
const { walletProvider } = useAppKitProvider("eip155");

const provider = new BrowserProvider(walletProvider);
const signer = await provider.getSigner();

const contract = new Contract(
  contractAddress,
  supplyChainAbi,
  signer
);

const transaction = await contract.markAsShipped(
  productId,
  location,
  note
);

await transaction.wait();
```

---

## Frontend Pages

Use this simple structure:

```text
/
  Landing page and supply-chain overview

/products
  Product list and search form

/products/create
  Supplier-only product creation form

/products/[id]
  Product details and immutable timeline

/dashboard
  Connected-wallet dashboard with available actions
```

Do not add an admin page in version 1.

---

## Dashboard Behavior

### Supplier Dashboard

Show:

- Create Product button.
- Product list.
- Ship Product button for products with `Created` status.
- Supplier wallet badge.

### Receiver Dashboard

Show:

- Product list.
- Confirm Received button for products with `Shipped` status.
- Complete Product button for products with `Received` status.
- Receiver wallet badge.

### Viewer Dashboard

Show:

- Product search.
- Read-only product details.
- Timeline.
- Message explaining that the connected wallet is not an authorized partner.

---

## Tailwind CSS UI Rules

Use:

- Responsive layouts.
- Clear cards.
- Status badges.
- Timeline components.
- Wallet address badges.
- Transaction loading states.
- Success and error notifications.
- Disabled buttons during pending transactions.
- Mobile-friendly forms.

Recommended status badges:

```text
Created
Shipped
Received
Completed
```

Keep the interface simple. Avoid unnecessary animations or advanced dashboard widgets.

---

## Testing Requirements

Smart-contract tests must cover:

- Supplier can create products.
- Receiver cannot create products.
- Viewer cannot create products.
- Supplier can ship a created product.
- Receiver cannot ship a product.
- Receiver can confirm receipt after shipping.
- Supplier cannot confirm receipt.
- Receiver can complete a received product.
- A product cannot skip stages.
- A completed product cannot be updated.
- A nonexistent product cannot be updated.
- Supplier and Receiver addresses cannot be zero addresses.
- Supplier and Receiver addresses must be different.
- History entries are appended correctly.
- Events are emitted correctly.

Frontend tests must cover:

- Reown Connect Wallet button.
- Wallet connection state.
- Supplier dashboard actions.
- Receiver dashboard actions.
- Viewer read-only state.
- Product creation validation.
- Product search by ID.
- Pending transaction state.
- Successful confirmation state.
- Failed transaction state.
- Timeline rendering.

---

## Out of Scope for Version 1

Do not add:

- Additional partners.
- Admin role management.
- NFTs.
- Tokens.
- Payments.
- Databases.
- QR-code scanning.
- IPFS.
- IoT integrations.
- Multi-chain support.
- Upgradeable contracts.
- Email authentication.
- Social login.
- Mobile applications.

---

## Definition of Done

The project is complete when:

- The Solidity contract supports exactly two partners.
- Partner permissions are enforced on-chain.
- Products follow the required lifecycle.
- Product history is immutable.
- Reown AppKit connects wallets successfully.
- ethers.js performs contract reads and writes.
- The dashboard changes based on the connected wallet.
- Transactions display loading, success, and error states.
- Contract tests pass.
- Frontend works on desktop and mobile.
- Environment variables are documented.
- No secrets are committed.

---

## Governance

When a feature request conflicts with this constitution:

1. Keep exactly two supply-chain partners.
2. Preserve the simple product lifecycle.
3. Enforce permissions inside the Solidity contract.
4. Keep blockchain data as the source of truth.
5. Avoid unnecessary complexity.

**Version:** 1.1.0  
**Project:** Two-Partner Supply Chain DApp  
**Stack:** Solidity, Next.js, TypeScript, Tailwind CSS, ethers.js v6, Reown AppKit
