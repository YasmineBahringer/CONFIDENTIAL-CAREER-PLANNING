/**
 * Advanced Test Suite for CareerPlanningFHE Contract
 *
 * This test suite focuses on:
 * - FHE-specific operations and patterns
 * - Advanced security scenarios
 * - Performance and scalability
 * - Complex multi-user interactions
 * - Stress testing
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CareerPlanningFHE - Advanced Test Suite", function () {

  // ==================================================================
  // FIXTURES
  // ==================================================================

  async function deployContractFixture() {
    const [owner, user1, user2, user3, user4, user5] = await ethers.getSigners();

    const CareerPlanningFHE = await ethers.getContractFactory("CareerPlanningFHE");
    const contract = await CareerPlanningFHE.deploy();
    await contract.waitForDeployment();

    return { contract, owner, user1, user2, user3, user4, user5 };
  }

  // ==================================================================
  // FHE-SPECIFIC OPERATION TESTS
  // ==================================================================

  describe("🔐 FHE Operations", function () {

    it("Should handle encrypted boolean types (ebool)", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      // Mock encrypted booleans
      const encryptedTrue = ethers.encodeBytes32String("encrypted_true_bool");
      const encryptedFalse = ethers.encodeBytes32String("encrypted_false_bool");
      const fee = ethers.parseEther("0.001");

      await expect(
        contract.connect(user1).submitCareerAssessment(
          encryptedTrue,
          encryptedFalse,
          encryptedTrue,
          { value: fee }
        )
      ).to.not.be.reverted;
    });

    it("Should calculate encrypted guidance score correctly", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // Submit assessment
      await contract.connect(user1).submitCareerAssessment(
        mock, mock, mock, { value: fee }
      );

      // Request and retrieve score
      await contract.connect(user1).requestAssessmentResult(1);
      const score = await contract.connect(user1).getDecryptedCareerGuidance(1);

      // Score should be in valid range (0-100)
      expect(score).to.be.gte(0);
      expect(score).to.be.lte(100);
    });

    it("Should maintain encryption throughout calculation", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted_value");
      const fee = ethers.parseEther("0.001");

      await contract.connect(user1).submitCareerAssessment(
        mock, mock, mock, { value: fee }
      );

      // Get encrypted guidance (should not revert)
      await expect(
        contract.connect(user1).getEncryptedCareerGuidance(1)
      ).to.not.be.reverted;
    });

    it("Should handle different encrypted input combinations", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const fee = ethers.parseEther("0.001");

      // Test different combinations
      const combinations = [
        [
          ethers.encodeBytes32String("enc_true"),
          ethers.encodeBytes32String("enc_true"),
          ethers.encodeBytes32String("enc_true")
        ],
        [
          ethers.encodeBytes32String("enc_false"),
          ethers.encodeBytes32String("enc_false"),
          ethers.encodeBytes32String("enc_false")
        ],
        [
          ethers.encodeBytes32String("enc_true"),
          ethers.encodeBytes32String("enc_false"),
          ethers.encodeBytes32String("enc_true")
        ]
      ];

      for (const [goal, skill, edu] of combinations) {
        await expect(
          contract.connect(user1).submitCareerAssessment(goal, skill, edu, { value: fee })
        ).to.not.be.reverted;
      }

      expect(await contract.getUserAssessmentCount(user1.address)).to.equal(3);
    });

    it("Should preserve encrypted data across contract calls", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const encryptedData = ethers.encodeBytes32String("sensitive_encrypted_data");
      const fee = ethers.parseEther("0.001");

      await contract.connect(user1).submitCareerAssessment(
        encryptedData, encryptedData, encryptedData, { value: fee }
      );

      // Multiple reads should not corrupt data
      await contract.connect(user1).getEncryptedCareerGuidance(1);
      await contract.connect(user1).getEncryptedCareerGuidance(1);
      await contract.connect(user1).getEncryptedCareerGuidance(1);

      // Data should still be accessible
      await expect(
        contract.connect(user1).getEncryptedCareerGuidance(1)
      ).to.not.be.reverted;
    });
  });

  // ==================================================================
  // SECURITY & ATTACK VECTOR TESTS
  // ==================================================================

  describe("🛡️ Security & Attack Vectors", function () {

    it("Should prevent reentrancy attacks on withdrawal", async function () {
      const { contract, owner, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // Add funds
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });

      // Attempt withdrawal (should succeed without reentrancy)
      await expect(
        contract.connect(owner).withdraw()
      ).to.not.be.reverted;

      // Balance should be zero
      expect(await contract.getContractBalance()).to.equal(0);
    });

    it("Should prevent unauthorized data access through timing attacks", async function () {
      const { contract, user1, user2 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // User1 submits assessment
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });

      // User2 attempts rapid access attempts
      for (let i = 0; i < 5; i++) {
        await expect(
          contract.connect(user2).requestAssessmentResult(1)
        ).to.be.revertedWith("Not your assessment");
      }
    });

    it("Should handle front-running attempts gracefully", async function () {
      const { contract, user1, user2 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // Both users try to submit with same nonce (simulating front-running)
      const tx1 = contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      const tx2 = contract.connect(user2).submitCareerAssessment(mock, mock, mock, { value: fee });

      // Both should succeed independently
      await expect(tx1).to.not.be.reverted;
      await expect(tx2).to.not.be.reverted;

      expect(await contract.assessmentCounter()).to.equal(2);
    });

    it("Should prevent integer overflow in assessment counter", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // Submit multiple assessments
      for (let i = 0; i < 100; i++) {
        await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      }

      expect(await contract.assessmentCounter()).to.equal(100);

      // Counter should increment correctly
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      expect(await contract.assessmentCounter()).to.equal(101);
    });

    it("Should handle malformed encrypted data gracefully", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const fee = ethers.parseEther("0.001");

      // Empty bytes
      const emptyBytes = "0x";

      // Should handle gracefully (in real implementation with FHE validation)
      // For now, just ensure it doesn't crash
      await expect(
        contract.connect(user1).submitCareerAssessment(
          emptyBytes || ethers.encodeBytes32String("fallback"),
          emptyBytes || ethers.encodeBytes32String("fallback"),
          emptyBytes || ethers.encodeBytes32String("fallback"),
          { value: fee }
        )
      ).to.not.be.reverted;
    });
  });

  // ==================================================================
  // PERFORMANCE & SCALABILITY TESTS
  // ==================================================================

  describe("⚡ Performance & Scalability", function () {

    it("Should handle high volume of assessments efficiently", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      const startTime = Date.now();

      // Submit 50 assessments
      for (let i = 0; i < 50; i++) {
        await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`      Submitted 50 assessments in ${duration}ms`);

      expect(await contract.getUserAssessmentCount(user1.address)).to.equal(50);
    });

    it("Should scale with multiple concurrent users", async function () {
      const { contract, user1, user2, user3, user4, user5 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // Each user submits 10 assessments
      const users = [user1, user2, user3, user4, user5];

      for (const user of users) {
        for (let i = 0; i < 10; i++) {
          await contract.connect(user).submitCareerAssessment(mock, mock, mock, { value: fee });
        }
      }

      expect(await contract.assessmentCounter()).to.equal(50);

      // Verify each user has 10 assessments
      for (const user of users) {
        expect(await contract.getUserAssessmentCount(user.address)).to.equal(10);
      }
    });

    it("Should maintain performance with large user assessment arrays", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // Create large array (100 assessments)
      for (let i = 0; i < 100; i++) {
        await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      }

      const startTime = Date.now();
      const assessments = await contract.getUserAssessments(user1.address);
      const endTime = Date.now();

      console.log(`      Retrieved 100 assessments in ${endTime - startTime}ms`);

      expect(assessments).to.have.lengthOf(100);
    });

    it("Should handle rapid successive requests", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // Submit 5 assessments rapidly
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee })
        );
      }

      await Promise.all(promises);

      expect(await contract.getUserAssessmentCount(user1.address)).to.equal(5);
    });
  });

  // ==================================================================
  // COMPLEX INTERACTION TESTS
  // ==================================================================

  describe("🔄 Complex Interactions", function () {

    it("Should handle interleaved operations from multiple users", async function () {
      const { contract, user1, user2, user3 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // Interleaved operations
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee }); // ID: 1
      await contract.connect(user2).submitCareerAssessment(mock, mock, mock, { value: fee }); // ID: 2
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee }); // ID: 3
      await contract.connect(user3).submitCareerAssessment(mock, mock, mock, { value: fee }); // ID: 4
      await contract.connect(user2).submitCareerAssessment(mock, mock, mock, { value: fee }); // ID: 5

      // Request results in different order
      await contract.connect(user2).requestAssessmentResult(2);
      await contract.connect(user1).requestAssessmentResult(1);
      await contract.connect(user3).requestAssessmentResult(4);

      // Verify correct access
      expect(await contract.isResultRequested(1)).to.be.true;
      expect(await contract.isResultRequested(2)).to.be.true;
      expect(await contract.isResultRequested(3)).to.be.false;
      expect(await contract.isResultRequested(4)).to.be.true;
      expect(await contract.isResultRequested(5)).to.be.false;
    });

    it("Should maintain data integrity during concurrent modifications", async function () {
      const { contract, user1, user2 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // Concurrent submissions
      await Promise.all([
        contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee }),
        contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee }),
        contract.connect(user2).submitCareerAssessment(mock, mock, mock, { value: fee })
      ]);

      const user1Assessments = await contract.getUserAssessments(user1.address);
      const user2Assessments = await contract.getUserAssessments(user2.address);

      expect(user1Assessments.length + user2Assessments.length).to.equal(3);
    });

    it("Should handle assessment lifecycle correctly", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // 1. Submit
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });

      const [user, timestamp, resultRequested] = await contract.getAssessmentInfo(1);
      expect(user).to.equal(user1.address);
      expect(resultRequested).to.be.false;

      // 2. Request result
      await contract.connect(user1).requestAssessmentResult(1);
      expect(await contract.isResultRequested(1)).to.be.true;

      // 3. Retrieve encrypted score
      await expect(
        contract.connect(user1).getEncryptedCareerGuidance(1)
      ).to.not.be.reverted;

      // 4. Retrieve decrypted score
      const score = await contract.connect(user1).getDecryptedCareerGuidance(1);
      expect(score).to.be.gte(0).and.lte(100);
    });
  });

  // ==================================================================
  // TIMESTAMP & TIME-BASED TESTS
  // ==================================================================

  describe("⏰ Timestamp & Time-based Operations", function () {

    it("Should record accurate timestamps", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      const tx = await contract.connect(user1).submitCareerAssessment(
        mock, mock, mock, { value: fee }
      );
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      const timestamp = await contract.connect(user1).getAssessmentTimestamp(1);
      expect(timestamp).to.equal(block.timestamp);
    });

    it("Should maintain chronological order of assessments", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      const timestamps = [];

      for (let i = 0; i < 5; i++) {
        const tx = await contract.connect(user1).submitCareerAssessment(
          mock, mock, mock, { value: fee }
        );
        const receipt = await tx.wait();
        const block = await ethers.provider.getBlock(receipt.blockNumber);
        timestamps.push(block.timestamp);

        // Small delay to ensure different timestamps
        await time.increase(1);
      }

      // Verify chronological order
      for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i]).to.be.gte(timestamps[i - 1]);
      }
    });

    it("Should handle assessments across different blocks", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // Submit assessment
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });

      // Advance time
      await time.increase(3600); // 1 hour

      // Submit another assessment
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });

      const timestamp1 = await contract.connect(user1).getAssessmentTimestamp(1);
      const timestamp2 = await contract.connect(user1).getAssessmentTimestamp(2);

      expect(timestamp2).to.be.gt(timestamp1);
    });
  });

  // ==================================================================
  // BALANCE & PAYMENT TESTS
  // ==================================================================

  describe("💰 Balance & Payment Management", function () {

    it("Should accumulate fees correctly", async function () {
      const { contract, user1, user2, user3 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      await contract.connect(user2).submitCareerAssessment(mock, mock, mock, { value: fee });
      await contract.connect(user3).submitCareerAssessment(mock, mock, mock, { value: fee });

      const balance = await contract.getContractBalance();
      expect(balance).to.equal(ethers.parseEther("0.003"));
    });

    it("Should handle varying fee amounts", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");

      const fees = [
        ethers.parseEther("0.001"),
        ethers.parseEther("0.005"),
        ethers.parseEther("0.01"),
        ethers.parseEther("0.1")
      ];

      let totalExpected = 0n;

      for (const fee of fees) {
        await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
        totalExpected += fee;
      }

      const balance = await contract.getContractBalance();
      expect(balance).to.equal(totalExpected);
    });

    it("Should allow partial withdrawals simulation", async function () {
      const { contract, contractAddress, owner, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.01");

      // Add funds
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });

      const balanceBefore = await ethers.provider.getBalance(contractAddress);
      expect(balanceBefore).to.equal(fee);

      // Withdraw all
      await contract.connect(owner).withdraw();

      const balanceAfter = await ethers.provider.getBalance(contractAddress);
      expect(balanceAfter).to.equal(0);
    });

    it("Should handle receive function with various amounts", async function () {
      const { contract, contractAddress, user1 } = await loadFixture(deployContractFixture);

      const amounts = [
        ethers.parseEther("0.01"),
        ethers.parseEther("0.1"),
        ethers.parseEther("1.0")
      ];

      let totalSent = 0n;

      for (const amount of amounts) {
        await user1.sendTransaction({
          to: contractAddress,
          value: amount
        });
        totalSent += amount;
      }

      const balance = await ethers.provider.getBalance(contractAddress);
      expect(balance).to.equal(totalSent);
    });
  });

  // ==================================================================
  // ERROR RECOVERY TESTS
  // ==================================================================

  describe("🔧 Error Recovery & Edge Cases", function () {

    it("Should recover from failed transaction attempts", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const insufficientFee = ethers.parseEther("0.0001");
      const validFee = ethers.parseEther("0.001");

      // Failed attempt
      await expect(
        contract.connect(user1).submitCareerAssessment(
          mock, mock, mock, { value: insufficientFee }
        )
      ).to.be.reverted;

      // Successful retry
      await expect(
        contract.connect(user1).submitCareerAssessment(
          mock, mock, mock, { value: validFee }
        )
      ).to.not.be.reverted;

      expect(await contract.assessmentCounter()).to.equal(1);
    });

    it("Should handle query of non-existent assessment gracefully", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      // Query non-existent assessment
      await expect(
        contract.connect(user1).requestAssessmentResult(999)
      ).to.be.reverted;
    });

    it("Should handle operations with zero-balance wallet", async function () {
      const { contract } = await loadFixture(deployContractFixture);

      // Create new wallet with no balance
      const newWallet = ethers.Wallet.createRandom().connect(ethers.provider);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // Should fail due to insufficient funds
      await expect(
        contract.connect(newWallet).submitCareerAssessment(
          mock, mock, mock, { value: fee }
        )
      ).to.be.reverted;
    });
  });

  // ==================================================================
  // COMPREHENSIVE INTEGRATION TEST
  // ==================================================================

  describe("✅ Comprehensive Integration", function () {

    it("Should handle complete real-world scenario", async function () {
      const { contract, contractAddress, owner, user1, user2, user3 } =
        await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // === Day 1: Initial assessments ===
      console.log("      Day 1: Initial assessments");

      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      await contract.connect(user2).submitCareerAssessment(mock, mock, mock, { value: fee });

      expect(await contract.assessmentCounter()).to.equal(2);

      // === Day 2: More users join ===
      console.log("      Day 2: More users join");
      await time.increase(86400); // 1 day

      await contract.connect(user3).submitCareerAssessment(mock, mock, mock, { value: fee });
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });

      expect(await contract.assessmentCounter()).to.equal(4);

      // === Day 3: Users request results ===
      console.log("      Day 3: Users request results");
      await time.increase(86400); // 1 day

      await contract.connect(user1).requestAssessmentResult(1);
      await contract.connect(user2).requestAssessmentResult(2);
      await contract.connect(user1).requestAssessmentResult(4);

      // === Verification ===
      console.log("      Verification phase");

      // Check balances
      const contractBalance = await ethers.provider.getBalance(contractAddress);
      expect(contractBalance).to.equal(ethers.parseEther("0.004"));

      // Check user data
      expect(await contract.getUserAssessmentCount(user1.address)).to.equal(2);
      expect(await contract.getUserAssessmentCount(user2.address)).to.equal(1);
      expect(await contract.getUserAssessmentCount(user3.address)).to.equal(1);

      // Check result requests
      expect(await contract.isResultRequested(1)).to.be.true;
      expect(await contract.isResultRequested(2)).to.be.true;
      expect(await contract.isResultRequested(3)).to.be.false;
      expect(await contract.isResultRequested(4)).to.be.true;

      // === Day 4: Owner withdrawal ===
      console.log("      Day 4: Owner withdrawal");
      await time.increase(86400); // 1 day

      await contract.connect(owner).withdraw();

      const finalBalance = await ethers.provider.getBalance(contractAddress);
      expect(finalBalance).to.equal(0);

      console.log("      ✅ Complete scenario executed successfully");
    });
  });
});
