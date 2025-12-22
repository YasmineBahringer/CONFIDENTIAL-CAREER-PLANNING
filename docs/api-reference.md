# API Reference

## CareerPlanningFHE Contract

Complete API reference for the main FHEVM implementation.

### Data Types

#### CareerAssessment

```solidity
struct CareerAssessment {
    address user;                      // Assessment owner
    ebool careerGoal;                 // Encrypted: Clear career goals?
    ebool skillLevel;                 // Encrypted: Confident in skills?
    ebool educationPriority;          // Encrypted: Education priority?
    uint256 timestamp;                // When submitted
    bool resultRequested;             // Decryption requested?
    euint8 guidanceScore;             // Encrypted: Calculated score (0-100)
}
```

#### ResearchPaper

```solidity
struct ResearchPaper {
    uint256 id;                       // Paper identifier
    string title;                     // Paper title
    string description;               // Paper description
    string authors;                   // Paper authors
    bool isActive;                    // Availability status
    uint256 createdAt;                // Creation timestamp
}
```

### Events

#### AssessmentSubmitted

```solidity
event AssessmentSubmitted(
    address indexed user,
    uint256 indexed assessmentId,
    uint256 timestamp
)
```

Emitted when a user submits a career assessment.

**Parameters:**
- `user`: Address of the assessment submitter
- `assessmentId`: Unique identifier for the assessment
- `timestamp`: Block timestamp of submission

#### ResultRequested

```solidity
event ResultRequested(
    address indexed user,
    uint256 indexed assessmentId
)
```

Emitted when a user requests result decryption.

#### ResultRetrieved

```solidity
event ResultRetrieved(
    address indexed user,
    uint256 indexed assessmentId,
    uint8 decryptedScore
)
```

Emitted when a user retrieves their decrypted result.

### Functions

#### submitCareerAssessment

```solidity
function submitCareerAssessment(
    externalEuint32 _careerGoal,
    externalEuint32 _skillLevel,
    externalEuint32 _educationPriority,
    bytes calldata _inputProof
) external payable returns (uint256)
```

Submit an encrypted career assessment.

**Parameters:**
- `_careerGoal`: Encrypted boolean indicating clear career goals
- `_skillLevel`: Encrypted boolean indicating skill confidence
- `_educationPriority`: Encrypted boolean indicating education priority
- `_inputProof`: Zero-knowledge proof of correct encryption

**Requirements:**
- Minimum 0.001 ETH payment required
- Valid input proof must be provided
- Called by assessment owner

**Returns:**
- Assessment ID (uint256)

**Emits:**
- `AssessmentSubmitted` event

#### requestAssessmentResult

```solidity
function requestAssessmentResult(uint256 _assessmentId) external
```

Request decryption of assessment results.

**Parameters:**
- `_assessmentId`: ID of the assessment

**Requirements:**
- Caller must be the assessment owner
- Assessment must exist

**Emits:**
- `ResultRequested` event

#### getDecryptedCareerGuidance

```solidity
function getDecryptedCareerGuidance(uint256 _assessmentId) external returns (uint8)
```

Retrieve decrypted guidance score (after decryption is complete).

**Parameters:**
- `_assessmentId`: ID of the assessment

**Returns:**
- Guidance score (0-100, uint8)

**Requirements:**
- Caller must be the assessment owner
- Result must be requested first
- Decryption must be complete

**Emits:**
- `ResultRetrieved` event

#### getAssessmentDetails

```solidity
function getAssessmentDetails(uint256 _assessmentId) external view returns (
    address user,
    uint256 timestamp,
    bool resultRequested
)
```

Get details about an assessment.

**Parameters:**
- `_assessmentId`: ID of the assessment

**Returns:**
- `user`: Assessment owner address
- `timestamp`: Submission timestamp
- `resultRequested`: Whether decryption was requested

#### getUserAssessments

```solidity
function getUserAssessments(address _user) external view returns (uint256[] memory)
```

Get all assessments submitted by a user.

**Parameters:**
- `_user`: User address

