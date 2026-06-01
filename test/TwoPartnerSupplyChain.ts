import { expect } from "chai";
import { network } from "hardhat";
import { anyValue } from "@nomicfoundation/hardhat-ethers-chai-matchers/withArgs";

const { ethers } = await network.create();

async function deploySupplyChain() {
  const [deployer, supplier, receiver, viewer] = await ethers.getSigners();
  const factory = await ethers.getContractFactory(
    "TwoPartnerSupplyChain",
    deployer,
  );
  const contract = await factory.deploy(supplier.address, receiver.address);
  await contract.waitForDeployment();

  return { contract, deployer, supplier, receiver, viewer };
}

async function createProduct(contract: any, supplier: any) {
  const tx = await contract
    .connect(supplier)
    .createProduct("Coffee", "Arabica beans", "Cairo", "Warehouse A", "Packed");
  await tx.wait();
}

describe("TwoPartnerSupplyChain", function () {
  it("sets exactly two different non-zero partners", async function () {
    const { contract, supplier, receiver } = await deploySupplyChain();

    expect(await contract.supplier()).to.equal(supplier.address);
    expect(await contract.receiver()).to.equal(receiver.address);
  });

  it("rejects zero partner addresses and duplicate partners", async function () {
    const [deployer, supplier] = await ethers.getSigners();
    const factory = await ethers.getContractFactory(
      "TwoPartnerSupplyChain",
      deployer,
    );

    await expect(factory.deploy(ethers.ZeroAddress, supplier.address))
      .to.be.revertedWithCustomError(factory, "ZeroAddress");
    await expect(factory.deploy(supplier.address, ethers.ZeroAddress))
      .to.be.revertedWithCustomError(factory, "ZeroAddress");
    await expect(factory.deploy(supplier.address, supplier.address))
      .to.be.revertedWithCustomError(factory, "PartnersMustBeDifferent");
  });

  it("lets only the supplier create products and appends history", async function () {
    const { contract, supplier, receiver, viewer } = await deploySupplyChain();

    await expect(
      contract
        .connect(supplier)
        .createProduct("Coffee", "Arabica beans", "Cairo", "Warehouse A", "Packed"),
    )
      .to.emit(contract, "ProductCreated")
      .withArgs(1n, "Coffee", supplier.address, "Cairo", "Warehouse A", "Packed", anyValue);

    const product = await contract.getProduct(1);
    expect(product.id).to.equal(1n);
    expect(product.status).to.equal(0n);
    expect(product.createdBy).to.equal(supplier.address);

    const history = await contract.getProductHistory(1);
    expect(history).to.have.length(1);
    expect(history[0].status).to.equal(0n);
    expect(history[0].actor).to.equal(supplier.address);

    await expect(
      contract
        .connect(receiver)
        .createProduct("Tea", "", "Alexandria", "Warehouse B", ""),
    ).to.be.revertedWithCustomError(contract, "SupplierOnly");
    await expect(
      contract
        .connect(viewer)
        .createProduct("Tea", "", "Alexandria", "Warehouse B", ""),
    ).to.be.revertedWithCustomError(contract, "SupplierOnly");
  });

  it("lets only the supplier ship a created product", async function () {
    const { contract, supplier, receiver } = await deploySupplyChain();
    await createProduct(contract, supplier);

    await expect(
      contract.connect(receiver).markAsShipped(1, "Port", "Handed to carrier"),
    ).to.be.revertedWithCustomError(contract, "SupplierOnly");

    await expect(
      contract.connect(supplier).markAsShipped(1, "Port", "Handed to carrier"),
    )
      .to.emit(contract, "ProductStatusUpdated")
      .withArgs(1n, 0n, 1n, supplier.address, "Port", "Handed to carrier", anyValue);

    expect((await contract.getProduct(1)).status).to.equal(1n);
  });

  it("lets only the receiver confirm receipt after shipping", async function () {
    const { contract, supplier, receiver } = await deploySupplyChain();
    await createProduct(contract, supplier);

    await expect(
      contract.connect(receiver).markAsReceived(1, "Store", "Arrived early"),
    ).to.be.revertedWithCustomError(contract, "InvalidStatusTransition");

    await contract.connect(supplier).markAsShipped(1, "Port", "Loaded");

    await expect(
      contract.connect(supplier).markAsReceived(1, "Store", "Arrived"),
    ).to.be.revertedWithCustomError(contract, "ReceiverOnly");

    await expect(
      contract.connect(receiver).markAsReceived(1, "Store", "Arrived"),
    )
      .to.emit(contract, "ProductStatusUpdated")
      .withArgs(1n, 1n, 2n, receiver.address, "Store", "Arrived", anyValue);

    expect((await contract.getProduct(1)).status).to.equal(2n);
  });

  it("lets the receiver complete only a received product", async function () {
    const { contract, supplier, receiver } = await deploySupplyChain();
    await createProduct(contract, supplier);

    await expect(
      contract.connect(receiver).completeProduct(1, "Store", "Done"),
    ).to.be.revertedWithCustomError(contract, "InvalidStatusTransition");

    await contract.connect(supplier).markAsShipped(1, "Port", "Loaded");
    await contract.connect(receiver).markAsReceived(1, "Store", "Arrived");

    await expect(
      contract.connect(supplier).completeProduct(1, "Store", "Done"),
    ).to.be.revertedWithCustomError(contract, "ReceiverOnly");

    await contract.connect(receiver).completeProduct(1, "Store", "Done");
    expect((await contract.getProduct(1)).status).to.equal(3n);
  });

  it("prevents updates after completion and nonexistent product updates", async function () {
    const { contract, supplier, receiver } = await deploySupplyChain();

    await expect(
      contract.connect(supplier).markAsShipped(999, "Nowhere", ""),
    ).to.be.revertedWithCustomError(contract, "ProductNotFound");

    await createProduct(contract, supplier);
    await contract.connect(supplier).markAsShipped(1, "Port", "Loaded");
    await contract.connect(receiver).markAsReceived(1, "Store", "Arrived");
    await contract.connect(receiver).completeProduct(1, "Store", "Done");

    await expect(
      contract.connect(receiver).completeProduct(1, "Store", "Again"),
    ).to.be.revertedWithCustomError(contract, "ProductAlreadyCompleted");
  });

  it("keeps history append-only through the full lifecycle", async function () {
    const { contract, supplier, receiver } = await deploySupplyChain();
    await createProduct(contract, supplier);
    await contract.connect(supplier).markAsShipped(1, "Port", "Loaded");
    await contract.connect(receiver).markAsReceived(1, "Store", "Arrived");
    await contract.connect(receiver).completeProduct(1, "Store", "Done");

    const history = await contract.getProductHistory(1);
    expect(history.map((entry: any) => entry.status)).to.deep.equal([
      0n,
      1n,
      2n,
      3n,
    ]);
    expect(await contract.getProductHistoryLength(1)).to.equal(4n);
    expect((await contract.getProductHistoryEntry(1, 3)).note).to.equal("Done");
  });

  it("returns product pages and partner roles for the frontend", async function () {
    const { contract, supplier, receiver, viewer } = await deploySupplyChain();
    await createProduct(contract, supplier);

    const products = await contract.getProducts(0, 10);
    expect(products).to.have.length(1);
    expect(products[0].name).to.equal("Coffee");
    expect(await contract.getPartnerRole(viewer.address)).to.equal(0n);
    expect(await contract.getPartnerRole(supplier.address)).to.equal(1n);
    expect(await contract.getPartnerRole(receiver.address)).to.equal(2n);
  });
});
