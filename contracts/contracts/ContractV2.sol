```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EscrowInspectionRegistryV2 {

    address public owner;

    enum RentalStatus {
        Vacant,
        Occupied,
        Inspected
    }

    struct Deposit {
        uint256 amount;
        address tenant;
        uint256 timestamp;
        string moveInCID;      // IPFS CID for move-in evidence
        bool exists;
    }

    struct InspectionResult {
        bytes32 reportHash;    // Hash of AI inspection report
        string reportCID;      // IPFS CID of full report JSON
        string moveOutCID;     // IPFS CID for move-out evidence
        uint256 repairCost;
        bool damageFound;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => Deposit) public deposits;
    mapping(string => InspectionResult) public inspections;
    mapping(string => RentalStatus) public rentalStatus;

    event DepositRegistered(
        string indexed bookingId,
        address indexed tenant,
        uint256 amount,
        string moveInCID,
        uint256 timestamp
    );

    event InspectionRecorded(
        string indexed bookingId,
        bytes32 indexed reportHash,
        string reportCID,
        string moveOutCID,
        uint256 repairCost,
        bool damageFound,
        uint256 timestamp
    );

    event StatusUpdated(
        string indexed bookingId,
        RentalStatus status
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerDeposit(
        string calldata bookingId,
        uint256 depositAmount,
        string calldata moveInCID
    ) external {

        require(!deposits[bookingId].exists, "Booking already exists");

        deposits[bookingId] = Deposit({
            amount: depositAmount,
            tenant: msg.sender,
            timestamp: block.timestamp,
            moveInCID: moveInCID,
            exists: true
        });

        rentalStatus[bookingId] = RentalStatus.Occupied;

        emit DepositRegistered(
            bookingId,
            msg.sender,
            depositAmount,
            moveInCID,
            block.timestamp
        );

        emit StatusUpdated(
            bookingId,
            RentalStatus.Occupied
        );
    }

    function recordInspection(
        string calldata bookingId,
        bytes32 reportHash,
        string calldata reportCID,
        string calldata moveOutCID,
        uint256 repairCost,
        bool damageFound
    ) external {

        require(
            deposits[bookingId].exists,
            "Booking does not exist"
        );

        inspections[bookingId] = InspectionResult({
            reportHash: reportHash,
            reportCID: reportCID,
            moveOutCID: moveOutCID,
            repairCost: repairCost,
            damageFound: damageFound,
            timestamp: block.timestamp,
            exists: true
        });

        rentalStatus[bookingId] = RentalStatus.Inspected;

        emit InspectionRecorded(
            bookingId,
            reportHash,
            reportCID,
            moveOutCID,
            repairCost,
            damageFound,
            block.timestamp
        );

        emit StatusUpdated(
            bookingId,
            RentalStatus.Inspected
        );
    }

    function getDeposit(
        string calldata bookingId
    ) external view returns (Deposit memory) {
        return deposits[bookingId];
    }

    function getInspection(
        string calldata bookingId
    ) external view returns (InspectionResult memory) {
        return inspections[bookingId];
    }
}
```