**Returns:**
- Array of assessment IDs

#### getAssessmentCount

```solidity
function getAssessmentCount() external view returns (uint256)
```

Get total number of assessments.

**Returns:**
- Total count (uint256)

#### getContractBalance

```solidity
function getContractBalance() external view returns (uint256)
```

Get current contract balance.

**Returns:**
- Balance in wei (uint256)

### State Variables

#### assessments

```solidity
mapping(uint256 => CareerAssessment) public assessments
```

Mapping of assessment ID to assessment data.

#### userAssessments

```solidity
mapping(address => uint256[]) public userAssessments
```

Mapping of user address to array of their assessment IDs.

#### assessmentCounter

```solidity
uint256 public assessmentCounter
```

Counter tracking total number of assessments.

### Constants

#### MINIMUM_FEE

```solidity
uint256 constant MINIMUM_FEE = 0.001 ether
```

Minimum ETH required for assessment submission.

## CareerPlanningSimple Contract

Simplified version without FHE for comparison.

### Functions

All functions identical to CareerPlanningFHE, but:
- Accepts plaintext values instead of encrypted
- Calculates score directly
- No decryption required

## CareerPlanningWithPapers Contract

Extended version with research paper integration.

### Additional Data Structure

#### Paper

```solidity
struct Paper {
    uint256 id;
    string title;
    string description;
    string authors;
    bool isActive;
    uint256 createdAt;
}
```

### Additional Functions

#### addPaper

```solidity
function addPaper(
    string memory _title,
    string memory _description,
    string memory _authors
) external onlyOwner
```

Add a research paper (owner only).

#### getPaper

```solidity
function getPaper(uint256 _paperId) external view returns (
    uint256 id,
    string memory title,
    string memory description,
    string memory authors,
    bool isActive
)
```

Retrieve paper details.

#### getActivePapers

```solidity
function getActivePapers() external view returns (uint256[] memory)
```

Get all active paper IDs.

## Error Codes

### Common Errors

| Error | Meaning |
|-------|---------|
| `"Minimum fee required"` | Insufficient ETH sent with transaction |
| `"Not authorized"` | Caller is not the assessment owner |
| `"Invalid assessment ID"` | Assessment does not exist |
| `"Paper not found or inactive"` | Referenced paper not available |
| `"Result not ready"` | Decryption has not completed yet |

## Gas Estimates

Approximate gas usage for common operations:

| Operation | Gas |
|-----------|-----|
| submitCareerAssessment | 120,000 - 150,000 |
| requestAssessmentResult | 35,000 - 50,000 |
| getDecryptedCareerGuidance | 40,000 - 60,000 |
| addPaper | 70,000 - 90,000 |
| withdraw | 25,000 - 35,000 |

## Type Aliases

### FHEVM Types

- `ebool` - Encrypted boolean (1 byte)
- `euint8` - Encrypted 8-bit unsigned integer
- `euint16` - Encrypted 16-bit unsigned integer
- `euint32` - Encrypted 32-bit unsigned integer
- `euint64` - Encrypted 64-bit unsigned integer

### External Types

- `externalEuint32` - External representation of encrypted uint32
- `externalEuint64` - External representation of encrypted uint64

## Best Practices

### Permission Management

Always grant both contract and user permissions:

```solidity
FHE.allowThis(encryptedValue);           // Contract can use
FHE.allow(encryptedValue, user);         // User can use
```

### Input Validation

Always validate external inputs:

```solidity
require(msg.value >= MINIMUM_FEE, "Insufficient payment");
require(assessments[id].user != address(0), "Invalid ID");
```

### Event Emission

Emit events for all important state changes:

```solidity
emit AssessmentSubmitted(msg.sender, assessmentId, block.timestamp);
```

## See Also

- [FHE Operations Reference](https://docs.zama.ai/fhevm/fundamentals/types)
- [FHEVM Programming Guide](https://docs.zama.ai/fhevm/)
- [Hardhat Documentation](https://hardhat.org/docs)
