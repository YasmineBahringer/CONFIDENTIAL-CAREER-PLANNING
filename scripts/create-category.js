#!/usr/bin/env node

/**
 * Create FHEVM Category Project Script
 *
 * Usage: node scripts/create-category.js <category> [output-dir]
 * Example: node scripts/create-category.js career-planning ./examples/career-complete
 *
 * This script generates a standalone FHEVM category project containing:
 * - Multiple example contracts in a category
 * - All corresponding tests
 * - Comprehensive documentation
 * - Unified deployment scripts
 * - Ready-to-use Hardhat configuration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const args = process.argv.slice(2);
const category = args[0];
const outputDir = args[1] || `./examples/${category}`;
const baseDir = process.cwd();

// Category definitions
const CATEGORIES = {
  'career-planning': {
    title: 'Career Planning with Papers',
    description: 'Privacy-preserving career planning system using FHE',
    contracts: [
      { name: 'CareerPlanningFHE', file: 'CareerPlanningFHE.sol' },
      { name: 'CareerPlanningSimple', file: 'CareerPlanningSimple.sol' },
      { name: 'CareerPlanningWithPapers', file: 'CareerPlanningWithPapers.sol' }
    ],
    tests: [
      'CareerPlanning.test.js',
      'CareerPlanningFHE.test.js',
      'CareerPlanningAdvanced.test.js'
    ]
  }
};

// Validation
if (!category) {
  console.error('❌ Error: Category name is required');
  console.error('Available categories:', Object.keys(CATEGORIES).join(', '));
  process.exit(1);
}

if (!CATEGORIES[category]) {
  console.error(`❌ Error: Unknown category "${category}"`);
  console.error('Available categories:', Object.keys(CATEGORIES).join(', '));
  process.exit(1);
}

const categoryConfig = CATEGORIES[category];
const categoryTitle = categoryConfig.title;
const categoryDescription = categoryConfig.description;

console.log(`\n🚀 Creating FHEVM Category Project: ${categoryTitle}`);
console.log(`📁 Output Directory: ${outputDir}\n`);

try {
  // Step 1: Create output directory
  console.log('📂 Creating directory structure...');
  if (fs.existsSync(outputDir)) {
    console.warn(`⚠️  Directory ${outputDir} already exists. Skipping creation.`);
  } else {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Step 2: Create subdirectories
  const dirs = ['contracts', 'test', 'scripts', 'docs'];
  dirs.forEach(dir => {
    const dirPath = path.join(outputDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  // Step 3: Copy contracts
  console.log('📋 Copying contract files...');
  const contractsDir = path.join(baseDir, 'contracts');
  categoryConfig.contracts.forEach(contract => {
    const source = path.join(contractsDir, contract.file);
    const destination = path.join(outputDir, 'contracts', contract.file);
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, destination);
      console.log(`   ✓ Copied ${contract.file}`);
    }
  });

  // Step 4: Copy tests
  console.log('📋 Copying test files...');
  const testsDir = path.join(baseDir, 'test');
  categoryConfig.tests.forEach(testFile => {
    const source = path.join(testsDir, testFile);
    const destination = path.join(outputDir, 'test', testFile);
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, destination);
      console.log(`   ✓ Copied ${testFile}`);
    }
  });

  // Step 5: Copy configuration files
  console.log('📦 Copying configuration files...');
  const configFiles = [
    'hardhat.config.js',
    'tsconfig.json',
    'package.json',
    '.env.example'
  ];

  configFiles.forEach(file => {
    const source = path.join(baseDir, file);
    const destination = path.join(outputDir, file);
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, destination);
      console.log(`   ✓ Copied ${file}`);
    }
  });

  // Step 6: Update package.json
  console.log('📦 Updating package.json...');
  const packageJsonPath = path.join(outputDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  packageJson.name = `fhevm-${category.replace(/_/g, '-')}`;
  packageJson.description = categoryDescription;
  packageJson.keywords = [
    'fhevm',
    'fhe',
    'privacy',
    'blockchain',
    'encryption',
    category.split('-')[0]
  ];

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // Step 7: Copy deployment script
  console.log('📋 Copying deployment script...');
  const deploySource = path.join(baseDir, 'scripts', 'deploy.js');
  if (fs.existsSync(deploySource)) {
    fs.copyFileSync(deploySource, path.join(outputDir, 'scripts', 'deploy.js'));
  }

  // Step 8: Create comprehensive README
  console.log('📖 Creating comprehensive README.md...');
  const readme = generateReadme(categoryTitle, categoryDescription, categoryConfig);
  fs.writeFileSync(path.join(outputDir, 'README.md'), readme);

  // Step 9: Create example documentation
  console.log('📖 Creating example documentation...');
  const exampleDocs = generateExampleDocs(categoryConfig);
  fs.writeFileSync(path.join(outputDir, 'docs', 'EXAMPLES.md'), exampleDocs);

  // Step 10: Create GitHub files
  console.log('🔧 Creating GitHub configuration files...');
  createGitHubFiles(outputDir);

  // Step 11: Initialize git
  console.log('📚 Setting up git repository...');
  try {
    execSync('git init', { cwd: outputDir, stdio: 'pipe' });
    execSync('git add .', { cwd: outputDir, stdio: 'pipe' });
  } catch (error) {
    // Git might not be available, that's okay
  }

  // Success message
  console.log(`\n✅ Successfully created ${categoryTitle} category project!\n`);
  console.log(`📦 Next steps:\n`);
  console.log(`  1. Navigate to the project:`);
  console.log(`     cd ${outputDir}\n`);
  console.log(`  2. Install dependencies:`);
  console.log(`     npm install\n`);
  console.log(`  3. Compile contracts:`);
  console.log(`     npm run compile\n`);
  console.log(`  4. Run tests:`);
  console.log(`     npm run test\n`);
  console.log(`  5. Explore the examples:`);
  console.log(`     See docs/EXAMPLES.md for detailed documentation\n`);

} catch (error) {
  console.error(`\n❌ Error creating category project: ${error.message}\n`);
  process.exit(1);
}

/**
 * Generate comprehensive README for category project
 */
