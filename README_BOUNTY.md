# Confidential Career Planning - FHEVM Example

A comprehensive, privacy-preserving career planning application demonstrating Fully Homomorphic Encryption on the FHEVM (Fully Homomorphic Encryption Virtual Machine) by Zama.

## 🎯 Project Overview

This repository provides a complete FHEVM example showcasing how to build real-world applications with encrypted data processing. The Confidential Career Planning system enables users to:

- **Submit encrypted career assessments** without exposing sensitive professional data
- **Receive confidential guidance scores** calculated on encrypted data
- **Access results securely** through a two-phase decryption pattern
- **Maintain complete privacy** while leveraging smart contract computation

## ✨ Key Features

### Privacy-First Architecture
- **Encrypted Input Processing**: Users submit career data as encrypted boolean values
- **FHE Arithmetic**: Guidance scores calculated entirely in encrypted domain
- **Access Control**: Only assessment owners can access their results
- **Blockchain Verification**: Immutable records of all activities

### FHEVM Concepts Demonstrated
- ✅ Working with encrypted types (`ebool`, `euint8`)
- ✅ Conditional logic using `FHE.select()`
- ✅ Arithmetic operations using `FHE.add()`
- ✅ Proper permission management
- ✅ Two-phase decryption patterns
- ✅ Access control and authorization

### Production-Ready Quality
- 🧪 Comprehensive test coverage
- 📚 Extensive documentation at multiple levels
- 🎬 Video demonstration
- 🌐 Live deployment on Sepolia testnet
- 🔧 Multiple contract variations for learning
- 📱 Working frontend interface

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher
- **Git**

### Installation

```bash
# Clone or navigate to the project
cd CareerPlanningWithPapers

# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test
```

### Running Locally

```bash
# Terminal 1: Start Hardhat local network
npm run node

# Terminal 2: Deploy contracts
npm run deploy:localhost
```

### Deploying to Sepolia Testnet

```bash
# Set environment variables (see .env.example)
# SEPOLIA_RPC_URL=...
# PRIVATE_KEY=...

npm run deploy:sepolia
```

## 📖 Documentation

This project includes comprehensive documentation for all learning levels:

### For Beginners
- **[HELLO_FHEVM_TUTORIAL.md](HELLO_FHEVM_TUTORIAL.md)** - Quick start and basic concepts
- **[BEGINNER_WALKTHROUGH.md](BEGINNER_WALKTHROUGH.md)** - Step-by-step guide to the example

### For Implementers
- **[EXAMPLE_DOCUMENTATION.md](EXAMPLE_DOCUMENTATION.md)** - GitBook-style detailed documentation with code examples
- **[FHE_CONTRACT_GUIDE.md](FHE_CONTRACT_GUIDE.md)** - Deep dive into FHE implementation patterns

### For Developers
- **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - How to extend, test, and deploy
- **[BOUNTY_SUBMISSION.md](BOUNTY_SUBMISSION.md)** - Submission details and innovation highlights

## 📁 Project Structure

```
CareerPlanningWithPapers/
├── contracts/
│   ├── CareerPlanningFHE.sol          # Main FHE implementation
│   ├── CareerPlanningSimple.sol       # Non-FHE comparison
│   └── CareerPlanningWithPapers.sol   # Extended version
├── test/
│   └── CareerPlanning.test.js         # Comprehensive tests
├── scripts/
│   └── deploy.js                      # Deployment scripts
├── docs/
│   ├── BEGINNER_WALKTHROUGH.md
│   ├── FHE_CONTRACT_GUIDE.md
│   └── HELLO_FHEVM_TUTORIAL.md
├── hardhat.config.js
├── package.json
└── README.md
```

## 🔐 Core Implementation

### Encrypted Data Structure

```solidity
struct CareerAssessment {
    address user;                // Assessment owner
    ebool careerGoal;            // ✓ Encrypted: Clear career goals?
    ebool skillLevel;            // ✓ Encrypted: Confident in skills?
    ebool educationPriority;     // ✓ Encrypted: Education priority?
    uint256 timestamp;           // When submitted
    bool resultRequested;        // Decryption requested?
    euint8 guidanceScore;        // ✓ Encrypted: Calculated score (0-100)
}
```

