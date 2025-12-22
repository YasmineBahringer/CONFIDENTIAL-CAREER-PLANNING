// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE Counter
/// @notice A simple counter demonstrating basic FHEVM operations
/// @dev This contract shows encrypted arithmetic and conditional operations
contract FHECounter is ZamaConfig {
    /// @notice Encrypted counter value
    euint32 private _count;

    /// @notice Emitted when counter is incremented
    event Incremented(address indexed user);

    /// @notice Emitted when counter is decremented
    event Decremented(address indexed user);

    /// @notice Initialize the counter to zero
    constructor() {
        _count = FHE.asEuint32(0);
        FHE.allowThis(_count);
    }

    /// @notice Get the encrypted counter value
    /// @return The encrypted counter
    function getCount() external view returns (euint32) {
        return _count;
    }

    /// @notice Increment the counter by an encrypted value
    /// @param inputEuint32 Encrypted input value
    /// @param inputProof Zero-knowledge proof of correct encryption
    /// @dev This demonstrates FHE addition operation
    function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        // Convert external encrypted input to internal type
        euint32 value = FHE.fromExternal(inputEuint32, inputProof);

        // Perform encrypted addition
        _count = FHE.add(_count, value);

        // Grant permissions for the new encrypted value
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);

        emit Incremented(msg.sender);
    }

    /// @notice Decrement the counter by an encrypted value
    /// @param inputEuint32 Encrypted input value
    /// @param inputProof Zero-knowledge proof of correct encryption
    /// @dev This demonstrates FHE subtraction operation
    function decrement(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        // Convert external encrypted input to internal type
        euint32 value = FHE.fromExternal(inputEuint32, inputProof);

        // Perform encrypted subtraction
        _count = FHE.sub(_count, value);

        // Grant permissions for the new encrypted value
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);

        emit Decremented(msg.sender);
    }

    /// @notice Reset counter to zero
    /// @dev Only demonstrates encrypted assignment
    function reset() external {
        _count = FHE.asEuint32(0);
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
    }
}
