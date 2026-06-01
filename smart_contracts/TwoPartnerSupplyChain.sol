// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title TwoPartnerSupplyChain
/// @notice Basic on-chain supply-chain tracker for exactly two partners:
///         one Supplier and one Receiver.
/// @dev The Supplier creates and ships products. The Receiver confirms receipt
///      and completes the workflow. Product history is append-only.
contract TwoPartnerSupplyChain {
    // ---------------------------------------------------------------------
    // Types
    // ---------------------------------------------------------------------

    enum ProductStatus {
        Created,
        Shipped,
        Received,
        Completed
    }

    enum PartnerRole {
        Viewer,
        Supplier,
        Receiver
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

    struct HistoryEntry {
        ProductStatus status;
        address actor;
        string location;
        string note;
        uint256 timestamp;
    }

    // ---------------------------------------------------------------------
    // Errors
    // ---------------------------------------------------------------------

    error ZeroAddress();
    error PartnersMustBeDifferent();
    error SupplierOnly();
    error ReceiverOnly();
    error ProductNotFound(uint256 productId);
    error ProductAlreadyCompleted(uint256 productId);
    error InvalidStatusTransition(
        uint256 productId,
        ProductStatus currentStatus,
        ProductStatus expectedStatus
    );
    error RequiredField(bytes32 field);
    error FieldTooLong(bytes32 field, uint256 maxLength);
    error PageSizeTooLarge(uint256 maxPageSize);

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------

    event ProductCreated(
        uint256 indexed productId,
        string name,
        address indexed supplier,
        string origin,
        string location,
        string note,
        uint256 timestamp
    );

    event ProductStatusUpdated(
        uint256 indexed productId,
        ProductStatus previousStatus,
        ProductStatus newStatus,
        address indexed actor,
        string location,
        string note,
        uint256 timestamp
    );

    // ---------------------------------------------------------------------
    // Constants
    // ---------------------------------------------------------------------

    uint256 public constant MAX_NAME_LENGTH = 100;
    uint256 public constant MAX_DESCRIPTION_LENGTH = 500;
    uint256 public constant MAX_ORIGIN_LENGTH = 120;
    uint256 public constant MAX_LOCATION_LENGTH = 120;
    uint256 public constant MAX_NOTE_LENGTH = 500;
    uint256 public constant MAX_PAGE_SIZE = 100;

    // ---------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------

    address public immutable supplier;
    address public immutable receiver;

    uint256 public productCount;

    mapping(uint256 => Product) private _products;
    mapping(uint256 => HistoryEntry[]) private _productHistory;

    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------

    /// @param supplierAddress Wallet allowed to create and ship products.
    /// @param receiverAddress Wallet allowed to receive and complete products.
    constructor(address supplierAddress, address receiverAddress) {
        if (supplierAddress == address(0) || receiverAddress == address(0)) {
            revert ZeroAddress();
        }

        if (supplierAddress == receiverAddress) {
            revert PartnersMustBeDifferent();
        }

        supplier = supplierAddress;
        receiver = receiverAddress;
    }

    // ---------------------------------------------------------------------
    // Modifiers
    // ---------------------------------------------------------------------

    modifier onlySupplier() {
        if (msg.sender != supplier) revert SupplierOnly();
        _;
    }

    modifier onlyReceiver() {
        if (msg.sender != receiver) revert ReceiverOnly();
        _;
    }

    // ---------------------------------------------------------------------
    // Supplier actions
    // ---------------------------------------------------------------------

    /// @notice Creates a product and records the initial Created history entry.
    /// @dev Only the Supplier wallet can call this function.
    function createProduct(
        string calldata name,
        string calldata description,
        string calldata origin,
        string calldata location,
        string calldata note
    ) external onlySupplier returns (uint256 productId) {
        _validateRequired(name, bytes32("name"), MAX_NAME_LENGTH);
        _validateOptional(description, bytes32("description"), MAX_DESCRIPTION_LENGTH);
        _validateRequired(origin, bytes32("origin"), MAX_ORIGIN_LENGTH);
        _validateRequired(location, bytes32("location"), MAX_LOCATION_LENGTH);
        _validateOptional(note, bytes32("note"), MAX_NOTE_LENGTH);

        productId = ++productCount;
        uint256 timestamp = block.timestamp;

        _products[productId] = Product({
            id: productId,
            name: name,
            description: description,
            origin: origin,
            createdBy: msg.sender,
            status: ProductStatus.Created,
            createdAt: timestamp,
            exists: true
        });

        _appendHistory(
            productId,
            ProductStatus.Created,
            msg.sender,
            location,
            note,
            timestamp
        );

        emit ProductCreated(
            productId,
            name,
            msg.sender,
            origin,
            location,
            note,
            timestamp
        );
    }

    /// @notice Moves a product from Created to Shipped.
    /// @dev Only the Supplier wallet can call this function.
    function markAsShipped(
        uint256 productId,
        string calldata location,
        string calldata note
    ) external onlySupplier {
        _transitionProduct(
            productId,
            ProductStatus.Created,
            ProductStatus.Shipped,
            location,
            note
        );
    }

    // ---------------------------------------------------------------------
    // Receiver actions
    // ---------------------------------------------------------------------

    /// @notice Moves a product from Shipped to Received.
    /// @dev Only the Receiver wallet can call this function.
    function markAsReceived(
        uint256 productId,
        string calldata location,
        string calldata note
    ) external onlyReceiver {
        _transitionProduct(
            productId,
            ProductStatus.Shipped,
            ProductStatus.Received,
            location,
            note
        );
    }

    /// @notice Moves a product from Received to Completed.
    /// @dev Only the Receiver wallet can call this function.
    function completeProduct(
        uint256 productId,
        string calldata location,
        string calldata note
    ) external onlyReceiver {
        _transitionProduct(
            productId,
            ProductStatus.Received,
            ProductStatus.Completed,
            location,
            note
        );
    }

    // ---------------------------------------------------------------------
    // Read functions
    // ---------------------------------------------------------------------

    /// @notice Returns a single product by ID.
    function getProduct(uint256 productId) external view returns (Product memory) {
        _requireProduct(productId);
        return _products[productId];
    }

    /// @notice Returns the complete append-only history for a product.
    function getProductHistory(
        uint256 productId
    ) external view returns (HistoryEntry[] memory) {
        _requireProduct(productId);
        return _productHistory[productId];
    }

    /// @notice Returns the number of history entries for a product.
    function getProductHistoryLength(
        uint256 productId
    ) external view returns (uint256) {
        _requireProduct(productId);
        return _productHistory[productId].length;
    }

    /// @notice Returns one product-history entry by index.
    function getProductHistoryEntry(
        uint256 productId,
        uint256 index
    ) external view returns (HistoryEntry memory) {
        _requireProduct(productId);
        return _productHistory[productId][index];
    }

    /// @notice Returns a page of products for the frontend list view.
    /// @param offset Zero-based offset. Use 0 for the first page.
    /// @param limit Maximum number of products to return. Maximum is 100.
    function getProducts(
        uint256 offset,
        uint256 limit
    ) external view returns (Product[] memory items) {
        if (limit > MAX_PAGE_SIZE) revert PageSizeTooLarge(MAX_PAGE_SIZE);

        if (limit == 0 || offset >= productCount) {
            return new Product[](0);
        }

        uint256 available = productCount - offset;
        uint256 size = limit < available ? limit : available;

        items = new Product[](size);

        for (uint256 index = 0; index < size; ++index) {
            // Product IDs begin at 1 while offset begins at 0.
            items[index] = _products[offset + index + 1];
        }
    }

    /// @notice Returns Viewer, Supplier, or Receiver for a wallet address.
    function getPartnerRole(address account) external view returns (PartnerRole) {
        if (account == supplier) return PartnerRole.Supplier;
        if (account == receiver) return PartnerRole.Receiver;
        return PartnerRole.Viewer;
    }

    // ---------------------------------------------------------------------
    // Internal helpers
    // ---------------------------------------------------------------------

    function _transitionProduct(
        uint256 productId,
        ProductStatus expectedStatus,
        ProductStatus newStatus,
        string calldata location,
        string calldata note
    ) internal {
        Product storage product = _requireProduct(productId);

        if (product.status == ProductStatus.Completed) {
            revert ProductAlreadyCompleted(productId);
        }

        if (product.status != expectedStatus) {
            revert InvalidStatusTransition(productId, product.status, expectedStatus);
        }

        _validateRequired(location, bytes32("location"), MAX_LOCATION_LENGTH);
        _validateOptional(note, bytes32("note"), MAX_NOTE_LENGTH);

        ProductStatus previousStatus = product.status;
        product.status = newStatus;

        uint256 timestamp = block.timestamp;

        _appendHistory(productId, newStatus, msg.sender, location, note, timestamp);

        emit ProductStatusUpdated(
            productId,
            previousStatus,
            newStatus,
            msg.sender,
            location,
            note,
            timestamp
        );
    }

    function _appendHistory(
        uint256 productId,
        ProductStatus status,
        address actor,
        string calldata location,
        string calldata note,
        uint256 timestamp
    ) internal {
        _productHistory[productId].push(
            HistoryEntry({
                status: status,
                actor: actor,
                location: location,
                note: note,
                timestamp: timestamp
            })
        );
    }

    function _requireProduct(
        uint256 productId
    ) internal view returns (Product storage product) {
        product = _products[productId];

        if (!product.exists) {
            revert ProductNotFound(productId);
        }
    }

    function _validateRequired(
        string calldata value,
        bytes32 field,
        uint256 maxLength
    ) internal pure {
        uint256 length = bytes(value).length;

        if (length == 0) revert RequiredField(field);
        if (length > maxLength) revert FieldTooLong(field, maxLength);
    }

    function _validateOptional(
        string calldata value,
        bytes32 field,
        uint256 maxLength
    ) internal pure {
        if (bytes(value).length > maxLength) {
            revert FieldTooLong(field, maxLength);
        }
    }
}
