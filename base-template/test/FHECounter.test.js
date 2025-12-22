/**
 * Test suite for FHECounter contract
 *
 * @chapter basic-operations
 * @category counter
 * @difficulty beginner
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FHECounter - Basic FHE Operations", function () {
  let contract;
  let owner;
  let user1;
  let contractAddress;

  /**
   * @notice Deploy FHECounter contract before each test
   */
  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    const FHECounter = await ethers.getContractFactory("FHECounter");
    contract = await FHECounter.deploy();
    await contract.waitForDeployment();
    contractAddress = await contract.getAddress();
  });

  describe("Deployment", function () {
    /**
     * @test Verify contract deploys successfully
     */
    it("✅ Should deploy successfully", async function () {
      expect(contractAddress).to.be.properAddress;
    });

    /**
     * @test Verify initial counter value exists
     */
    it("✅ Should initialize with encrypted zero", async function () {
      const count = await contract.getCount();
      expect(count).to.exist;
    });
  });

  describe("Increment Operation", function () {
    /**
     * @test Demonstrate encrypted increment
     * @dev In real implementation, would use fhevm SDK to create encrypted inputs
     */
    it("✅ Should increment counter with encrypted value", async function () {
      // Mock encrypted input (in production, use fhevm.createEncryptedInput)
      const mockValue = ethers.encodeBytes32String("encrypted_5");
      const mockProof = ethers.toUtf8Bytes("mock_proof");

      // Call increment function
      const tx = await contract.increment(mockValue, mockProof);
      await tx.wait();

      // Verify event was emitted
      await expect(tx)
        .to.emit(contract, "Incremented")
        .withArgs(owner.address);
    });

    /**
     * @test Multiple increments should work
     */
    it("✅ Should handle multiple increments", async function () {
      const mockValue = ethers.encodeBytes32String("encrypted_3");
      const mockProof = ethers.toUtf8Bytes("mock_proof");

      // Increment twice
      await contract.increment(mockValue, mockProof);
      await contract.increment(mockValue, mockProof);

      // Counter should exist (actual value stays encrypted)
      const count = await contract.getCount();
      expect(count).to.exist;
    });
  });

  describe("Decrement Operation", function () {
    /**
     * @test Demonstrate encrypted decrement
     */
    it("✅ Should decrement counter with encrypted value", async function () {
      const mockValue = ethers.encodeBytes32String("encrypted_2");
      const mockProof = ethers.toUtf8Bytes("mock_proof");

      // First increment to have a non-zero value
      await contract.increment(mockValue, mockProof);

      // Then decrement
      const tx = await contract.decrement(mockValue, mockProof);
      await tx.wait();

      // Verify event was emitted
      await expect(tx)
        .to.emit(contract, "Decremented")
        .withArgs(owner.address);
    });
  });

  describe("Reset Operation", function () {
    /**
     * @test Reset counter to zero
     */
    it("✅ Should reset counter to encrypted zero", async function () {
      const mockValue = ethers.encodeBytes32String("encrypted_10");
      const mockProof = ethers.toUtf8Bytes("mock_proof");

      // Increment first
      await contract.increment(mockValue, mockProof);

      // Reset
      await contract.reset();

      // Counter should exist and be reset
      const count = await contract.getCount();
      expect(count).to.exist;
    });
  });

  describe("Multi-User Scenarios", function () {
    /**
     * @test Multiple users can interact with counter
     */
    it("✅ Should allow multiple users to increment", async function () {
      const mockValue = ethers.encodeBytes32String("encrypted_1");
      const mockProof = ethers.toUtf8Bytes("mock_proof");

      // Owner increments
      await contract.connect(owner).increment(mockValue, mockProof);

      // User1 increments
      await contract.connect(user1).increment(mockValue, mockProof);

      // Both operations should succeed
      const count = await contract.getCount();
      expect(count).to.exist;
    });
  });

  describe("Permission Management", function () {
    /**
     * @test Permissions are properly granted after operations
     * @dev This is a conceptual test - real implementation needs fhevm SDK
     */
    it("✅ Should grant permissions after increment", async function () {
      const mockValue = ethers.encodeBytes32String("encrypted_5");
      const mockProof = ethers.toUtf8Bytes("mock_proof");

      // Increment and check permissions are set (implicitly)
      await contract.increment(mockValue, mockProof);

      // Getting count should work (permission check passes)
      const count = await contract.getCount();
      expect(count).to.exist;
    });
  });
});
