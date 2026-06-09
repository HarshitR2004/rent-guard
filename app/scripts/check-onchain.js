const { ethers } = require("ethers");

const contractAddress = process.env.REGISTRY_CONTRACT_ADDRESS;

if (!contractAddress) {
  console.error("Error: REGISTRY_CONTRACT_ADDRESS is not set in the environment");
  process.exit(1);
}

const REGISTRY_ABI = [
  "function deposits(string calldata) external view returns (uint256 amount, uint256 timestamp, bool exists)",
  "function inspections(string calldata) external view returns (bytes32 reportHash, uint256 repairCost, bool damageFound, uint256 timestamp, bool exists)"
];

async function main() {
  const bookingId = process.argv[2];
  if (!bookingId) {
    console.error("Usage: node scripts/check-onchain.js <bookingId>");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider("https://testnet-rpc.monad.xyz");
  const contract = new ethers.Contract(contractAddress, REGISTRY_ABI, provider);

  console.log(`Querying Monad Testnet for Booking ID: ${bookingId}...`);
  console.log(`Contract Address: ${contractAddress}\n`);

  try {
    const deposit = await contract.deposits(bookingId);
    if (deposit.exists) {
      console.log("🟢 MOVE-IN DEPOSIT REGISTERED:");
      console.log(`   - Amount: $${deposit.amount.toString()}`);
      console.log(`   - Timestamp: ${new Date(Number(deposit.timestamp) * 1000).toLocaleString()}`);
    } else {
      console.log("🔴 No deposit registered for this Booking ID on-chain.");
    }

    console.log();

    const inspection = await contract.inspections(bookingId);
    if (inspection.exists) {
      console.log("🟢 MOVE-OUT INSPECTION RESULT RECORDED:");
      console.log(`   - Report Hash: ${inspection.reportHash}`);
      console.log(`   - Estimated Repair Cost: $${inspection.repairCost.toString()}`);
      console.log(`   - Damage Found: ${inspection.damageFound ? "Yes" : "No"}`);
      console.log(`   - Timestamp: ${new Date(Number(inspection.timestamp) * 1000).toLocaleString()}`);
    } else {
      console.log("🔴 No inspection report registered for this Booking ID on-chain.");
    }
  } catch (error) {
    console.error("Error querying contract:", error);
  }
}

main();