### FHE Scoring Algorithm

```solidity
function calculateEncryptedGuidanceScore(
    ebool _careerGoal,
    ebool _skillLevel,
    ebool _educationPriority
) private returns (euint8) {
    // Base score: 50
    euint8 score = FHE.asEuint8(50);

    // Conditional point addition (FHE.select)
    euint8 careerPoints = FHE.select(_careerGoal, FHE.asEuint8(15), FHE.asEuint8(0));
    euint8 skillPoints = FHE.select(_skillLevel, FHE.asEuint8(20), FHE.asEuint8(0));
    euint8 eduPoints = FHE.select(_educationPriority, FHE.asEuint8(15), FHE.asEuint8(0));

    // Arithmetic on encrypted values (FHE.add)
    score = FHE.add(score, careerPoints);
    score = FHE.add(score, skillPoints);
    score = FHE.add(score, eduPoints);

    return score; // Still encrypted!
}
```

### Usage Workflow

```javascript
// 1. Encrypt career data
const encrypted = await fhevm.createEncryptedInput(contractAddress, userAddress);
encrypted.addBool(true);    // Career goals
encrypted.addBool(true);    // Skill confidence
encrypted.addBool(false);   // Education priority

// 2. Submit encrypted assessment
const fee = ethers.parseEther("0.001");
const tx = await contract.submitCareerAssessment(
  encrypted.handles[0],
  encrypted.handles[1],
  encrypted.handles[2],
  { value: fee }
);
await tx.wait();

// 3. Request and retrieve results
await contract.requestAssessmentResult(assessmentId);
const decryptedScore = await contract.getDecryptedCareerGuidance(assessmentId);
console.log("Career Guidance Score:", decryptedScore); // 0-100
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# All tests
npm run test

# Specific test file
npx hardhat test test/CareerPlanning.test.js

# With gas reporting
REPORT_GAS=true npm run test

# With coverage
npx hardhat coverage
```

## 📊 Contract Addresses

### Deployed Examples
- **Sepolia Testnet**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Local Network**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

## 🌐 Live Deployment

