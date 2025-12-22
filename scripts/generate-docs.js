#!/usr/bin/env node

/**
 * Documentation Generation Script
 *
 * Usage: node scripts/generate-docs.js [contract-name]
 * Example: node scripts/generate-docs.js CareerPlanningFHE
 *
 * This script generates GitBook-compatible documentation from:
 * - Smart contract source code
 * - Test files
 * - Code comments and annotations
 */

const fs = require('fs');
const path = require('path');

// Configuration
const args = process.argv.slice(2);
const contractName = args[0] || 'CareerPlanningFHE';
const docsDir = path.join(process.cwd(), 'docs');
const contractsDir = path.join(process.cwd(), 'contracts');
const testsDir = path.join(process.cwd(), 'test');

console.log(`\n📚 Generating Documentation for ${contractName}\n`);

try {
  // Ensure docs directory exists
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Step 1: Find contract file
  console.log('🔍 Finding contract file...');
  const contractFile = findFile(contractsDir, `${contractName}.sol`);

  if (!contractFile) {
    throw new Error(`Contract file ${contractName}.sol not found`);
  }

  console.log(`   Found: ${contractFile}`);

  // Step 2: Find test file
  console.log('🔍 Finding test file...');
  const testFile = findFile(testsDir, `${contractName}.test.js`) ||
                   findFile(testsDir, 'CareerPlanning.test.js');

  if (testFile) {
    console.log(`   Found: ${testFile}`);
  }

  // Step 3: Read files
  console.log('📖 Reading source files...');
  const contractSource = fs.readFileSync(contractFile, 'utf8');
  const testSource = testFile ? fs.readFileSync(testFile, 'utf8') : '';

  // Step 4: Generate documentation
  console.log('✍️  Generating documentation...');

  const documentation = generateDocumentation({
    contractName,
    contractSource,
    testSource
  });

  // Step 5: Write documentation
  const outputFile = path.join(docsDir, `${contractName}.md`);
  fs.writeFileSync(outputFile, documentation);

  console.log(`\n✅ Documentation generated successfully!`);
  console.log(`📄 Output: ${outputFile}\n`);

  // Step 6: Update SUMMARY.md (GitBook index)
  updateSummary(contractName);

} catch (error) {
  console.error(`\n❌ Error: ${error.message}\n`);
  process.exit(1);
}

/**
 * Find a file recursively in a directory
 */
function findFile(dir, filename) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      const found = findFile(filePath, filename);
      if (found) return found;
    } else if (file === filename) {
      return filePath;
    }
  }

  return null;
}

/**
 * Generate documentation from source code
 */
