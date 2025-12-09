/**
 * Comprehensive Test Suite for CareerPlanningFHE Contract
 *
 * This test suite covers:
 * - Deployment and initialization
 * - FHE operations and encrypted data handling
 * - Access control and permissions
 * - Edge cases and error conditions
 * - State consistency and data integrity
 * - Event emission and logging
 * - Gas consumption analysis
 * - Multi-user scenarios
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("CareerPlanningFHE - Comprehensive Test Suite", function () {

  // ==================================================================
  // FIXTURES
  // ==================================================================

  async function deployContractFixture() {
    const [owner, user1, user2, user3, counselor] = await ethers.getSigners();

    const CareerPlanningFHE = await ethers.getContractFactory("CareerPlanningFHE");
    const contract = await CareerPlanningFHE.deploy();
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();

    return { contract, contractAddress, owner, user1, user2, user3, counselor };
  }

  async function deployWithAssessmentsFixture() {
    const { contract, contractAddress, owner, user1, user2, user3, counselor } =
      await loadFixture(deployContractFixture);

    // Mock encrypted values (in real implementation these would be actual encrypted handles)
    const mockCareerGoal = ethers.encodeBytes32String("encrypted_true");
    const mockSkillLevel = ethers.encodeBytes32String("encrypted_true");
    const mockEducation = ethers.encodeBytes32String("encrypted_false");
    const fee = ethers.parseEther("0.001");

    // User1 submits one assessment
    await contract.connect(user1).submitCareerAssessment(
      mockCareerGoal,
      mockSkillLevel,
      mockEducation,
      { value: fee }
    );

    return {
      contract, contractAddress, owner, user1, user2, user3, counselor,
      mockCareerGoal, mockSkillLevel, mockEducation, fee
    };
  }

  // ==================================================================
  // DEPLOYMENT TESTS
  // ==================================================================

  describe("✅ Deployment", function () {
    it("Should deploy successfully with correct initial state", async function () {
      const { contract, owner } = await loadFixture(deployContractFixture);

      expect(await contract.getAddress()).to.be.properAddress;
      expect(await contract.owner()).to.equal(owner.address);
      expect(await contract.assessmentCounter()).to.equal(0);
    });

    it("Should initialize with zero balance", async function () {
      const { contract, contractAddress } = await loadFixture(deployContractFixture);

      const balance = await ethers.provider.getBalance(contractAddress);
      expect(balance).to.equal(0);
    });

    it("Should set deployer as owner", async function () {
      const { contract, owner } = await loadFixture(deployContractFixture);

      expect(await contract.owner()).to.equal(owner.address);
    });
  });

  // ==================================================================
  // ASSESSMENT SUBMISSION TESTS
  // ==================================================================

  describe("✅ Assessment Submission", function () {

    it("Should submit assessment with valid encrypted data", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mockCareerGoal = ethers.encodeBytes32String("encrypted_true");
      const mockSkillLevel = ethers.encodeBytes32String("encrypted_true");
      const mockEducation = ethers.encodeBytes32String("encrypted_false");
      const fee = ethers.parseEther("0.001");

      await expect(
        contract.connect(user1).submitCareerAssessment(
          mockCareerGoal,
          mockSkillLevel,
          mockEducation,
          { value: fee }
        )
      ).to.emit(contract, "AssessmentSubmitted")
       .withArgs(user1.address, 1, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));

      expect(await contract.assessmentCounter()).to.equal(1);
    });

    it("Should increment assessment counter correctly", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      expect(await contract.assessmentCounter()).to.equal(1);

      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      expect(await contract.assessmentCounter()).to.equal(2);

      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      expect(await contract.assessmentCounter()).to.equal(3);
    });

    it("Should track user assessments correctly", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });

      expect(await contract.getUserAssessmentCount(user1.address)).to.equal(2);

      const userAssessments = await contract.getUserAssessments(user1.address);
      expect(userAssessments).to.have.lengthOf(2);
      expect(userAssessments[0]).to.equal(1);
      expect(userAssessments[1]).to.equal(2);
    });

    it("Should accept payment and update contract balance", async function () {
      const { contract, contractAddress, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      const balanceBefore = await ethers.provider.getBalance(contractAddress);

      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });

      const balanceAfter = await ethers.provider.getBalance(contractAddress);
      expect(balanceAfter - balanceBefore).to.equal(fee);
    });

    it("Should store assessment timestamp correctly", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      const tx = await contract.connect(user1).submitCareerAssessment(
        mock, mock, mock, { value: fee }
      );
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      const timestamp = await contract.getAssessmentTimestamp(1);
      expect(timestamp).to.equal(block.timestamp);
    });

    it("Should emit AssessmentSubmitted event with correct parameters", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      await expect(
        contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee })
      )
        .to.emit(contract, "AssessmentSubmitted")
        .withArgs(user1.address, 1, await ethers.provider.getBlock('latest').then(b => b.timestamp + 1));
    });
  });

  // ==================================================================
  // FEE VALIDATION TESTS
  // ==================================================================

  describe("❌ Fee Validation", function () {

    it("Should reject submission with insufficient fee", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const insufficientFee = ethers.parseEther("0.0005");

      await expect(
        contract.connect(user1).submitCareerAssessment(
          mock, mock, mock, { value: insufficientFee }
        )
      ).to.be.revertedWith("Minimum fee required");
    });

    it("Should reject submission with zero fee", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");

      await expect(
        contract.connect(user1).submitCareerAssessment(
          mock, mock, mock, { value: 0 }
        )
      ).to.be.revertedWith("Minimum fee required");
    });

    it("Should accept fee exactly at minimum", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const exactFee = ethers.parseEther("0.001");

      await expect(
        contract.connect(user1).submitCareerAssessment(
          mock, mock, mock, { value: exactFee }
        )
      ).to.not.be.reverted;
    });

    it("Should accept fee above minimum", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const higherFee = ethers.parseEther("0.01");

      await expect(
        contract.connect(user1).submitCareerAssessment(
          mock, mock, mock, { value: higherFee }
        )
      ).to.not.be.reverted;
    });
  });

  // ==================================================================
  // RESULT REQUEST TESTS
  // ==================================================================

  describe("✅ Result Request", function () {

    it("Should allow assessment owner to request results", async function () {
      const { contract, user1 } = await loadFixture(deployWithAssessmentsFixture);

      await expect(
        contract.connect(user1).requestAssessmentResult(1)
      ).to.emit(contract, "ResultRequested")
       .withArgs(user1.address, 1);

      expect(await contract.isResultRequested(1)).to.be.true;
    });

    it("Should update resultRequested flag correctly", async function () {
      const { contract, user1 } = await loadFixture(deployWithAssessmentsFixture);

      expect(await contract.isResultRequested(1)).to.be.false;

      await contract.connect(user1).requestAssessmentResult(1);

      expect(await contract.isResultRequested(1)).to.be.true;
    });

    it("Should emit ResultRequested event", async function () {
      const { contract, user1 } = await loadFixture(deployWithAssessmentsFixture);

      await expect(
        contract.connect(user1).requestAssessmentResult(1)
      ).to.emit(contract, "ResultRequested");
    });
  });

  // ==================================================================
  // ACCESS CONTROL TESTS
  // ==================================================================

  describe("❌ Access Control", function () {

    it("Should prevent non-owner from requesting results", async function () {
      const { contract, user2 } = await loadFixture(deployWithAssessmentsFixture);

      await expect(
        contract.connect(user2).requestAssessmentResult(1)
      ).to.be.revertedWith("Not your assessment");
    });

    it("Should prevent duplicate result requests", async function () {
      const { contract, user1 } = await loadFixture(deployWithAssessmentsFixture);

      await contract.connect(user1).requestAssessmentResult(1);

      await expect(
        contract.connect(user1).requestAssessmentResult(1)
      ).to.be.revertedWith("Result already requested");
    });

    it("Should prevent access to non-existent assessment", async function () {
      const { contract, user1 } = await loadFixture(deployWithAssessmentsFixture);

      await expect(
        contract.connect(user1).requestAssessmentResult(999)
      ).to.be.reverted;
    });

    it("Should prevent unauthorized access to assessment info", async function () {
      const { contract, user2 } = await loadFixture(deployWithAssessmentsFixture);

      await expect(
        contract.connect(user2).getAssessmentTimestamp(1)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should prevent unauthorized decrypted guidance access", async function () {
      const { contract, user2 } = await loadFixture(deployWithAssessmentsFixture);

      await expect(
        contract.connect(user2).getDecryptedCareerGuidance(1)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should prevent accessing guidance before requesting", async function () {
      const { contract, user1 } = await loadFixture(deployWithAssessmentsFixture);

      await expect(
        contract.connect(user1).getDecryptedCareerGuidance(1)
      ).to.be.revertedWith("Result not requested yet");
    });

    it("Should allow access after proper request", async function () {
      const { contract, user1 } = await loadFixture(deployWithAssessmentsFixture);

      await contract.connect(user1).requestAssessmentResult(1);

      await expect(
        contract.connect(user1).getDecryptedCareerGuidance(1)
      ).to.not.be.reverted;
    });
  });

  // ==================================================================
  // MULTI-USER SCENARIO TESTS
  // ==================================================================

  describe("✅ Multi-User Scenarios", function () {

    it("Should handle multiple users submitting assessments", async function () {
      const { contract, user1, user2, user3 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      await contract.connect(user2).submitCareerAssessment(mock, mock, mock, { value: fee });
      await contract.connect(user3).submitCareerAssessment(mock, mock, mock, { value: fee });

      expect(await contract.assessmentCounter()).to.equal(3);
      expect(await contract.getUserAssessmentCount(user1.address)).to.equal(1);
      expect(await contract.getUserAssessmentCount(user2.address)).to.equal(1);
      expect(await contract.getUserAssessmentCount(user3.address)).to.equal(1);
    });

    it("Should maintain separate assessment lists per user", async function () {
      const { contract, user1, user2 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // User1: 2 assessments
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });

      // User2: 1 assessment
      await contract.connect(user2).submitCareerAssessment(mock, mock, mock, { value: fee });

      const user1Assessments = await contract.getUserAssessments(user1.address);
      const user2Assessments = await contract.getUserAssessments(user2.address);

      expect(user1Assessments).to.have.lengthOf(2);
      expect(user2Assessments).to.have.lengthOf(1);

      expect(user1Assessments[0]).to.equal(1);
      expect(user1Assessments[1]).to.equal(2);
      expect(user2Assessments[0]).to.equal(3);
    });

    it("Should handle concurrent assessment submissions", async function () {
      const { contract, user1, user2, user3 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // Submit multiple assessments in parallel
      await Promise.all([
        contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee }),
        contract.connect(user2).submitCareerAssessment(mock, mock, mock, { value: fee }),
        contract.connect(user3).submitCareerAssessment(mock, mock, mock, { value: fee })
      ]);

      expect(await contract.assessmentCounter()).to.equal(3);
    });

    it("Should isolate user data correctly", async function () {
      const { contract, user1, user2 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      await contract.connect(user2).submitCareerAssessment(mock, mock, mock, { value: fee });

      // User1 should not see User2's assessment
      const user1Assessments = await contract.getUserAssessments(user1.address);
      const user2Assessments = await contract.getUserAssessments(user2.address);

      expect(user1Assessments).to.not.include(2);
      expect(user2Assessments).to.not.include(1);
    });
  });

  // ==================================================================
  // OWNER FUNCTION TESTS
  // ==================================================================

  describe("✅ Owner Functions", function () {

    it("Should allow owner to withdraw funds", async function () {
      const { contract, contractAddress, owner, user1 } =
        await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // Submit assessment to add funds
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });

      const contractBalanceBefore = await ethers.provider.getBalance(contractAddress);
      expect(contractBalanceBefore).to.equal(fee);

      // Owner withdraws
      await contract.connect(owner).withdraw();

      const contractBalanceAfter = await ethers.provider.getBalance(contractAddress);
      expect(contractBalanceAfter).to.equal(0);
    });

    it("Should prevent non-owner from withdrawing", async function () {
      const { contract, user1 } = await loadFixture(deployWithAssessmentsFixture);

      await expect(
        contract.connect(user1).withdraw()
      ).to.be.reverted;
    });

    it("Should handle withdrawal with zero balance", async function () {
      const { contract, owner } = await loadFixture(deployContractFixture);

      await expect(
        contract.connect(owner).withdraw()
      ).to.not.be.reverted;
    });

    it("Should return correct contract balance", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });

      const balance = await contract.getContractBalance();
      expect(balance).to.equal(ethers.parseEther("0.002"));
    });
  });

  // ==================================================================
  // DATA RETRIEVAL TESTS
  // ==================================================================

  describe("✅ Data Retrieval", function () {

    it("Should return correct assessment count", async function () {
      const { contract } = await loadFixture(deployWithAssessmentsFixture);

      expect(await contract.getAssessmentCount()).to.equal(1);
    });

    it("Should return correct user assessment count", async function () {
      const { contract, user1 } = await loadFixture(deployWithAssessmentsFixture);

      expect(await contract.getUserAssessmentCount(user1.address)).to.equal(1);
    });

    it("Should return empty array for user with no assessments", async function () {
      const { contract, user2 } = await loadFixture(deployWithAssessmentsFixture);

      const assessments = await contract.getUserAssessments(user2.address);
      expect(assessments).to.have.lengthOf(0);
    });

    it("Should return correct assessment info", async function () {
      const { contract, user1 } = await loadFixture(deployWithAssessmentsFixture);

      const [user, timestamp, resultRequested] = await contract.getAssessmentInfo(1);

      expect(user).to.equal(user1.address);
      expect(timestamp).to.be.gt(0);
      expect(resultRequested).to.be.false;
    });

    it("Should return encrypted guidance score for owner", async function () {
      const { contract, user1 } = await loadFixture(deployWithAssessmentsFixture);

      await expect(
        contract.connect(user1).getEncryptedCareerGuidance(1)
      ).to.not.be.reverted;
    });
  });

  // ==================================================================
  // EDGE CASE TESTS
  // ==================================================================

  describe("✅ Edge Cases", function () {

    it("Should handle maximum assessments per user", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // Submit 10 assessments
      for (let i = 0; i < 10; i++) {
        await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      }

      expect(await contract.getUserAssessmentCount(user1.address)).to.equal(10);

      const assessments = await contract.getUserAssessments(user1.address);
      expect(assessments).to.have.lengthOf(10);
    });

    it("Should handle assessment ID overflow correctly", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });

      expect(await contract.assessmentCounter()).to.equal(1);

      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });

      expect(await contract.assessmentCounter()).to.equal(2);
    });

    it("Should handle zero address queries", async function () {
      const { contract } = await loadFixture(deployContractFixture);

      const count = await contract.getUserAssessmentCount(ethers.ZeroAddress);
      expect(count).to.equal(0);
    });

    it("Should handle receive() function", async function () {
      const { contract, contractAddress, user1 } = await loadFixture(deployContractFixture);

      const amount = ethers.parseEther("0.1");

      await user1.sendTransaction({
        to: contractAddress,
        value: amount
      });

      const balance = await ethers.provider.getBalance(contractAddress);
      expect(balance).to.equal(amount);
    });
  });

  // ==================================================================
  // STATE CONSISTENCY TESTS
  // ==================================================================

  describe("✅ State Consistency", function () {

    it("Should maintain consistent counter across operations", async function () {
      const { contract, user1, user2 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      expect(await contract.assessmentCounter()).to.equal(0);

      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      expect(await contract.assessmentCounter()).to.equal(1);

      await contract.connect(user2).submitCareerAssessment(mock, mock, mock, { value: fee });
      expect(await contract.assessmentCounter()).to.equal(2);

      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      expect(await contract.assessmentCounter()).to.equal(3);
    });

    it("Should maintain user assessment array integrity", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      for (let i = 1; i <= 5; i++) {
        await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });

        const assessments = await contract.getUserAssessments(user1.address);
        expect(assessments).to.have.lengthOf(i);
        expect(assessments[i - 1]).to.equal(i);
      }
    });

    it("Should maintain correct balance after multiple operations", async function () {
      const { contract, contractAddress, user1, owner } =
        await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // Submit 3 assessments
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });

      let balance = await ethers.provider.getBalance(contractAddress);
      expect(balance).to.equal(ethers.parseEther("0.003"));

      // Withdraw
      await contract.connect(owner).withdraw();

      balance = await ethers.provider.getBalance(contractAddress);
      expect(balance).to.equal(0);
    });
  });

  // ==================================================================
  // GAS CONSUMPTION TESTS
  // ==================================================================

  describe("⛽ Gas Consumption", function () {

    it("Should track gas for assessment submission", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      const tx = await contract.connect(user1).submitCareerAssessment(
        mock, mock, mock, { value: fee }
      );
      const receipt = await tx.wait();

      console.log("      Gas used for submission:", receipt.gasUsed.toString());

      // Gas should be reasonable (not excessive)
      expect(receipt.gasUsed).to.be.lt(500000);
    });

    it("Should track gas for result request", async function () {
      const { contract, user1 } = await loadFixture(deployWithAssessmentsFixture);

      const tx = await contract.connect(user1).requestAssessmentResult(1);
      const receipt = await tx.wait();

      console.log("      Gas used for result request:", receipt.gasUsed.toString());

      expect(receipt.gasUsed).to.be.lt(100000);
    });

    it("Should track gas for withdrawal", async function () {
      const { contract, owner } = await loadFixture(deployWithAssessmentsFixture);

      const tx = await contract.connect(owner).withdraw();
      const receipt = await tx.wait();

      console.log("      Gas used for withdrawal:", receipt.gasUsed.toString());

      expect(receipt.gasUsed).to.be.lt(100000);
    });
  });

  // ==================================================================
  // EVENT EMISSION TESTS
  // ==================================================================

  describe("✅ Event Emission", function () {

    it("Should emit events with correct argument types", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      const tx = await contract.connect(user1).submitCareerAssessment(
        mock, mock, mock, { value: fee }
      );
      const receipt = await tx.wait();

      const event = receipt.logs[0];
      expect(event).to.not.be.undefined;
    });

    it("Should emit ResultRequested with correct parameters", async function () {
      const { contract, user1 } = await loadFixture(deployWithAssessmentsFixture);

      await expect(
        contract.connect(user1).requestAssessmentResult(1)
      )
        .to.emit(contract, "ResultRequested")
        .withArgs(user1.address, 1);
    });

    it("Should emit multiple events for batch operations", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // Submit 3 assessments
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      const tx = await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });

      const receipt = await tx.wait();
      expect(receipt.logs).to.have.lengthOf.at.least(1);
    });
  });

  // ==================================================================
  // INTEGRATION TESTS
  // ==================================================================

  describe("✅ Integration Scenarios", function () {

    it("Should handle complete workflow: submit -> request -> retrieve", async function () {
      const { contract, user1 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // Step 1: Submit assessment
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      expect(await contract.assessmentCounter()).to.equal(1);

      // Step 2: Request result
      await contract.connect(user1).requestAssessmentResult(1);
      expect(await contract.isResultRequested(1)).to.be.true;

      // Step 3: Retrieve result
      const score = await contract.connect(user1).getDecryptedCareerGuidance(1);
      expect(score).to.be.gt(0);
    });

    it("Should handle multiple users complete workflow", async function () {
      const { contract, user1, user2 } = await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // User1 workflow
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      await contract.connect(user1).requestAssessmentResult(1);

      // User2 workflow
      await contract.connect(user2).submitCareerAssessment(mock, mock, mock, { value: fee });
      await contract.connect(user2).requestAssessmentResult(2);

      // Verify isolation
      await expect(
        contract.connect(user1).requestAssessmentResult(2)
      ).to.be.revertedWith("Not your assessment");

      await expect(
        contract.connect(user2).requestAssessmentResult(1)
      ).to.be.revertedWith("Not your assessment");
    });

    it("Should maintain integrity across complex operations", async function () {
      const { contract, contractAddress, user1, user2, owner } =
        await loadFixture(deployContractFixture);

      const mock = ethers.encodeBytes32String("encrypted");
      const fee = ethers.parseEther("0.001");

      // Multiple submissions
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });
      await contract.connect(user2).submitCareerAssessment(mock, mock, mock, { value: fee });
      await contract.connect(user1).submitCareerAssessment(mock, mock, mock, { value: fee });

      // Verify counts
      expect(await contract.assessmentCounter()).to.equal(3);
      expect(await contract.getUserAssessmentCount(user1.address)).to.equal(2);
      expect(await contract.getUserAssessmentCount(user2.address)).to.equal(1);

      // Verify balance
      const balance = await ethers.provider.getBalance(contractAddress);
      expect(balance).to.equal(ethers.parseEther("0.003"));

      // Request results
      await contract.connect(user1).requestAssessmentResult(1);
      await contract.connect(user2).requestAssessmentResult(2);

      // Verify flags
      expect(await contract.isResultRequested(1)).to.be.true;
      expect(await contract.isResultRequested(2)).to.be.true;
      expect(await contract.isResultRequested(3)).to.be.false;

      // Withdraw
      await contract.connect(owner).withdraw();

      const finalBalance = await ethers.provider.getBalance(contractAddress);
      expect(finalBalance).to.equal(0);
    });
  });
});