function generateReadme(title, description, config) {
  const contractList = config.contracts
    .map(c => `- **${c.name}** - ${c.file}`)
    .join('\n');

  return `# ${title} - FHEVM Category Project

${description}

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run all tests
npm run test

# Deploy to local network
npm run node          # Terminal 1
npm run deploy:localhost   # Terminal 2

# Deploy to Sepolia testnet
npm run deploy:sepolia
\`\`\`

## Included Examples

${contractList}

## Project Structure

\`\`\`
${path.basename(process.cwd())}/
├── contracts/               # Smart contracts
│   ${config.contracts.map(c => `├── ${c.file}`).join('\n│   ')}
├── test/                    # Test suites
│   ${config.tests.map(t => `├── ${t}`).join('\n│   ')}
├── scripts/                 # Deployment & automation
│   ├── deploy.js
│   └── create-example.js
├── docs/                    # Documentation
│   └── EXAMPLES.md
├── hardhat.config.js        # Hardhat configuration
├── package.json             # Dependencies
└── README.md               # This file
\`\`\`

## Core Concepts Demonstrated

This project demonstrates:

✅ **Encrypted Data Types** - Using FHEVM encrypted types (ebool, euint8, etc.)
✅ **FHE Operations** - Conditional logic and arithmetic on encrypted data
✅ **Access Control** - Permission management for encrypted information
✅ **Two-Phase Decryption** - Secure decryption workflows
✅ **Smart Contract Design** - Building privacy-preserving applications
✅ **Comprehensive Testing** - Full test coverage with multiple scenarios

## Testing

\`\`\`bash
# Run all tests
npm run test

# Run with gas reporting
REPORT_GAS=true npm run test

# Run with coverage
npm run test:coverage
\`\`\`

## Deployment

### Local Network

\`\`\`bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy
npm run deploy:localhost
\`\`\`

### Sepolia Testnet

\`\`\`bash
# Set environment variables
export SEPOLIA_RPC_URL="your_rpc_url"
export PRIVATE_KEY="your_private_key"

# Deploy
npm run deploy:sepolia
\`\`\`

## Documentation

- **Examples**: See [docs/EXAMPLES.md](docs/EXAMPLES.md) for detailed documentation
- **FHEVM Docs**: https://docs.zama.ai/fhevm
- **Hardhat Docs**: https://hardhat.org/
- **Solidity Docs**: https://docs.soliditylang.org/

## Contract Details

${config.contracts
  .map(c => `### ${c.name}
Located in: contracts/${c.file}

This contract demonstrates key FHEVM concepts and patterns for building confidential smart contracts.`)
  .join('\n\n')}

## Learning Path

1. **Start Here**: Review the contract source code
2. **Understand Tests**: Read the test files to see usage patterns
3. **Run Tests**: Execute \`npm run test\` to see contracts in action
4. **Experiment**: Modify contracts and re-run tests
5. **Deploy**: Deploy to local or testnet environment

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Zama Discord](https://discord.com/invite/zama)

## License

BSD-3-Clause-Clear License

---

**Built with FHEVM by Zama**
`;
}