function generateDocumentation({ contractName, contractSource, testSource }) {
  const doc = [];

  // Title
  doc.push(`# ${contractName}`);
  doc.push('');

  // Extract contract description from comments
  const descriptionMatch = contractSource.match(/\/\*\*\s*\n\s*\*\s*@title\s+(.*?)\n/);
  if (descriptionMatch) {
    doc.push(descriptionMatch[1]);
    doc.push('');
  }

  doc.push('{% hint style="info" %}');
  doc.push(`This documentation is auto-generated from the ${contractName}.sol smart contract.`);
  doc.push('{% endhint %}');
  doc.push('');

  // Overview
  doc.push('## Overview');
  doc.push('');

  const noticeMatch = contractSource.match(/\/\*\*\s*\n\s*\*\s*@notice\s+(.*?)(?:\n\s*\*\s*@|$)/s);
  if (noticeMatch) {
    doc.push(noticeMatch[1].replace(/\s*\*\s*/g, ' ').trim());
    doc.push('');
  }

  // Extract structs
  const structMatches = contractSource.matchAll(/struct\s+(\w+)\s*\{([^}]+)\}/g);
  const structs = Array.from(structMatches);

  if (structs.length > 0) {
    doc.push('## Data Structures');
    doc.push('');

    structs.forEach(([, structName, structBody]) => {
      doc.push(`### ${structName}`);
      doc.push('');
      doc.push('```solidity');
      doc.push(`struct ${structName} {`);
      doc.push(structBody.trim());
      doc.push('}');
      doc.push('```');
      doc.push('');
    });
  }

  // Extract functions
  const functionMatches = contractSource.matchAll(
    /\/\*\*([^*]|\*(?!\/))*\*\/\s*function\s+(\w+)\s*\([^)]*\)\s*(public|external|private|internal)?/g
  );
  const functions = Array.from(functionMatches);

  if (functions.length > 0) {
    doc.push('## Functions');
    doc.push('');

    functions.forEach(([fullMatch]) => {
      // Extract function signature
      const funcMatch = fullMatch.match(/function\s+(\w+)\s*\(([^)]*)\)/);
      if (!funcMatch) return;

      const [, funcName, params] = funcMatch;

      // Extract @notice from comment
      const noticeMatch = fullMatch.match(/@notice\s+(.*?)(?:\n|@)/s);

      doc.push(`### ${funcName}()`);
      doc.push('');

      if (noticeMatch) {
        doc.push(noticeMatch[1].replace(/\s*\*\s*/g, ' ').trim());
        doc.push('');
      }

      // Extract function code
      const funcStart = contractSource.indexOf(fullMatch);
      const funcEnd = findFunctionEnd(contractSource, funcStart);
      const funcCode = contractSource.substring(funcStart, funcEnd);

      doc.push('```solidity');
      doc.push(funcCode.trim());
      doc.push('```');
      doc.push('');
    });
  }

  // Extract events
  const eventMatches = contractSource.matchAll(/event\s+(\w+)\s*\(([^)]*)\)/g);
  const events = Array.from(eventMatches);

  if (events.length > 0) {
    doc.push('## Events');
    doc.push('');

    events.forEach(([fullMatch, eventName, params]) => {
      doc.push(`### ${eventName}`);
      doc.push('');
      doc.push('```solidity');
      doc.push(fullMatch.trim());
      doc.push('```');
      doc.push('');
    });
  }

  // Add test examples if available
  if (testSource) {
    doc.push('## Usage Examples');
    doc.push('');
    doc.push('From the test suite:');
    doc.push('');

    // Extract test cases
    const testMatches = testSource.matchAll(/it\(['"](.+?)['"]\s*,\s*async\s+function/g);
    const tests = Array.from(testMatches);

    if (tests.length > 0) {
      tests.slice(0, 5).forEach(([, testDescription]) => {
        doc.push(`- ${testDescription}`);
      });
      doc.push('');
    }
  }

  // Add resources
  doc.push('## Resources');
  doc.push('');
  doc.push('- [FHEVM Documentation](https://docs.zama.ai/fhevm)');
  doc.push('- [Contract Source Code](../contracts)');
  doc.push('- [Test Suite](../test)');
  doc.push('');

  return doc.join('\n');
}

/**
 * Find the end of a function in source code
 */
function findFunctionEnd(source, startIndex) {
  let braceCount = 0;
  let inFunction = false;

  for (let i = startIndex; i < source.length; i++) {
    const char = source[i];

    if (char === '{') {
      braceCount++;
      inFunction = true;
    } else if (char === '}') {
      braceCount--;
      if (inFunction && braceCount === 0) {
        return i + 1;
      }
    }
  }

  return source.length;
}

/**
 * Update SUMMARY.md for GitBook
 */
function updateSummary(contractName) {
  const summaryPath = path.join(docsDir, 'SUMMARY.md');

  let summary = '';
  if (fs.existsSync(summaryPath)) {
    summary = fs.readFileSync(summaryPath, 'utf8');
  } else {
    summary = '# Summary\n\n* [Introduction](README.md)\n\n';
  }

  // Check if contract already in summary
  const contractLink = `* [${contractName}](${contractName}.md)`;
  if (!summary.includes(contractLink)) {
    summary += `${contractLink}\n`;
    fs.writeFileSync(summaryPath, summary);
    console.log('📝 Updated SUMMARY.md');
  }
}
