#!/usr/bin/env node

/**
 * Create FHEVM Example Script
 *
 * Usage: node scripts/create-example.js <example-name> [output-dir]
 * Example: node scripts/create-example.js my-career-example ./examples/my-example
 *
 * This script generates a standalone FHEVM example repository by:
 * 1. Copying the current project as a base template
 * 2. Creating proper documentation
 * 3. Updating configuration files
 * 4. Setting up for standalone deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const args = process.argv.slice(2);
const exampleName = args[0];
const outputDir = args[1] || `./examples/${exampleName}`;
const baseDir = process.cwd();

// Validation
if (!exampleName) {
  console.error('❌ Error: Example name is required');
  console.error('Usage: node scripts/create-example.js <example-name> [output-dir]');
  console.error('Example: node scripts/create-example.js my-example ./output');
  process.exit(1);
}

// Convert example name to proper format
const exampleTitle = exampleName
  .split('-')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

const packageName = `fhevm-example-${exampleName}`;

console.log(`\n🚀 Creating FHEVM Example: ${exampleTitle}`);
console.log(`📁 Output Directory: ${outputDir}\n`);

try {
  // Step 1: Create output directory
  console.log('📂 Creating directory structure...');
  if (fs.existsSync(outputDir)) {
    console.warn(`⚠️  Directory ${outputDir} already exists. Skipping creation.`);
  } else {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Step 2: Copy essential files
  console.log('📋 Copying project files...');

  const filesToCopy = [
    'contracts',
    'test',
    'scripts/deploy.js',
    'hardhat.config.js',
    'tsconfig.json',
    'package.json'
  ];

  filesToCopy.forEach(file => {
    const source = path.join(baseDir, file);
    const destination = path.join(outputDir, file);

    if (fs.existsSync(source)) {
      if (fs.statSync(source).isDirectory()) {
        copyDirectory(source, destination);
      } else {
        fs.copyFileSync(source, destination);
      }
    }
  });

  // Step 3: Update package.json
  console.log('📦 Updating package.json...');
  const packageJsonPath = path.join(outputDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  packageJson.name = packageName;
  packageJson.description = `A privacy-preserving ${exampleTitle} FHEVM example`;
  packageJson.keywords = [
    'fhevm',
    'fhe',
    'privacy',
    exampleName,
    'blockchain',
    'encryption'
  ];

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // Step 4: Create README
  console.log('📖 Creating README.md...');
  const readme = `# ${exampleTitle} - FHEVM Example

A privacy-preserving ${exampleName} smart contract demonstrating Fully Homomorphic Encryption.

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to local network
npm run deploy:localhost

# Deploy to Sepolia testnet
npm run deploy:sepolia
\`\`\`

## Project Structure

\`\`\`
${exampleName}/
├── contracts/               # Smart contracts
│   ├── ${exampleTitle.replace(/ /g, '')}.sol
│   └── ...
├── test/                    # Test files
├── scripts/                 # Deployment scripts
├── hardhat.config.js        # Hardhat configuration
├── package.json             # Dependencies
└── README.md               # This file
\`\`\`

## Core Concepts

This example demonstrates:

- **Encrypted Data Types**: Using \`ebool\` and \`euint8\` for encrypted values
- **FHE Operations**: \`FHE.select()\` for conditional logic
- **FHE Arithmetic**: \`FHE.add()\` for calculations on encrypted data
- **Access Control**: Permission management for encrypted results
- **Privacy Preservation**: Complete confidentiality of sensitive data

## Testing

\`\`\`bash
# Run all tests
npm run test

# Run with coverage
npm run coverage

# Run with gas reporting
REPORT_GAS=true npm run test
\`\`\`

## Deployment

### Local Network

\`\`\`bash
# Terminal 1: Start Hardhat node
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

- **Getting Started**: See HELLO_FHEVM_TUTORIAL.md
- **Technical Details**: See FHE_CONTRACT_GUIDE.md
- **Extension Guide**: See DEVELOPER_GUIDE.md

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)

## License

BSD-3-Clause-Clear License

---

**Built with FHEVM by Zama**
`;

  fs.writeFileSync(path.join(outputDir, 'README.md'), readme);

  // Step 5: Create environment file
  console.log('⚙️  Creating .env.example...');
  const envExample = `# Network Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here

# Contract Configuration
CONTRACT_NAME=${exampleTitle.replace(/ /g, '')}

# Testing
REPORT_GAS=false
`;

  fs.writeFileSync(path.join(outputDir, '.env.example'), envExample);

  // Step 6: Create GitHub files
  console.log('🔧 Creating GitHub configuration files...');

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
`;

  fs.writeFileSync(path.join(outputDir, '.gitignore'), gitignore);

  // Step 7: Initialize git (optional)
  console.log('📚 Setting up git repository...');
  try {
    execSync('git init', { cwd: outputDir, stdio: 'pipe' });
    execSync('git add .', { cwd: outputDir, stdio: 'pipe' });
  } catch (error) {
    // Git might not be available, that's okay
  }

  // Success message
  console.log(`\n✅ Successfully created ${exampleTitle} FHEVM example!\n`);
  console.log(`📦 Next steps:\n`);
  console.log(`  1. Navigate to the project:`);
  console.log(`     cd ${outputDir}\n`);
  console.log(`  2. Install dependencies:`);
  console.log(`     npm install\n`);
  console.log(`  3. Compile contracts:`);
  console.log(`     npm run compile\n`);
  console.log(`  4. Run tests:`);
  console.log(`     npm run test\n`);
  console.log(`  5. Deploy locally:`);
  console.log(`     npm run node          # Terminal 1`);
  console.log(`     npm run deploy:localhost   # Terminal 2\n`);

} catch (error) {
  console.error(`\n❌ Error creating example: ${error.message}\n`);
  process.exit(1);
}

/**
 * Recursively copy a directory
 */
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);

  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    // Skip node_modules and other large directories
    if (file === 'node_modules' || file === '.git' || file === '.gitignore') {
      return;
    }

    if (fs.statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}
