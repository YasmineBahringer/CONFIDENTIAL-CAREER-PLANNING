# FHEVM Examples Directory

This directory contains generated standalone FHEVM example projects created using the automation scripts.

## What Goes Here

When you run the automation scripts, standalone example projects are generated in this directory:

```bash
# Generate a standalone example
npm run create:example my-counter ./examples/my-counter

# Generate a category project
npm run create:category career-planning ./examples/career-planning-full
```

## Directory Structure

After generating examples, you'll see:

```
examples/
├── my-counter/
│   ├── contracts/
│   ├── test/
│   ├── scripts/
│   ├── hardhat.config.js
│   ├── package.json
│   └── README.md
│
└── career-planning-full/
    ├── contracts/
    ├── test/
    ├── scripts/
    ├── docs/
    ├── hardhat.config.js
    ├── package.json
    └── README.md
```

## Using Generated Examples

Each generated example is a complete, standalone project:

```bash
# Navigate to generated example
cd examples/my-counter

# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy
npm run node          # Terminal 1
npm run deploy:localhost  # Terminal 2
```

## Customizing Examples

Generated examples can be freely modified:

1. **Edit contracts** in `contracts/`
2. **Update tests** in `test/`
3. **Modify deployment** in `scripts/deploy.js`
4. **Change configuration** in `hardhat.config.js`

## Generating New Examples

### Option 1: Single Example

```bash
npm run create:example <name> ./examples/<name>
```

Creates a standalone repository with:
- One main contract
- Corresponding tests
- Deployment scripts
- Documentation

### Option 2: Category Project

```bash
npm run create:category <category> ./examples/<category>
```

Creates a project with multiple related examples:
- All contracts in the category
- All corresponding tests
- Unified deployment
- Comprehensive documentation

## Available Categories

Current categories defined in `scripts/create-category.js`:

- **career-planning** - Career planning with paper integration
  - CareerPlanningFHE
  - CareerPlanningSimple
  - CareerPlanningWithPapers

## Adding New Categories

To add new categories, edit `scripts/create-category.js`:

```javascript
const CATEGORIES = {
  'my-category': {
    title: 'My Category Title',
    description: 'Category description',
    contracts: [
      { name: 'Contract1', file: 'Contract1.sol' },
      { name: 'Contract2', file: 'Contract2.sol' }
    ],
    tests: ['test1.js', 'test2.js']
  }
};
```

## Example Workflows

### Workflow 1: Learn from Example
```bash
# Generate example
npm run create:example fhe-counter ./examples/learn-counter

# Navigate and explore
cd examples/learn-counter

# Run tests to see it work
npm install && npm run test

# Modify and experiment
# Edit contracts/FHECounter.sol
npm run compile && npm run test
```

### Workflow 2: Build New Feature
```bash
# Generate base project
npm run create:category career-planning ./examples/my-project

# Customize contracts
cd examples/my-project
# Edit contracts to add your feature

# Test your changes
npm run test

# Deploy when ready
npm run node
npm run deploy:localhost
```

### Workflow 3: Create Tutorial
```bash
# Generate clean example
npm run create:example tutorial-counter ./examples/tutorial

# Document step-by-step
cd examples/tutorial
# Edit README.md with tutorial content
# Add comments to contracts/
# Create detailed test cases

# Share with others
git init
git add .
git commit -m "Add FHE counter tutorial"
```

## Best Practices

### When Generating Examples
- ✅ Use descriptive names (fhe-voting, blind-auction)
- ✅ Keep examples focused on one concept
- ✅ Generate to a clean directory
- ✅ Review generated README.md

### When Customizing
- ✅ Run tests after changes
- ✅ Update documentation
- ✅ Keep changes minimal and focused
- ✅ Test on local network first

### When Sharing
- ✅ Remove `node_modules/`
- ✅ Include `.env.example`
- ✅ Test `npm install` works
- ✅ Verify tests pass
- ✅ Update README with instructions

## Troubleshooting

### Issue: Generation fails
```bash
# Ensure scripts are executable
chmod +x scripts/*.js

# Check Node version
node --version  # Should be v18+
```

### Issue: Generated example won't compile
```bash
# Clean and reinstall
cd examples/your-example
rm -rf node_modules package-lock.json
npm install
npm run compile
```

### Issue: Tests fail in generated example
```bash
# Ensure contracts compiled
npm run compile

# Run with verbose output
npm run test -- --verbose
```

## Documentation

For more information:
- **Automation Guide**: See `scripts/README.md`
- **Developer Guide**: See `DEVELOPER_GUIDE.md`
- **Base Template**: See `base-template/README.md`

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)

---

**Ready to create examples?** Run `npm run help:examples` to see all commands!
