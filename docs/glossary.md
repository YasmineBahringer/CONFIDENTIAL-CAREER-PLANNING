# Glossary of Terms

## Core Concepts

### FHE (Fully Homomorphic Encryption)
A cryptographic technique that allows computation on encrypted data without decryption. The smart contract can perform calculations on encrypted values without ever seeing the actual plaintext values.

### FHEVM (Fully Homomorphic Encryption Virtual Machine)
Zama's implementation of an FHE-enabled blockchain, allowing Solidity contracts to work with encrypted data through the FHE operation library.

### Encrypted Types
Solidity data types that hold encrypted values:
- `ebool` - Encrypted boolean
- `euint8` - Encrypted 8-bit unsigned integer
- `euint16` - Encrypted 16-bit unsigned integer
- `euint32` - Encrypted 32-bit unsigned integer
- `euint64` - Encrypted 64-bit unsigned integer

### Plaintext
The original, unencrypted value (what the user sees vs. what the blockchain sees).

### Ciphertext
The encrypted value stored on-chain (only decryptable by the user with their private key).

## FHEVM-Specific Terms

### Input Proof
A zero-knowledge proof that certifies encrypted data was correctly encrypted by the client for a specific contract and user. Prevents users from creating invalid encrypted values that could break contract logic.

### Decryption
The process of converting encrypted data back to plaintext. In FHEVM, only the user holding the encryption key can decrypt their own data.

### Two-Phase Decryption
A pattern where:
1. User requests decryption (signals intent)
2. User retrieves the decrypted result (when available)

This enables optional relayer integration for decryption.

### Handle
A reference to an encrypted value generated during encryption. The smart contract receives handles instead of the encrypted data itself. Handles are bound to the contract and user.

### Permission
Authorization for a contract or user to use an encrypted value. Must be explicitly granted using `FHE.allowThis()` or `FHE.allow()`.

### FHE Operation
Cryptographic operation performed on encrypted data:
- Addition: `FHE.add()`
- Subtraction: `FHE.sub()`
- Multiplication: `FHE.mul()`
- Conditional Select: `FHE.select()`
- Comparison: `FHE.eq()`

### Binding
The cryptographic linking of an encrypted value to a specific `[contract, user]` pair. Prevents reusing encrypted values across contracts or users.

## Smart Contract Terms

### Solidity
Programming language for writing Ethereum smart contracts.

### Contract
A deployable program on the blockchain containing functions and state.

### State Variable
Data stored persistently on-chain.

### Function
Executable code within a contract. Can be:
- `public` - Callable externally and internally
- `external` - Callable only externally
- `private` - Callable only internally
- `internal` - Callable internally and by derived contracts

### View Function
A function that reads state but cannot modify it (no gas cost).

### Payable Function
A function that can receive ETH payment.

### Event
A log entry emitted by the contract. Indexed on-chain and useful for off-chain listeners.

### Modifier
A reusable code snippet that can guard function execution (e.g., `onlyOwner`).

## Testing Terms

### Fixture
A reusable test setup that deploys contracts and initializes state.

### Test Case
An individual test scenario with setup, execution, and assertions.

### Mock
A fake implementation used for testing (e.g., mock encrypted values).

### Coverage
Percentage of contract code executed by tests.

### Gas Report
Analysis of gas consumption during contract operations.

## Deployment Terms

### Network
A blockchain instance:
- **Local**: Private development network running locally
- **Sepolia**: Ethereum testnet for testing
- **Mainnet**: Production Ethereum network

### RPC (Remote Procedure Call)
Protocol for communicating with a blockchain node. RPC URLs allow sending transactions and querying state.

### Gas
Unit measuring computational effort:
- **Gas Price**: Cost per unit of computation (in gwei)
- **Gas Limit**: Maximum gas willing to spend
- **Total Cost**: Gas × Gas Price

### Deployment Script
Automated script that:
1. Compiles contracts
2. Creates contract instances
3. Initializes state
4. Records addresses for later use

## Security Terms

### Access Control
Mechanisms restricting who can call functions:
- Owner-only functions
- Role-based access control
- User-specific access

### Reentrancy
A vulnerability where a function can be called recursively during its execution, potentially exploiting state inconsistencies.

### Integer Overflow/Underflow
When integer operations exceed type boundaries. Solidity 0.8+ prevents this automatically.

### Input Validation
Checking that function parameters meet requirements before processing.

## Development Terms

### Hardhat
Ethereum development framework providing:
- Contract compilation
- Testing environment
- Deployment tools
- Local network

### npm (Node Package Manager)
JavaScript package manager for installing dependencies.

### Dependencies
External libraries required by the project (e.g., OpenZeppelin contracts).

### DevDependencies
Tools needed for development but not in production (e.g., testing frameworks).

### Compilation
Converting Solidity source code to bytecode deployable on-chain.

### Artifact
Generated output from compilation including:
- Contract ABI
- Bytecode
- Type information

## FHEVM-Specific Patterns

### Allow Pattern
Granting permissions to enable encrypted value use:

```solidity
FHE.allowThis(encryptedValue);        // Contract can use
FHE.allow(encryptedValue, msg.sender); // User can use
```

### Select Pattern
Conditional logic without revealing condition:

```solidity
euint8 result = FHE.select(condition, ifTrue, ifFalse);
// Result is encrypted; caller can't tell which branch executed
```

### Convert Pattern
Converting external encrypted values to internal encrypted types:

```solidity
euint32 internal = FHE.fromExternal(externalHandle, proof);
```

### Decrypt Pattern
Requesting and retrieving decrypted results:

```solidity
// 1. Request
contract.requestDecryption(encryptedValueId);

// 2. Wait for decryption service

// 3. Retrieve
uint256 plaintext = contract.getDecrypted(encryptedValueId);
```

## Organization Terms

### Repository
Version-controlled directory containing project files.

### Bounty
Reward for completing specific development tasks.

### Examples Hub
Collection of standalone example projects demonstrating FHEVM concepts.

### Category
Grouping of related examples (e.g., basic, advanced, games).

### Standalone Project
Self-contained project that can run independently with all dependencies included.

## Communication Terms

### GitBook
Platform for creating and hosting technical documentation.

### Markdown
Lightweight markup language for documentation formatting.

### JSDoc/TSDoc
Documentation comment format for code:

```javascript
/**
 * @notice Describes the function
 * @param x Describes parameter x
 * @return Describes return value
 */
```

### README
Project overview and quick start guide (typically the first file users read).

### Commit
A saved snapshot in version control with a descriptive message.

### Pull Request
Proposed changes submitted for review before merging into main code.

## Zama-Specific Terms

### Zama
The company developing FHEVM and FHE technology for blockchain.

### Zama Relayer
Service that handles decryption requests from smart contracts.

### Zama SDK
Software development kit providing encryption/decryption utilities.

### Zama Network
The official FHEVM-enabled blockchain by Zama.

## See Also

- [FHEVM Documentation](https://docs.zama.ai/fhevm/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/)
- [Ethereum Concepts](https://ethereum.org/en/developers/)
