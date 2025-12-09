# Developer Guide - Confidential Career Planning

This guide helps developers understand, extend, and customize the Confidential Career Planning FHEVM example.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Setup & Installation](#setup--installation)
3. [Understanding the Implementation](#understanding-the-implementation)
4. [Extending the Example](#extending-the-example)
5. [Testing Guidelines](#testing-guidelines)
6. [Deployment Guide](#deployment-guide)
7. [Integration Patterns](#integration-patterns)
8. [Troubleshooting](#troubleshooting)

## Project Structure

```
CareerPlanningWithPapers/
├── contracts/                          # Smart contracts
│   ├── CareerPlanningFHE.sol          # Main FHE implementation
│   ├── CareerPlanningSimple.sol       # Non-FHE comparison version
│   └── CareerPlanningWithPapers.sol   # Extended version with research refs
│
├── test/                               # Test files
│   └── CareerPlanning.test.js         # Comprehensive test suite
│
├── scripts/                            # Automation scripts
│   └── deploy.js                      # Deployment script
│
├── docs/                               # Documentation
│   ├── BEGINNER_WALKTHROUGH.md        # Beginner tutorial
│   ├── FHE_CONTRACT_GUIDE.md          # FHE concepts deep dive
│   └── HELLO_FHEVM_TUTORIAL.md        # Quick start guide
│
├── artifacts/                          # Compiled contracts (generated)
├── cache/                              # Hardhat cache (generated)
├── node_modules/                       # Dependencies (generated)
│
├── hardhat.config.js                   # Hardhat configuration
├── package.json                        # Project dependencies
├── tsconfig.json                       # TypeScript configuration
│
├── BOUNTY_SUBMISSION.md               # Bounty submission document
├── EXAMPLE_DOCUMENTATION.md           # GitBook-style documentation
├── DEVELOPER_GUIDE.md                 # This file
└── README.md                          # Project overview
```

## Setup & Installation

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: For version control
- **MetaMask** or similar wallet: For testing

### Installation Steps

```bash
# Clone or navigate to project
cd CareerPlanningWithPapers

# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test
```

### Dependencies

```json
{
  "dependencies": {
    "@fhevm/solidity": "^0.8.0",
    "@openzeppelin/contracts": "^5.4.0"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^2.0.0",
    "hardhat": "^2.17.0"
  }
}
```

## Understanding the Implementation

### Core Data Structure

```solidity
struct CareerAssessment {
    address user;                // Who submitted the assessment
    ebool careerGoal;            // Encrypted: Clear career goals?
    ebool skillLevel;            // Encrypted: High skill confidence?
    ebool educationPriority;     // Encrypted: Education is priority?
    uint256 timestamp;           // When was it submitted?
    bool resultRequested;        // Has decryption been requested?
    euint8 guidanceScore;        // Encrypted: Calculated score (0-100)
}
```

**Design Choices:**
- `ebool` for binary preferences (more efficient than euint for true/false)
- `euint8` for score (range 0-255, we use 0-100)
- `address` and `uint256` for public metadata (doesn't need encryption)
- `bool` for request status (public flag for decryption flow)

### FHE Operations Flow

```
Input: 3 encrypted booleans
  ↓
FHE.select() → Convert each bool to points (0 or N)
  ↓
FHE.add() → Sum all points to base score
  ↓
Output: 1 encrypted uint8 (final score)
```

**Why This Architecture?**
- **Composability**: Score can be used in other encrypted computations
- **Privacy**: No intermediate values are revealed
- **Flexibility**: Easy to add more criteria
- **Efficiency**: Minimal FHE operations for gas optimization

### Scoring Logic

| Criteria | If True | If False |
|----------|---------|----------|
| Base Score | 50 | 50 |
| Career Goal Clear | +15 | +0 |
| Skills Confident | +20 | +0 |
| Education Priority | +15 | +0 |
| **Total Range** | **50-100** | **50-100** |

**Possible Scores:**
- All false: 50
- Only career goal: 65
- Career + skills: 85
- All true: 100

### Access Control Patterns

```solidity
// Pattern 1: Owner-only functions
function withdraw() external onlyOwner {
    payable(owner()).transfer(address(this).balance);
}

// Pattern 2: Data owner access
function requestAssessmentResult(uint256 _assessmentId) external {
    require(assessments[_assessmentId].user == msg.sender, "Not your assessment");
    // ...
}

// Pattern 3: Conditional access based on state
function getDecryptedCareerGuidance(uint256 _assessmentId) external view returns (uint8) {
    require(assessments[_assessmentId].user == msg.sender, "Not authorized");
    require(assessments[_assessmentId].resultRequested, "Result not requested yet");
    // ...
}
```

## Extending the Example

### Adding New Assessment Criteria

**Scenario:** Add an encrypted "yearsOfExperience" field (euint8)

**Step 1:** Update the struct
```solidity
struct CareerAssessment {
    // ... existing fields ...
    euint8 yearsOfExperience;  // NEW: 0-255 years
}
```

**Step 2:** Update submission function
```solidity
function submitCareerAssessment(
    ebool encryptedCareerGoal,
    ebool encryptedSkillLevel,
    ebool encryptedEducationPriority,
    euint8 encryptedYearsOfExperience  // NEW parameter
) external payable {
    // ... existing code ...

    assessments[assessmentCounter] = CareerAssessment({
        // ... existing fields ...
        yearsOfExperience: encryptedYearsOfExperience  // NEW field
    });
}
```

**Step 3:** Update scoring logic
```solidity
function calculateEncryptedGuidanceScore(
    ebool _careerGoal,
    ebool _skillLevel,
    ebool _educationPriority,
    euint8 _yearsOfExperience  // NEW parameter
) private returns (euint8) {
    euint8 score = FHE.asEuint8(50);

    // ... existing logic ...

    // NEW: Add bonus based on experience
    // If experience > 5 years, add 10 points
    ebool hasExperience = FHE.gt(_yearsOfExperience, FHE.asEuint8(5));
    euint8 expPoints = FHE.select(hasExperience, FHE.asEuint8(10), FHE.asEuint8(0));
    score = FHE.add(score, expPoints);

    return score;
}
```

**Step 4:** Update tests
```javascript
it("Should handle years of experience", async function () {
    const mockYearsOfExperience = ethers.encodeBytes32String("encrypted_8");
    // ... add to test cases ...
});
```

### Adding Encrypted Comparisons

**Example:** Check if skill level is "high enough" for a job

```solidity
/**
 * @notice Check if user's skill level meets job requirements
 * @param _assessmentId User's assessment
 * @param _requiredSkillLevel Encrypted minimum skill requirement
 * @return Encrypted boolean: does user qualify?
 */
function meetsJobRequirements(
    uint256 _assessmentId,
    euint8 _requiredSkillLevel
) external view returns (ebool) {
    CareerAssessment storage assessment = assessments[_assessmentId];
    require(assessment.user == msg.sender, "Not authorized");

    // Compare encrypted values
    return FHE.gte(assessment.guidanceScore, _requiredSkillLevel);
}
```

### Implementing Batch Operations

**Scenario:** Submit multiple assessments in one transaction

```solidity
struct BatchAssessmentInput {
    ebool careerGoal;
    ebool skillLevel;
    ebool educationPriority;
}

function submitBatchAssessments(
    BatchAssessmentInput[] calldata inputs
) external payable {
    uint256 totalFee = 0.001 ether * inputs.length;
    require(msg.value >= totalFee, "Insufficient fee");

    for (uint256 i = 0; i < inputs.length; i++) {
        assessmentCounter++;

        euint8 guidanceScore = calculateEncryptedGuidanceScore(
            inputs[i].careerGoal,
            inputs[i].skillLevel,
            inputs[i].educationPriority
        );

        assessments[assessmentCounter] = CareerAssessment({
            user: msg.sender,
            careerGoal: inputs[i].careerGoal,
            skillLevel: inputs[i].skillLevel,
            educationPriority: inputs[i].educationPriority,
            timestamp: block.timestamp,
            resultRequested: false,
            guidanceScore: guidanceScore
        });

        userAssessments[msg.sender].push(assessmentCounter);

        emit AssessmentSubmitted(msg.sender, assessmentCounter, block.timestamp);
    }
}
```

### Integrating with Relayer for Real Decryption

Replace mock decryption with actual relayer integration:

```solidity
import "@zama-fhe/relayer-sdk/contracts/RelayerConsumer.sol";

contract CareerPlanningFHE is Ownable, RelayerConsumer {

    // Request decryption from relayer
    function requestAssessmentResult(uint256 _assessmentId) external {
        CareerAssessment storage assessment = assessments[_assessmentId];
        require(assessment.user == msg.sender, "Not your assessment");
        require(!assessment.resultRequested, "Result already requested");

        assessment.resultRequested = true;

        // Request decryption from relayer
        relayer.requestDecryption(
            assessment.guidanceScore,
            this.fulfillDecryption.selector,
            abi.encode(_assessmentId, msg.sender)
        );

        emit ResultRequested(msg.sender, _assessmentId);
    }

    // Callback from relayer with decrypted value
    function fulfillDecryption(
        uint256 decryptedValue,
        bytes memory data
    ) external onlyRelayer {
        (uint256 assessmentId, address user) = abi.decode(data, (uint256, address));

        // Store or emit decrypted result
        emit DecryptionFulfilled(user, assessmentId, uint8(decryptedValue));
    }
}
```

## Testing Guidelines

### Test Structure

```javascript
describe("CareerPlanningFHE", function () {
  let contract, owner, user1, user2;

  beforeEach(async function () {
    // Deploy fresh contract for each test
  });

  describe("Feature Category", function () {
    it("✅ Should handle successful case", async function () {
      // Arrange: Set up test data
      // Act: Execute function
      // Assert: Check results
    });

    it("❌ Should reject invalid input", async function () {
      // Test error cases
    });
  });
});
```

### Best Practices

**1. Test Both Success and Failure Cases**
```javascript
it("✅ Should submit with valid fee", async function () {
  const fee = ethers.parseEther("0.001");
  await expect(contract.submitCareerAssessment(..., { value: fee }))
    .to.emit(contract, "AssessmentSubmitted");
});

it("❌ Should reject insufficient fee", async function () {
  const fee = ethers.parseEther("0.0001");
  await expect(contract.submitCareerAssessment(..., { value: fee }))
    .to.be.revertedWith("Minimum fee required");
});
```

**2. Test Access Control**
```javascript
it("❌ Should prevent unauthorized access", async function () {
  // User1 creates assessment
  await contract.connect(user1).submitCareerAssessment(...);

  // User2 tries to access it
  await expect(
    contract.connect(user2).requestAssessmentResult(1)
  ).to.be.revertedWith("Not your assessment");
});
```

**3. Test State Changes**
```javascript
it("Should update counter and mappings correctly", async function () {
  const beforeCount = await contract.assessmentCounter();
  const beforeUserAssessments = await contract.getUserAssessmentCount(user1.address);

  await contract.connect(user1).submitCareerAssessment(...);

  const afterCount = await contract.assessmentCounter();
  const afterUserAssessments = await contract.getUserAssessmentCount(user1.address);

  expect(afterCount).to.equal(beforeCount + 1);
  expect(afterUserAssessments).to.equal(beforeUserAssessments + 1);
});
```

**4. Test Events**
```javascript
it("Should emit correct event data", async function () {
  const tx = await contract.connect(user1).submitCareerAssessment(...);
  const receipt = await tx.wait();

  const event = receipt.events?.find(e => e.event === "AssessmentSubmitted");
  expect(event.args.user).to.equal(user1.address);
  expect(event.args.assessmentId).to.equal(1);
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npx hardhat test test/CareerPlanning.test.js

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run with coverage
npx hardhat coverage
```

## Deployment Guide

### Local Development Network

```bash
# Terminal 1: Start Hardhat node
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

### Sepolia Testnet

**Step 1:** Configure network in `hardhat.config.js`
```javascript
module.exports = {
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};
```

**Step 2:** Set environment variables
```bash
# .env file
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here
```

**Step 3:** Deploy
```bash
npm run deploy:sepolia
```

### Mainnet Deployment Checklist

- [ ] All tests passing
- [ ] Security audit completed
- [ ] Gas optimization reviewed
- [ ] Relayer integration tested
- [ ] Access control verified
- [ ] Emergency procedures documented
- [ ] Monitoring setup configured
- [ ] Backup plan established

## Integration Patterns

### Frontend Integration

```javascript
// Example: Connect and submit assessment

import { ethers } from "ethers";

// Connect to contract
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

// Prepare encrypted inputs (requires FHEVM client library)
const encryptedCareerGoal = await fhevm.encrypt_bool(true);
const encryptedSkillLevel = await fhevm.encrypt_bool(true);
const encryptedEducation = await fhevm.encrypt_bool(false);

// Submit assessment
const fee = ethers.parseEther("0.001");
const tx = await contract.submitCareerAssessment(
  encryptedCareerGoal,
  encryptedSkillLevel,
  encryptedEducation,
  { value: fee }
);

await tx.wait();
console.log("Assessment submitted!");
```

### Backend Integration

```javascript
// Example: Monitor new assessments

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

// Listen for events
contract.on("AssessmentSubmitted", (user, assessmentId, timestamp) => {
  console.log(`New assessment ${assessmentId} from ${user}`);

  // Trigger backend processing
  processNewAssessment(assessmentId);
});
```

### Multi-Contract Integration

```solidity
// Example: Use career score in another contract

interface ICareerPlanning {
    function getEncryptedCareerGuidance(uint256 _assessmentId)
        external
        view
        returns (euint8);
}

contract JobMatching {
    ICareerPlanning public careerContract;

    function checkJobEligibility(
        uint256 _assessmentId,
        euint8 _minRequiredScore
    ) external view returns (ebool) {
        euint8 userScore = careerContract.getEncryptedCareerGuidance(_assessmentId);
        return FHE.gte(userScore, _minRequiredScore);
    }
}
```

## Troubleshooting

### Common Issues

**Issue:** "Minimum fee required" error
```
Solution: Ensure you're sending at least 0.001 ETH with the transaction
const fee = ethers.parseEther("0.001");
await contract.submitCareerAssessment(..., { value: fee });
```

**Issue:** "Not your assessment" error
```
Solution: Check that you're using the correct signer
// Make sure the signer matches the assessment owner
await contract.connect(correctUser).requestAssessmentResult(assessmentId);
```

**Issue:** FHE operations failing in tests
```
Solution: Ensure you're using the correct FHEVM test environment
// Use @fhevm/hardhat-plugin for proper test setup
require("@fhevm/hardhat-plugin");
```

**Issue:** Gas limit exceeded
```
Solution: FHE operations are gas-intensive. Increase gas limit:
const tx = await contract.submitCareerAssessment(..., {
  value: fee,
  gasLimit: 5000000  // Increase if needed
});
```

### Debugging Tips

**1. Add console.log in tests**
```javascript
console.log("Assessment ID:", assessmentId.toString());
console.log("User address:", await user1.getAddress());
```

**2. Check event emission**
```javascript
const receipt = await tx.wait();
console.log("Events:", receipt.events);
```

**3. Verify contract state**
```javascript
const count = await contract.assessmentCounter();
const userAssessments = await contract.getUserAssessments(user1.address);
console.log("Counter:", count, "User assessments:", userAssessments);
```

## Performance Optimization

### Gas Optimization Tips

**1. Use appropriate FHE types**
```solidity
// Good: Use euint8 for small ranges
euint8 score = FHE.asEuint8(50);  // 0-255

// Avoid: Using euint32 when euint8 suffices
euint32 score = FHE.asEuint32(50);  // More expensive
```

**2. Batch operations when possible**
```solidity
// Better: Single transaction for multiple assessments
submitBatchAssessments([input1, input2, input3]);

// vs: Multiple transactions
submitCareerAssessment(input1);
submitCareerAssessment(input2);
submitCareerAssessment(input3);
```

**3. Cache storage reads**
```solidity
// Good: Read once, use multiple times
CareerAssessment storage assessment = assessments[_assessmentId];
require(assessment.user == msg.sender);
return assessment.guidanceScore;

// Avoid: Multiple storage reads
require(assessments[_assessmentId].user == msg.sender);
return assessments[_assessmentId].guidanceScore;
```

## Security Best Practices

1. **Always validate access before operations**
2. **Use two-phase decryption patterns**
3. **Implement proper access control modifiers**
4. **Validate all inputs**
5. **Emit events for audit trails**
6. **Test all edge cases**
7. **Consider reentrancy protection**
8. **Document security assumptions**

## Further Resources

- **FHEVM Docs**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Hardhat Docs**: [https://hardhat.org/getting-started/](https://hardhat.org/getting-started/)
- **OpenZeppelin**: [https://docs.openzeppelin.com/](https://docs.openzeppelin.com/)
- **Solidity Docs**: [https://docs.soliditylang.org/](https://docs.soliditylang.org/)

## Contributing

To contribute improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

---

**Need help?** Check the documentation or open an issue in the repository!
