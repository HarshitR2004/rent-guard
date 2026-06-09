// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EscrowInspectionRegistry {
    struct Deposit {
        uint256 amount;
        uint256 timestamp;
        bool exists;
    }

    struct InspectionResult {
        bytes32 reportHash;
        uint256 repairCost;
        bool damageFound;
        uint256 timestamp;
        bool exists;
    }

    // Maps bookingId to Deposit metadata
    mapping(string => Deposit) public deposits;
    
    // Maps bookingId to InspectionResult metadata
    mapping(string => InspectionResult) public inspections;

    event DepositRegistered(string indexed bookingId, uint256 amount, uint256 timestamp);
    event InspectionRecorded(string indexed bookingId, bytes32 indexed reportHash, uint256 repairCost, bool damageFound, uint256 timestamp);

    function registerDeposit(string calldata bookingId, uint256 depositAmount) external {
        deposits[bookingId] = Deposit({
            amount: depositAmount,
            timestamp: block.timestamp,
            exists: true
        });
        emit DepositRegistered(bookingId, depositAmount, block.timestamp);
    }

    function recordInspection(string calldata bookingId, bytes32 reportHash, uint256 repairCost, bool damageFound) external {
        inspections[bookingId] = InspectionResult({
            reportHash: reportHash,
            repairCost: repairCost,
            damageFound: damageFound,
            timestamp: block.timestamp,
            exists: true
        });
        emit InspectionRecorded(bookingId, reportHash, repairCost, damageFound, block.timestamp);
    }
}
