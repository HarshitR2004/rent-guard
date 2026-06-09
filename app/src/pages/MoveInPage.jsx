import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { PROPERTIES } from "../data/properties";
import { ImageUploader } from "../components/ImageUploader";
import { useWallet } from "../context/WalletContext";

const CONTRACT_ADDRESS = import.meta.env.VITE_REGISTRY_CONTRACT_ADDRESS || "0xd9145CCE52D386f254917e481eB44e9943F39138";
const DEPOSIT_REGISTRY_ABI = [
  "function registerDeposit(string calldata bookingId, uint256 depositAmount) external",
];

export default function MoveInPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const property = PROPERTIES.find(p => p.id === parseInt(id));
  const { isConnected, signer, connectWallet } = useWallet();

  const [bookingId, setBookingId] = useState("");
  const [depositAmount, setDepositAmount] = useState(0);
  const [images, setImages] = useState([]);
  const [isLocking, setIsLocking] = useState(false);
  const [lockingStep, setLockingStep] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (property) {
      setDepositAmount(property.deposit);
      setBookingId(`BOOK-${id}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [property, id]);

  const handleLockFunds = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    setIsLocking(true);
    setErrorMessage("");
    setLockingStep("WAITING FOR WALLET SIGNATURE...");
    
    try {
      if (!signer) {
        throw new Error("Wallet connected, but no signer available. Please reconnect.");
      }

      // Initialize Ethers Contract with Signer
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DEPOSIT_REGISTRY_ABI, signer);

      // Call smart contract function directly
      const tx = await contract.registerDeposit(bookingId, Number(depositAmount));
      
      setLockingStep("WAITING FOR TRANSACTION CONFIRMATION...");
      const receipt = await tx.wait();

      const txHash = receipt.hash || receipt.transactionHash || tx.hash;

      // Save move-in evidence and state to localStorage
      localStorage.setItem(`property_${id}_state`, JSON.stringify({
        status: 'Occupied',
        deposit: Number(depositAmount),
        bookingId,
        moveInImages: images,
        moveInTxHash: txHash,
        timestamp: new Date().toISOString()
      }));

      setIsLocking(false);
      navigate(`/property/${id}`);
    } catch (error) {
      console.error("Move-in contract call failed:", error);
      
      // Extract readable error messages
      let displayError = error.message || "On-chain transaction failed.";
      if (error.code === "ACTION_REJECTED") {
        displayError = "User rejected the transaction signature in their wallet.";
      }
      
      setErrorMessage(displayError);
      setIsLocking(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-10 mt-6">
      {/* Editorial Header */}
      <div className="flex flex-col border-b border-[#f4f3ef]/10 pb-5 animate-fade-in-up relative">
        <div className="absolute bottom-0 left-0 w-8 h-[1px] bg-neo-bg-yellow"></div>
        <h2 className="font-heading font-light text-3xl text-[#f4f3ef] tracking-wide uppercase">
          Leasing Escrow Setup
        </h2>
        <span className="font-pixel text-[9px] text-neo-bg-yellow tracking-[0.2em] mt-2 block font-bold">
          STEP 01 // RECORD MOVE-IN EVIDENCE
        </span>
      </div>

      {/* Upload Panel */}
      <div className="neo-container bg-[#151513] border border-[#f4f3ef]/10 text-white animate-fade-in-up [animation-delay:100ms]">
        <h3 className="font-pixel text-[9px] text-[#7d9bb0] tracking-[0.2em] mb-6 uppercase font-bold">
          [ 01 / UPLOAD ROOM CONDITION EVIDENCE ]
        </h3>
        <ImageUploader onImagesChange={(imgs) => setImages(imgs)} />
      </div>

      {/* Escrow Params Card */}
      <div className="neo-container bg-[#151513] border border-[#f4f3ef]/10 text-white animate-fade-in-up [animation-delay:200ms]">
        <h3 className="font-pixel text-[9px] text-neo-bg-yellow tracking-[0.2em] mb-8 uppercase font-bold">
          [ 02 / CONTRACT REGISTRY PARAMS ]
        </h3>

        <div className="flex flex-col gap-6 mb-8">
          <div>
            <label className="font-pixel text-[8px] text-[#9c998f] uppercase tracking-[0.2em] block mb-2 font-bold">Booking Identifier</label>
            <input
              type="text"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="e.g. BOOK-1"
              className="w-full p-2 bg-transparent border-b border-[#f4f3ef]/15 focus:border-neo-bg-yellow/60 focus:outline-none font-pixel text-white font-medium text-sm transition-all duration-300"
            />
          </div>
          <div>
            <label className="font-pixel text-[8px] text-[#9c998f] uppercase tracking-[0.2em] block mb-2 font-bold">Required Deposit ($)</label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full p-2 bg-transparent border-b border-[#f4f3ef]/15 focus:border-neo-bg-yellow/60 focus:outline-none font-pixel text-white font-medium text-sm transition-all duration-300"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="bg-[#cc5a37]/5 border border-[#cc5a37]/35 text-[#f4f3ef]/80 p-5 rounded-none mb-8 font-body text-xs relative animate-fade-in-up">
            <p className="font-semibold flex items-center gap-2 text-[#cc5a37]">⚠️ {errorMessage}</p>
          </div>
        )}

        <button
          id="lock-funds-btn"
          onClick={handleLockFunds}
          disabled={images.length === 0 || isLocking || !bookingId}
          className="neo-btn w-full py-4.5 text-xs font-bold tracking-[0.2em]"
        >
          {!isConnected 
            ? 'CONNECT WALLET TO ESCROW' 
            : isLocking 
              ? lockingStep 
              : 'SUBMIT EVIDENCE & LOCK ESCROW'}
        </button>
      </div>
    </div>
  );
}
