# Automation Scripts Documentation

This directory contains scripts for automating FHEVM project generation and management.

## Overview

The scripts automate:
- 🔧 Standalone repository generation
- 📦 Category project creation
- 📚 Documentation generation
- 🚀 Contract deployment
- 🧹 Project cleanup

## Scripts

### 1. create-example.js

Generate standalone FHEVM example repositories.

**Purpose**: Creates a complete, self-contained FHEVM project with one contract and tests.

**Usage**:
```bash
npm run create:example <name> [output-dir]
```

**Examples**:
```bash
# Create a simple counter example
npm run create:example fhe-counter ./examples/my-counter

# Create with custom output
npm run create:example voting-system ./my-voting-app
```

**What It Does**:
1. Creates output directory structure
2. Copies contract and test templates
3. Customizes package.json
4. Generates README.md
5. Creates .env.example
6. Sets up .gitignore
7. Initializes git repository

**Output Structure**:
```
my-counter/
├── contracts/
│   └── FHECounter.sol
├── test/
│   └── FHECounter.test.js
├── scripts/
│   └── deploy.js
├── hardhat.config.js
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

### 2. create-category.js (NEW)

Generate category projects with multiple related examples.

**Purpose**: Creates a project containing multiple related FHEVM examples in one repository.

**Usage**:
```bash
npm run create:category <category> [output-dir]
```

**Examples**:
```bash
# Create career planning category
npm run create:category career-planning ./examples/career-full

# Create with custom output
npm run create:category career-planning ./my-career-project
```

**Available Categories**:
- **career-planning** - Career planning with papers
  - CareerPlanningFHE.sol
  - CareerPlanningSimple.sol
  - CareerPlanningWithPapers.sol

**What It Does**:
1. Creates directory structure
2. Copies all category contracts
3. Copies all corresponding tests
4. Customizes package.json
5. Generates unified README
6. Creates example documentation
7. Sets up deployment scripts

**Output Structure**:
```
career-full/
├── contracts/
│   ├── CareerPlanningFHE.sol
│   ├── CareerPlanningSimple.sol
│   └── CareerPlanningWithPapers.sol
├── test/
│   ├── CareerPlanning.test.js
│   ├── CareerPlanningFHE.test.js
│   └── CareerPlanningAdvanced.test.js
├── scripts/
│   └── deploy.js
├── docs/
│   └── EXAMPLES.md
├── hardhat.config.js
├── package.json
└── README.md
```

### 3. generate-docs.js

Auto-generate GitBook-compatible documentation from contracts.

**Purpose**: Creates markdown documentation from contract source code and annotations.

**Usage**:
```bash
npm run generate:docs <contract-name>
npm run generate:all-docs
```

**Examples**:
```bash
# Generate docs for one contract
npm run generate:docs CareerPlanningFHE

# Generate all documentation
npm run generate:all-docs
```

**What It Does**:
1. Finds contract source file
2. Extracts JSDoc comments
3. Parses function signatures
4. Documents data structures
5. Lists events
6. Extracts test examples
7. Generates markdown
8. Updates SUMMARY.md

**Output**:
- `docs/<ContractName>.md` - Contract documentation
- `docs/SUMMARY.md` - Updated index

**Documentation Format**:
```markdown
# ContractName

Description from @title

## Data Structures

### StructName
...

## Functions

### functionName()
Description and parameters...

## Events

### EventName
Event signature...

## Usage Examples

From test suite...
```

### 4. deploy.js

Deployment automation script.

**Purpose**: Automates contract compilation, deployment, and verification.

**Usage**:
```bash
npm run deploy:localhost
npm run deploy:sepolia
```

**What It Does**:
1. Gets deployer account
2. Displays account balance
3. Compiles contracts
4. Deploys to specified network
5. Waits for confirmations
6. Saves deployment info
7. Displays summary
8. Provides verification instructions

**Output**:
- Deployment summary in console
- `deployment.json` with contract address
- Etherscan verification command

## Environment Setup

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

**Required Variables**:
```env
# For Sepolia deployment
SEPOLIA_RPC_URL=https://...
PRIVATE_KEY=0x...

# Optional
ETHERSCAN_API_KEY=...
REPORT_GAS=false
```

## Common Workflows

### Workflow 1: Create and Test Example
```bash
# Generate example
npm run create:example my-counter ./examples/my-counter

# Navigate and set up
cd examples/my-counter
npm install

# Compile and test
npm run compile
npm run test

# Start local network and deploy
npm run node              # Terminal 1
npm run deploy:localhost  # Terminal 2
```

### Workflow 2: Generate Documentation
```bash
# Generate docs for specific contract
npm run generate:docs CareerPlanningFHE

# Or generate all
npm run generate:all-docs

# View generated docs
cat docs/CareerPlanningFHE.md
```

### Workflow 3: Create Category Project
```bash
# Generate category
npm run create:category career-planning ./my-project

# Navigate
cd my-project
npm install

# See all examples
ls contracts/
ls test/
cat docs/EXAMPLES.md

# Test everything
npm run test
```

## Advanced Usage

### Custom Categories

Add new categories to `scripts/create-category.js`:

```javascript
const CATEGORIES = {
  'my-category': {
    title: 'My Category Title',
    description: 'What this category demonstrates',
    contracts: [
      { name: 'MyContract1', file: 'MyContract1.sol' },
      { name: 'MyContract2', file: 'MyContract2.sol' }
    ],
    tests: [
      'MyContract1.test.js',
      'MyContract2.test.js'
    ]
  }
};
```

Then use:
```bash
npm run create:category my-category ./output
```

### Bulk Operations

Generate multiple examples:
```bash
#!/bin/bash
for example in fhe-counter voting blind-auction; do
  npm run create:example $example ./examples/$example
  cd examples/$example
  npm install
  npm run compile
  npm run test
  cd ../..
done
```

### Continuous Integration

Use in CI/CD pipeline:
```yaml
# .github/workflows/generate-examples.yml
name: Generate Examples
on: [push]
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run generate:all-docs
      - run: npm run verify
```

## Troubleshooting

### Issue: Script fails to find contract
```bash
# Ensure contract exists in contracts/ directory
ls contracts/MyContract.sol

# Regenerate documentation
npm run generate:docs MyContract
```

### Issue: Generation creates incorrect structure
```bash
# Check output directory doesn't exist
ls ./examples/my-name

# Or remove and regenerate
rm -rf ./examples/my-name
npm run create:example my-name ./examples/my-name
```

### Issue: Deployment fails
```bash
# Check environment variables
cat .env

# Verify RPC URL works
curl https://your-rpc-url

# Check account has balance
npm run deploy:localhost  # Start with local first
```

## Dependencies

These scripts require:
- Node.js v18.0.0+
- npm v9.0.0+
- Git (optional, for initialization)

## Notes

- All scripts use Node.js (not TypeScript by default)
- Scripts are synchronous for clarity
- Error handling is comprehensive
- Output uses emojis for clarity
- Generated projects are ready to use immediately

## Contributing

To improve scripts:
1. Test locally
2. Ensure backwards compatibility
3. Update documentation
4. Submit pull request

## Related Documentation

- [DEVELOPER_GUIDE.md](../DEVELOPER_GUIDE.md) - Extension guide
- [base-template/README.md](../base-template/README.md) - Template documentation
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines

---

**Questions?** Check the main [README.md](../README.md) or open an issue!