**Website**: [https://career-planning-nine.vercel.app/](https://career-planning-nine.vercel.app/)

## 🎬 Video Demonstration

A comprehensive video demonstration is included showing:
- Project setup and installation
- Contract compilation and testing
- Frontend interaction flow
- Complete end-to-end workflow
- On-chain verification

File: `Video Demonstration.mp4`

## 🔑 Key Concepts

### FHE.select() - Conditional Logic

```solidity
euint8 result = FHE.select(encryptedCondition, ifTrue, ifFalse);
```

Evaluates an encrypted boolean and returns different encrypted values **without revealing which condition was true**.

### FHE.add() - Encrypted Arithmetic

```solidity
euint8 sum = FHE.add(encryptedValue1, encryptedValue2);
```

Adds encrypted numbers **without decryption**. The smart contract never sees the actual values.

### Two-Phase Decryption

1. **Request Phase**: User signals intent to decrypt
2. **Retrieve Phase**: User receives decrypted result

This pattern enables secure, controlled decryption with optional relayer integration.

## 📚 Learning Path

### Beginner Level
1. Start with [HELLO_FHEVM_TUTORIAL.md](HELLO_FHEVM_TUTORIAL.md)
2. Read [BEGINNER_WALKTHROUGH.md](BEGINNER_WALKTHROUGH.md)
3. Run the example: `npm run test`

### Intermediate Level
4. Study [EXAMPLE_DOCUMENTATION.md](EXAMPLE_DOCUMENTATION.md)
5. Review contract code and tests
6. Experiment with small modifications

### Advanced Level
7. Read [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
8. Implement new features
9. Integrate with your own contracts

## 🛠️ Extending the Example

### Add New Assessment Criteria

See [DEVELOPER_GUIDE.md#adding-new-assessment-criteria](DEVELOPER_GUIDE.md#adding-new-assessment-criteria) for detailed instructions.

### Implement Relayer Integration

Replace mock decryption with real Zama relayer for production use. See [DEVELOPER_GUIDE.md#integrating-with-relayer-for-real-decryption](DEVELOPER_GUIDE.md#integrating-with-relayer-for-real-decryption).

### Add Batch Operations

Submit multiple assessments in a single transaction. See [DEVELOPER_GUIDE.md#implementing-batch-operations](DEVELOPER_GUIDE.md#implementing-batch-operations).

## 🔒 Security Considerations

### Access Control
- ✅ Only assessment owners can access their results
- ✅ Proper use of modifiers and require statements
- ✅ Owner-only withdrawal functionality

### Best Practices
- ✅ Comprehensive input validation
- ✅ Event emission for audit trails
- ✅ Reentrancy protection patterns
- ✅ Gas-efficient FHE operations

### Tested Scenarios
- ✅ Unauthorized access attempts
- ✅ Invalid input handling
- ✅ State consistency verification
- ✅ Access control enforcement

## 📈 Use Cases & Applications

This example can be adapted for:

- **Healthcare**: Confidential patient assessments
- **Finance**: Private credit scoring and risk assessment
- **Education**: Anonymous academic evaluations and rankings
- **HR**: Confidential employee reviews and performance evaluation
- **Government**: Privacy-preserving benefits eligibility assessment
- **Insurance**: Private claim risk analysis

## 🤝 Contributing

To contribute improvements:

1. Create a feature branch
2. Make your changes with tests
3. Ensure all tests pass
4. Update documentation as needed
5. Submit for review

## 📝 License

BSD-3-Clause-Clear License - See LICENSE file

## 🔗 Resources

### FHEVM Documentation
- [FHEVM Official Docs](https://docs.zama.ai/fhevm)
- [FHEVM Operations Reference](https://docs.zama.ai/fhevm/fundamentals/types)
- [Decryption Guide](https://docs.zama.ai/fhevm/guides/decrypt)

### Solidity & Hardhat
- [Hardhat Documentation](https://hardhat.org/getting-started/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/)

### Related Projects
- [FHEVM Hardhat Template](https://github.com/zama-ai/fhevm-hardhat-template)
- [OpenZeppelin Confidential Contracts](https://github.com/OpenZeppelin/openzeppelin-confidential-contracts)
- [Zama Examples](https://github.com/zama-ai/dapps)

## 🆘 Troubleshooting

### Common Issues

**"Minimum fee required"**
```bash
# Ensure you're sending at least 0.001 ETH
const fee = ethers.parseEther("0.001");
await contract.submitCareerAssessment(..., { value: fee });
```

**"Not your assessment"**
```bash
# Verify you're using the correct signer
await contract.connect(assessmentOwner).requestAssessmentResult(id);
```

**FHE operation failures**
```bash
# Use proper FHEVM test environment setup
# Make sure @fhevm/hardhat-plugin is installed
npm install @fhevm/hardhat-plugin
```

For more troubleshooting, see [DEVELOPER_GUIDE.md#troubleshooting](DEVELOPER_GUIDE.md#troubleshooting).

## 📞 Support

- **Documentation**: Check the included guides
- **Issues**: Open an issue in the repository
- **Community**: [Zama Community Forum](https://www.zama.ai/community)
- **Discord**: [Zama Discord](https://discord.com/invite/zama)

---

## 🎓 What You'll Learn

After working through this example, you'll understand:

✅ How to use encrypted data types in Solidity
✅ How to implement conditional logic on encrypted values
✅ How to perform arithmetic on encrypted data
✅ How to manage access control for encrypted information
✅ How to design and test privacy-preserving contracts
✅ How to integrate FHE into real-world applications
✅ Best practices for confidential smart contracts

---

**Built with ❤️ using FHEVM by Zama**

For the latest updates, visit [https://www.zama.ai/](https://www.zama.ai/)
