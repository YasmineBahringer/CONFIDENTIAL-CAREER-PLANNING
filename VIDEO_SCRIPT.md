# Video Script - Confidential Career Planning FHEVM Example
## Duration: 60 seconds

---

## SCENE 1: OPENING (0:00 - 0:08)
**Visual:** Project logo/title card with FHEVM branding
**Screen:** Display "Confidential Career Planning - Privacy-Preserving Career Assessment"

**Narration:**
"Introducing Confidential Career Planning - a privacy-first career assessment system built with FHEVM."

---

## SCENE 2: PROBLEM STATEMENT (0:08 - 0:18)
**Visual:** Animation showing career data exposure
**Screen:** Show traditional system with exposed data: goals, skills, education

**Narration:**
"Career planning involves sensitive information - your goals, skills, and education priorities. Traditional systems expose all of this to platforms and counselors."

---

## SCENE 3: SOLUTION OVERVIEW (0:18 - 0:28)
**Visual:** Code snippet showing CareerPlanningFHE.sol struct
**Screen:** Highlight `ebool` and `euint8` encrypted types

**Narration:**
"With FHEVM, users submit encrypted assessments using ebool and euint8 types. The smart contract calculates guidance scores entirely in the encrypted domain - never seeing the actual data."

---

## SCENE 4: FHE OPERATIONS (0:28 - 0:42)
**Visual:** Code demonstration of FHE operations
**Screen:** Show `FHE.select()` and `FHE.add()` operations

**Narration:**
"The contract uses FHE-dot-select for conditional logic and FHE-dot-add for arithmetic. All calculations happen on encrypted values. The result is a guidance score from zero to one hundred - computed privately on-chain."

---

## SCENE 5: LIVE DEMO (0:42 - 0:52)
**Visual:** Frontend interface demonstration
**Screen:** Show wallet connection, assessment submission, result retrieval

**Narration:**
"Users connect their wallet, submit encrypted assessments, and retrieve personalized guidance - all while maintaining complete privacy. The system is live on Sepolia testnet."

---

## SCENE 6: CLOSING (0:52 - 1:00)
**Visual:** GitHub repo and documentation links
**Screen:** Display "Learn More" with documentation highlights

**Narration:**
"Complete with comprehensive tests, documentation at multiple levels, and deployment scripts. Start building privacy-preserving applications with FHEVM today."

**End card:** "Confidential Career Planning | Built with FHEVM by Zama"

---

## TECHNICAL NOTES

### Visual Elements Needed:
1. Title card with project name
2. Animation showing data exposure (problem)
3. Code snippets from CareerPlanningFHE.sol
4. FHE operations visualization
5. Frontend interface recording
6. Documentation screenshots
7. End card with links

### On-Screen Text:
- "Privacy-Preserving Career Assessment"
- "Encrypted Types: ebool, euint8"
- "FHE.select() - Conditional Logic"
- "FHE.add() - Encrypted Arithmetic"
- "Live on Sepolia Testnet"
- "GitHub: [repository link]"

### Audio:
- Background music: Subtle, professional, technology-themed
- Narration: Clear, professional voiceover
- Sound effects: Minimal, for transitions only

### Pacing:
- Quick cuts between code and interface
- Smooth transitions between scenes
- Highlight key concepts with on-screen text
- Keep momentum throughout 60 seconds

### Code Highlights to Show:
```solidity
// Scene 3
struct CareerAssessment {
    ebool careerGoal;
    ebool skillLevel;
    euint8 guidanceScore;
}

// Scene 4
euint8 points = FHE.select(condition, value1, value2);
score = FHE.add(score, points);
```

### Frontend Actions to Capture:
1. Wallet connection (MetaMask popup)
2. Assessment form with three boolean inputs
3. Transaction signing
4. Loading state
5. Result display showing guidance score
6. Transaction confirmation on block explorer

---

## POST-PRODUCTION

### Color Grading:
- Professional tech aesthetic
- High contrast for code readability
- Consistent branding colors

### Captions:
- Add subtitles for accessibility
- Highlight technical terms
- Use monospace font for code

### Music:
- Volume: Low enough to not overpower narration
- Style: Modern, upbeat, technology-focused
- Fade in at start, fade out at end

---

## ALTERNATIVE VERSIONS

### 30-Second Version:
- Skip SCENE 2 (problem statement)
- Condense SCENE 4 (show operations more quickly)
- Maintain SCENE 5 (live demo) as key selling point

### 2-Minute Version:
- Add detailed code walkthrough
- Show test execution
- Demonstrate deployment process
- Include comparison with non-FHE version

---

## KEY MESSAGES TO CONVEY

1. **Privacy-First**: Complete data confidentiality
2. **Real-World Application**: Practical career guidance use case
3. **Production-Ready**: Live deployment, comprehensive tests
4. **Educational**: Learn FHEVM through this example
5. **Extensible**: Easy to customize and extend

---

## CALL TO ACTION

"Visit our GitHub repository to explore the code, run the tests, and deploy your own instance. Documentation includes beginner tutorials and advanced guides for extending the example."

---

**END OF SCRIPT**
