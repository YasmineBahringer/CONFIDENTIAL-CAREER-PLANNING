# Maintenance Guide

Guide for maintaining and updating the FHEVM examples hub when dependencies change.

## Overview

As the FHEVM ecosystem evolves, dependencies require updates. This guide ensures smooth maintenance.

## Version Management

### Current Versions

**Core Dependencies**:
- `@fhevm/solidity`: ^0.9.0
- `@fhevm/hardhat-plugin`: ^0.3.0
- `hardhat`: ^2.17.0
- `ethers`: ^6.7.0
- `node`: >=18.0.0

### Checking for Updates

```bash
# Check outdated packages
npm outdated

# Check specific package
npm view @fhevm/solidity versions
npm view hardhat versions
```

## Dependency Updates

### Minor/Patch Updates (0.9.x → 0.9.y)

Usually safe, non-breaking:

```bash
# Update all packages
npm update

# Or specific package
npm install @fhevm/solidity@latest

# Verify no breaks
npm run compile
npm run test
```

### Major Updates (0.9.x → 1.0.0)

Requires thorough testing:

```bash
# 1. Backup current state
git commit -m "Backup before major version update"

# 2. Update package.json manually
# Change: "@fhevm/solidity": "^1.0.0"

# 3. Install new version
npm install

# 4. Run full verification
npm run compile
npm run test:coverage
npm run verify

# 5. If fails, check FHEVM changelog
# Link: https://github.com/zama-ai/fhevm

# 6. Update examples as needed
# Review breaking changes
# Update contracts if necessary

# 7. Commit if successful
git commit -m "Update to @fhevm/solidity@1.0.0"
```

## Solidity Version Updates

When `@fhevm/solidity` changes required Solidity version:

### Update Compiler Version

Edit `hardhat.config.js`:

```javascript
solidity: {
  version: "0.8.25",  // Update this
  settings: { ... }
}
```

### Update All Contracts

```solidity
// From:
pragma solidity ^0.8.24;

// To:
pragma solidity ^0.8.25;
```

### Test Everything

```bash
npm run clean
npm run compile
npm run test
npm run lint
```

## Node.js Version Updates

When Node.js LTS updates:

### Update package.json

```json
{
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

### Update CI/CD

```bash
# .github/workflows/test.yml
- uses: actions/setup-node@v3
  with:
    node-version: '20'
```

### Test Locally

```bash
# Check version
node --version

# Should be >= 20.0.0
```

## Breaking Changes

### Detecting Breaking Changes

Watch for:
- API changes in `@fhevm/solidity`
- New function requirements
- Changed error messages
- Modified type definitions
- Removed features

### Fixing Breaking Changes

**FHE.sol API Changes**:
- Check [FHEVM docs](https://docs.zama.ai/fhevm)
- Review [GitHub releases](https://github.com/zama-ai/fhevm)
- Update contract imports
- Update function calls

**Example**: If FHE.select() changes to FHE.choose():

```solidity
// Old (0.9.0):
result = FHE.select(condition, ifTrue, ifFalse);

// New (1.0.0):
result = FHE.choose(condition, ifTrue, ifFalse);
```

Fix all contracts:
```bash
# Find all occurrences
grep -r "FHE.select" contracts/

# Update each file
# Test changes
npm run test
```

## Documentation Updates

When updating versions, update docs:

### Update README

```markdown
## Requirements

- **Node.js**: v20.0.0 or higher
- **@fhevm/solidity**: ^1.0.0
- **Hardhat**: ^2.18.0
```

### Update Installation Guide

```bash
# Installation steps in docs/INSTALLATION.md
npm install  # Installs @fhevm/solidity@^1.0.0
```

### Update API Reference

Check if API changes affect:
- Function signatures
- Return types
- Error handling
- Permission management

Update `docs/api-reference.md` if needed.

### Update Examples

Edit example contracts if APIs changed:
```bash
# base-template/contracts/FHECounter.sol
# Verify still works with new version
npm run compile
```

## Testing Updates

### Comprehensive Testing

After any dependency update:

```bash
# 1. Clean installation
rm -rf node_modules package-lock.json
npm install

