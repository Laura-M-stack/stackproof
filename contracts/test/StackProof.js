const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StackProof", function () {
  async function deploy() {
    const [alice, bob] = await ethers.getSigners();
    const contract = await (await ethers.getContractFactory("StackProof")).deploy();
    await contract.waitForDeployment();
    return { contract, alice, bob };
  }

  it("starts with nobody having posted", async function () {
    const { contract, alice } = await deploy();
    expect(await contract.hasPosted(alice.address)).to.equal(false);
  });

  it("stores the flag and emits ProofSubmitted", async function () {
    const { contract, alice } = await deploy();
    await expect(contract.connect(alice).submitProof("hello"))
      .to.emit(contract, "ProofSubmitted")
      .withArgs(alice.address, "hello");
    expect(await contract.hasPosted(alice.address)).to.equal(true);
  });

  it("rejects a second proof from the same address", async function () {
    const { contract, alice } = await deploy();
    await contract.connect(alice).submitProof("first");
    await expect(contract.connect(alice).submitProof("second")).to.be.revertedWith(
      "You already submitted a proof"
    );
  });

  it("lets different addresses submit independently", async function () {
    const { contract, alice, bob } = await deploy();
    await contract.connect(alice).submitProof("a");
    await expect(contract.connect(bob).submitProof("b")).to.emit(contract, "ProofSubmitted");
  });
});
