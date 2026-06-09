const { ethers } = require("ethers");

const DEPOSIT_REGISTRY_ABI = [
  "function registerDeposit(string calldata bookingId, uint256 depositAmount) external",
  "function deposits(string calldata) external view returns (uint256 amount, uint256 timestamp, bool exists)",
];

const INSPECTION_REGISTRY_ABI = [
  "function recordInspection(string calldata bookingId, bytes32 reportHash, uint256 repairCost, bool damageFound) external",
  "function inspections(string calldata) external view returns (bytes32 reportHash, uint256 repairCost, bool damageFound, uint256 timestamp, bool exists)",
];

/**
 * Register a security deposit on-chain on Monad Testnet.
 * POST /api/move-in
 */
async function registerDeposit(req, res) {
  try {
    const { bookingId, depositAmount } = req.body;

    if (!bookingId || !depositAmount) {
      return res.status(400).json({ error: "Missing bookingId or depositAmount" });
    }

    const privateKey = process.env.MONAD_PRIVATE_KEY;
    const contractAddress = process.env.REGISTRY_CONTRACT_ADDRESS;

    if (!privateKey) {
      return res.status(500).json({ error: "MONAD_PRIVATE_KEY not configured" });
    }

    if (!contractAddress) {
      return res.status(500).json({ error: "REGISTRY_CONTRACT_ADDRESS not configured" });
    }

    const provider = new ethers.JsonRpcProvider("https://testnet-rpc.monad.xyz");
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, DEPOSIT_REGISTRY_ABI, wallet);

    console.log(`Registering deposit on Monad for booking ${bookingId} with amount ${depositAmount}...`);

    const tx = await contract.registerDeposit(bookingId, depositAmount);
    console.log(`Tx sent: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`Tx confirmed: ${receipt.transactionHash}`);

    return res.json({
      success: true,
      transactionHash: receipt.hash || receipt.transactionHash,
      bookingId,
      depositAmount,
    });
  } catch (error) {
    console.error("Error registering deposit on Monad:", error);
    return res.status(500).json({
      error: error.message || "Failed to register deposit on Monad",
    });
  }
}

/**
 * Record an inspection report hash and findings on-chain on Monad Testnet.
 * POST /api/record-inspection
 */
async function recordInspection(req, res) {
  try {
    const { bookingId, reportHash, repairCost, damageFound } = req.body;

    if (!bookingId || !reportHash || repairCost === undefined || damageFound === undefined) {
      return res.status(400).json({
        error: "Missing bookingId, reportHash, repairCost, or damageFound",
      });
    }

    const privateKey = process.env.MONAD_PRIVATE_KEY;
    const contractAddress = process.env.REGISTRY_CONTRACT_ADDRESS;

    if (!privateKey) {
      return res.status(500).json({ error: "MONAD_PRIVATE_KEY not configured" });
    }

    if (!contractAddress) {
      return res.status(500).json({ error: "REGISTRY_CONTRACT_ADDRESS not configured" });
    }

    // Ensure reportHash is properly formatted as a 32-byte hex string (with 0x prefix)
    let formattedHash = reportHash;
    if (!formattedHash.startsWith("0x")) {
      formattedHash = "0x" + formattedHash;
    }
    if (formattedHash.length !== 66) {
      formattedHash = ethers.keccak256(ethers.toUtf8Bytes(reportHash));
    }

    const provider = new ethers.JsonRpcProvider("https://testnet-rpc.monad.xyz");
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, INSPECTION_REGISTRY_ABI, wallet);

    console.log(`Recording inspection on Monad for booking ${bookingId}...`);

    const tx = await contract.recordInspection(bookingId, formattedHash, repairCost, damageFound);
    console.log(`Tx sent: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`Tx confirmed: ${receipt.transactionHash}`);

    return res.json({
      success: true,
      transactionHash: receipt.hash || receipt.transactionHash,
      bookingId,
      reportHash: formattedHash,
      repairCost,
      damageFound,
    });
  } catch (error) {
    console.error("Error recording inspection on Monad:", error);
    return res.status(500).json({
      error: error.message || "Failed to record inspection on Monad",
    });
  }
}

module.exports = {
  registerDeposit,
  recordInspection,
};