# 2. Compile all contracts
npm run compile

# 3. Run all tests
npm run test

# 4. Check coverage
npm run test:coverage

# 5. Run linting
npm run lint

# 6. Test generation
npm run create:example test-example ./test-output
cd test-output
npm install
npm run compile
npm run test
cd ..

# 7. Verify docs generation
npm run generate:all-docs
```

### Regression Testing

Create test for common patterns:

```javascript
// test/regressions.test.js
describe("Regression Tests", function() {
  it("Should use updated FHE API correctly", async function() {
    // Test key patterns from examples
  });
});
```

## Update Checklist

When updating dependencies:

- [ ] Backup current state (git commit)
- [ ] Update package.json versions
- [ ] Run `npm install`
- [ ] Compile all contracts
- [ ] Run test suite
- [ ] Check test coverage
- [ ] Regenerate documentation
- [ ] Test example generation
- [ ] Review changelog for breaking changes
- [ ] Update docs if needed
- [ ] Commit changes with message
- [ ] Tag release version

## Common Update Scenarios

### Scenario 1: FHEVM Minor Update (0.9.0 → 0.9.1)

```bash
# Update in package.json
# "@fhevm/solidity": "^0.9.1"

npm install
npm run compile
npm run test

# Should pass without changes
git commit -m "Update @fhevm/solidity to 0.9.1"
```

### Scenario 2: Node.js LTS Update (18 → 20)

```bash
# 1. Install new Node.js version
# Using nvm: nvm install 20

# 2. Test with new version
node --version  # Should be 20.x.x
npm install
npm run compile
npm run test

# 3. Update package.json and CI
# Update engines and workflows

git commit -m "Update Node.js requirement to 20 LTS"
```

### Scenario 3: Major FHE Update with Breaking Changes

```bash
# 1. Research changes
# Read: https://github.com/zama-ai/fhevm/releases/v1.0.0

# 2. Create branch
git checkout -b update/fhevm-1.0

# 3. Update version
# "@fhevm/solidity": "^1.0.0"

npm install

# 4. Fix breaking changes
# Update contracts as needed
# Common: FHE.select → FHE.choose

# 5. Test thoroughly
npm run compile
npm run test
npm run test:coverage

# 6. Update documentation
# Edit docs/MIGRATION.md
# Update api-reference.md

# 7. Commit
git commit -m "Update to @fhevm/solidity@1.0.0

Breaking changes:
- FHE.select renamed to FHE.choose
- euint256 renamed to euint512
- etc.

See MIGRATION.md for details"

# 8. Create pull request
git push origin update/fhevm-1.0
# Then open PR on GitHub
```

## Emergency Rollback

If update breaks things severely:

```bash
# Revert to last known-good
git revert HEAD

# Or reset to tag
git reset --hard v1.0.0

# Verify working again
npm install
npm run test

# Plan proper update
```

## Monitoring

### Subscribe to Updates

- GitHub Releases: Star repository, enable notifications
- FHEVM Discord: Join development channel
- Twitter: Follow @zama_fhe
- NPM: Check @fhevm/solidity page

### Update Frequency

Recommended schedule:
- Check for updates: Monthly
- Minor updates: Apply within 2 weeks
- Major updates: Plan, test, apply
- Security fixes: Apply ASAP

## Documentation

### Create Migration Guide

When major version requires changes:

```markdown
# Migration Guide v0.9 → v1.0

## Breaking Changes

### FHE API Changes
- Old: `FHE.select(...)`
- New: `FHE.choose(...)`

## Update Steps

1. Update package.json
2. Run npm install
3. Update all FHE.select calls
4. Test contracts
5. Verify tests pass

## Troubleshooting
...
```

## Contact & Support

- **FHEVM GitHub**: https://github.com/zama-ai/fhevm
- **Zama Discord**: https://discord.com/invite/zama
- **Issue Tracker**: GitHub Issues
- **Docs**: https://docs.zama.ai/fhevm

---

**Last Updated**: December 2025
**Maintained by**: Zama Team

For specific update issues, open an issue or contact the team!
