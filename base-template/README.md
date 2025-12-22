# FHEVM Career Planning Base Template

This is the base template for creating standalone FHEVM examples demonstrating privacy-preserving career planning with research paper integration.

## What is this?

This directory serves as the foundation for generating standalone FHEVM example repositories. It contains:

- Complete Hardhat configuration for FHEVM development
- Example contracts demonstrating FHE operations
- Comprehensive test suites
- Deployment scripts
- Documentation templates

## How to Use

### Option 1: Use Automation Scripts (Recommended)

```bash
# Generate a standalone example
node scripts/create-example.js career-planning ./output/my-example

# Generate a category project with multiple examples
node scripts/create-category.js career-planning ./output/my-category
```

### Option 2: Manual Clone

```bash
# Clone this template
cp -r base-template my-fhevm-project
cd my-fhevm-project

# Install dependencies
npm install

# Compile and test
npm run compile
npm run test
```

## Structure

```
base-template/
├── contracts/               # Smart contract templates
│   ├── CareerPlanningFHE.sol
│   ├── CareerPlanningSimple.sol
│   └── CareerPlanningWithPapers.sol
├── test/                    # Test templates
│   ├── CareerPlanning.test.js
│   ├── CareerPlanningFHE.test.js
│   └── CareerPlanningAdvanced.test.js
├── scripts/                 # Deployment scripts
│   └── deploy.js
├── hardhat.config.js        # Hardhat configuration
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
└── README.md               # This file
```

## Customization

When creating a new example, you typically:

1. Modify contract files in `contracts/`
2. Update test files in `test/`
3. Adjust deployment scripts in `scripts/`
4. Update `package.json` with new name and description
5. Generate new documentation

## Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Hardhat**: v2.17.0 or higher

## Quick Commands

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Run local network
npm run node

# Deploy to local network
npm run deploy:localhost

# Deploy to Sepolia testnet
npm run deploy:sepolia

# Clean build artifacts
npm run clean
```

## Documentation

- **Getting Started**: See parent directory's README.md
- **FHEVM Docs**: https://docs.zama.ai/fhevm
- **Hardhat Docs**: https://hardhat.org/

## Key Features

### Encrypted Data Types

The template demonstrates working with FHEVM encrypted types:
- `ebool` - Encrypted boolean
- `euint8` - Encrypted 8-bit unsigned integer
- `euint32` - Encrypted 32-bit unsigned integer

### FHE Operations

Examples of FHE operations included:
- `FHE.select()` - Conditional selection
- `FHE.add()` - Addition
- `FHE.sub()` - Subtraction
- `FHE.asEuint8()` - Type conversion

### Access Control

Proper permission management patterns:
- `FHE.allowThis()` - Grant contract permissions
- `FHE.allow()` - Grant user permissions

### Decryption Patterns

Two-phase decryption workflow:
1. Request decryption
2. Retrieve result

## Extending the Template

### Adding New Contracts

1. Create contract in `contracts/`
2. Create corresponding test in `test/`
3. Update deployment script
4. Update documentation

### Modifying Configuration

- **Network settings**: Edit `hardhat.config.js`
- **Dependencies**: Update `package.json`
- **TypeScript config**: Modify `tsconfig.json`

## Testing Patterns

The template includes comprehensive testing patterns:

- ✅ Deployment verification
- ✅ Function behavior tests
- ✅ Access control tests
- ✅ Edge case handling
- ✅ Gas consumption analysis
- ✅ Multi-user scenarios

## License

BSD-3-Clause-Clear License

---

**Part of the FHEVM Examples Hub by Zama**
