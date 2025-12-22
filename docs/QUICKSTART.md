# Quick Start Guide

Get up and running with the Confidential Career Planning FHEVM example in under 5 minutes.

## Prerequisites

- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher
- **Git** (optional, for version control)

## Installation

```bash
# Navigate to project directory
cd CareerPlanningWithPapers

# Install dependencies
npm install

# Should complete in 30-60 seconds
```

## Compile Contracts

```bash
npm run compile
```

**Expected Output**:
```
Compiled 10 Solidity files successfully (evm target: paris)
```

## Run Tests

```bash
npm run test
```

**Expected Output**:
```
  CareerPlanningFHE - Comprehensive Test Suite
    ✓ Should deploy contract successfully
    ✓ Should submit career assessment with valid data
    ✓ Should calculate guidance scores correctly
    ✓ Should handle access control properly
    ...

  50 passing (2s)
```

## Deploy Locally

### Terminal 1: Start Local Network

```bash
npm run node
```

Keep this running. You'll see:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

### Terminal 2: Deploy Contract

```bash
npm run deploy:localhost
```

**Expected Output**:
```
Deploying CareerPlanningFHE...
✅ Deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## Explore the Code

### 1. View Main Contract

Open `contracts/CareerPlanningFHE.sol` in your editor:

```solidity
// Key features to notice:
- ebool and euint8 encrypted types
- FHE.select() for conditional logic
- FHE.add() for arithmetic on encrypted data
- Two-phase decryption pattern
```

### 2. Review Tests

Open `test/CareerPlanningFHE.test.js`:

```javascript
// Test patterns demonstrated:
- Deployment and initialization
- Submitting encrypted assessments
- Access control verification
- Multi-user scenarios
- Edge case handling
```

### 3. Check Documentation

```bash
# List all documentation files
ls docs/

# Key files:
HELLO_FHEVM_TUTORIAL.md   # Start here
BEGINNER_WALKTHROUGH.md   # Step-by-step guide
FHE_CONTRACT_GUIDE.md     # Deep dive
DEVELOPER_GUIDE.md        # Extension guide
```

## Generate New Examples

### Create Standalone Example

```bash
npm run create:example my-career-app ./output/my-app
cd output/my-app
npm install
npm run compile
npm run test
```

### Create Category Project

```bash
npm run create:category career-planning ./output/career-full
cd output/career-full
npm install
npm run compile
npm run test
```

## Generate Documentation

```bash
# Generate docs for main contract
npm run generate:docs CareerPlanningFHE

# Generate all documentation
npm run generate:all-docs

# View generated docs
ls docs/
```

## Common Commands

```bash
# Compilation
npm run compile              # Compile all contracts
npm run clean                # Clean build artifacts

# Testing
npm run test                 # Run all tests
npm run test:verbose         # Detailed test output
npm run test:coverage        # Code coverage report
npm run test:gas             # Gas usage analysis

# Deployment
npm run node                 # Start local network
npm run deploy:localhost     # Deploy to local network
npm run deploy:sepolia       # Deploy to Sepolia testnet

# Automation
npm run create:example       # Generate example repo
npm run create:category      # Generate category project
npm run generate:docs        # Auto-generate documentation

# Utilities
npm run help                 # List all commands
npm run help:examples        # Show example commands
npm run verify               # Run all checks
```

## Directory Structure

```
CareerPlanningWithPapers/
├── contracts/           # Solidity smart contracts
├── test/                # Test suites
├── scripts/             # Automation and deployment
├── docs/                # Documentation
├── base-template/       # Reusable template
├── hardhat.config.js    # Configuration
├── package.json         # Dependencies
└── README.md            # Project overview
```

## Next Steps

### For Beginners
1. ✅ Complete this Quick Start
2. 📖 Read [HELLO_FHEVM_TUTORIAL.md](HELLO_FHEVM_TUTORIAL.md)
3. 🚀 Follow [BEGINNER_WALKTHROUGH.md](BEGINNER_WALKTHROUGH.md)
4. 🧪 Experiment with tests
5. 🎨 Modify contracts

### For Developers
1. ✅ Complete Quick Start
2. 📖 Study [FHE_CONTRACT_GUIDE.md](FHE_CONTRACT_GUIDE.md)
3. 🔧 Read [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
4. 🏗️ Create new features
5. 🤝 Contribute (see [CONTRIBUTING.md](../CONTRIBUTING.md))

### For Reviewers
1. ✅ Complete Quick Start
2. 📊 Check [BOUNTY_COMPLETION_SUMMARY.md](../BOUNTY_COMPLETION_SUMMARY.md)
3. 🎯 Review [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
4. 📋 Verify [SUBMISSION_CHECKLIST.md](../SUBMISSION_CHECKLIST.md)

## Troubleshooting

### Issue: `npm install` fails

**Solution**: Check Node.js version
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v9.0.0 or higher
```

### Issue: Compilation errors

**Solution**: Clean and reinstall
```bash
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run compile
```

### Issue: Tests fail

**Solution**: Ensure local network is running
```bash
# Terminal 1
npm run node

# Terminal 2
npm run test
```

### Issue: Deployment fails

**Solution**: Check network configuration
```bash
# For local deployment, ensure node is running
npm run node  # Terminal 1

# For Sepolia deployment, check .env file
cp .env.example .env
# Edit .env with your RPC URL and private key
```

## Quick Reference

### Encrypted Types
- `ebool` - Encrypted boolean
- `euint8` - Encrypted 8-bit unsigned integer
- `euint32` - Encrypted 32-bit unsigned integer

### FHE Operations
- `FHE.select(condition, ifTrue, ifFalse)` - Conditional selection
- `FHE.add(a, b)` - Addition
- `FHE.asEuint8(value)` - Type conversion

### Permission Management
```solidity
FHE.allowThis(encryptedValue);        // Contract permission
FHE.allow(encryptedValue, user);      // User permission
```

### Two-Phase Decryption
```javascript
// Phase 1: Request
await contract.requestAssessmentResult(id);

// Phase 2: Retrieve (after processing)
const result = await contract.getDecryptedCareerGuidance(id);
```

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Zama Community](https://www.zama.ai/community)

## Support

- 📖 Check the documentation
- 🐛 Open an issue on GitHub
- 💬 Join Zama Discord
- 🌐 Visit Zama Community Forum

---

**Ready to build confidential applications? Start experimenting with the contracts!**