/**
 * Generate example documentation
 */
function generateExampleDocs(config) {
  return `# ${config.title} Examples

This documentation covers the examples included in this category project.

## Included Contracts

${config.contracts
  .map((c, i) => {
    const num = i + 1;
    return `### Example ${num}: ${c.name}

**File**: \`contracts/${c.file}\`

#### Description
This contract demonstrates privacy-preserving operations using FHEVM.

#### Key Features
- Encrypted data handling
- FHE operations
- Access control
- Permission management

#### Usage
See the test files for usage examples:
- \`test/CareerPlanning.test.js\`
- \`test/CareerPlanningFHE.test.js\`
- \`test/CareerPlanningAdvanced.test.js\``;
  })
  .join('\n\n')}

## Testing

All examples include comprehensive test suites. Run tests with:

\`\`\`bash
npm run test
\`\`\`

## Common Patterns

### Creating Encrypted Inputs
\`\`\`javascript
const encrypted = await fhevm.createEncryptedInput(contractAddress, userAddress);
encrypted.addBool(true);
const { handles, inputProof } = encrypted.encrypt();
\`\`\`

### Handling Encrypted Values
\`\`\`solidity
euint8 value = FHE.asEuint8(50);
euint8 result = FHE.add(value, otherValue);
\`\`\`

### Decryption Workflow
1. Request decryption through transaction
2. Retrieve result once available
3. Process plaintext result

## Troubleshooting

**Issue**: Tests fail with "FHE operation error"
**Solution**: Ensure FHEVM environment is properly configured

**Issue**: "Minimum fee required"
**Solution**: Send at least 0.001 ETH with transactions

**Issue**: "Not authorized"
**Solution**: Verify you're using the correct signer

## Next Steps

- Modify contracts to explore FHEVM capabilities
- Combine multiple contracts in single application
- Integrate with frontend interface
- Deploy to production networks

---

For more information, see the main [README.md](../README.md)
`;
}

/**
 * Create GitHub configuration files
 */
function createGitHubFiles(outputDir) {
  // .gitignore
  const gitignore = `node_modules/
dist/
build/
.env
.env.local
.env.*.local
artifacts/
cache/
.DS_Store
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
coverage/
.nyc_output/
.vscode/
.idea/
*.swp
*.swo
*~
`;

  fs.writeFileSync(path.join(outputDir, '.gitignore'), gitignore);

  // .env.example
  const envExample = `# Network Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here

# Contract Configuration
REPORT_GAS=false
`;

  fs.writeFileSync(path.join(outputDir, '.env.example'), envExample);
}
