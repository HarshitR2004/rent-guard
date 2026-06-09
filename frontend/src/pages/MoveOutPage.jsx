import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PROPERTIES } from "../data/properties";
import { ImageUploader } from "../components/ImageUploader";

// Helper to generate deterministic SHA-256 hash in browser
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return "0x" + hashHex;
}

export default function MoveOutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const property = PROPERTIES.find(p => p.id === parseInt(id));

  const [moveInState, setMoveInState] = useState(null);
  const [images, setImages] = useState([]);
  const [statement, setStatement] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyingStep, setVerifyingStep] = useState("");
  const [settlement, setSettlement] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const savedState = localStorage.getItem(`property_${id}_state`);
    if (savedState) {
      setMoveInState(JSON.parse(savedState));
    }
  }, [id]);

  const handleVerify = async () => {
    setIsVerifying(true);
    setErrorMessage("");
    try {
      if (!moveInState) {
        throw new Error("Move-in record not found. Please initiate move-in first.");
      }

      const bookingId = moveInState.bookingId;
      const deposit = moveInState.deposit || property.deposit;
      const moveInImages = moveInState.moveInImages || [];

      // 1. Compare evidence with Gemini Vision
      setVerifyingStep("GEMINI VISION ANALYZING PHOTOS...");
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moveInImages: moveInImages,
          moveOutImages: images
        })
      });
      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeData.error || "AI comparison failed");

      const { damageFound, damageDescription, estimatedRepairCost } = analyzeData;

      // 2. Calculate refund
      const refundAmount = Math.max(0, deposit - estimatedRepairCost);

      // 3. Create inspection report object
      const report = {
        bookingId,
        damageFound,
        damageDescription,
        estimatedRepairCost,
        refundAmount,
        tenantStatement: statement
      };

      // 4. Create deterministic hash of report
      setVerifyingStep("GENERATING REPORT HASH...");
      const reportHash = await sha256(JSON.stringify(report));

      // 5. Save inspection result to Monad
      setVerifyingStep("RECORDING ON MONAD TESTNET...");
      const recordRes = await fetch("/api/record-inspection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          reportHash,
          repairCost: estimatedRepairCost,
          damageFound
        })
      });
      const recordData = await recordRes.json();
      if (!recordRes.ok) throw new Error(recordData.error || "Recording inspection on Monad failed");

      // 7. Persist final report
      const finalReport = {
        ...report,
        reportHash,
        moveInTxHash: moveInState.moveInTxHash,
        moveOutTxHash: recordData.transactionHash,
        moveInImages,
        moveOutImages: images,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem(`property_${id}_final_report`, JSON.stringify(finalReport));
      localStorage.removeItem(`property_${id}_state`); // Clean active rental state

      setSettlement({
        damageDesc: damageDescription,
        damageCost: estimatedRepairCost,
        refund: refundAmount,
        reportHash,
        txHash: recordData.transactionHash
      });

      setIsVerifying(false);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "An error occurred during verification.");
      setIsVerifying(false);
    }
  };


  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-10 mt-6">
      {/* Editorial Header */}
      <div className="flex flex-col border-b border-[#f4f3ef]/10 pb-5 animate-fade-in-up relative">
        <div className="absolute bottom-0 left-0 w-8 h-[1px] bg-neo-bg-yellow"></div>
        <h2 className="font-heading font-light text-3xl text-[#f4f3ef] tracking-wide uppercase">
          AI Escrow Settlement
        </h2>
        <span className="font-pixel text-[9px] text-[#cc5a37] tracking-[0.2em] mt-2 block font-bold">
          {settlement ? 'SETTLEMENT LOGGED ON-CHAIN' : 'STEP 02 // INITIATE LEASE TERMINATION'}
        </span>
      </div>

      {!settlement ? (
        <>
          {/* Photos Upload */}
          <div className="neo-container bg-[#151513] border border-[#f4f3ef]/10 text-white animate-fade-in-up [animation-delay:100ms]">
            <h3 className="font-pixel text-[9px] text-[#b35a38] tracking-[0.2em] mb-6 uppercase font-bold">
              [ 01 / UPLOAD CHECK-OUT CONDITIONS ]
            </h3>
            <ImageUploader onImagesChange={(imgs) => setImages(imgs)} />
          </div>

          {/* Statement Textarea */}
          <div className="neo-container bg-[#151513] border border-[#f4f3ef]/10 text-white animate-fade-in-up [animation-delay:200ms]">
            <h3 className="font-pixel text-[9px] text-neo-bg-yellow tracking-[0.2em] mb-4 uppercase font-bold">
              [ 02 / TENANT STATEMENT ]
            </h3>
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="e.g. The property was clean, and all appliances were in working order."
              className="w-full p-3 bg-transparent border border-[#f4f3ef]/15 focus:border-neo-bg-yellow/60 focus:outline-none font-body text-white font-medium text-sm transition-all duration-300 h-24 resize-none rounded-none"
            />
          </div>

          {errorMessage && (
            <div className="bg-[#cc5a37]/5 border border-[#cc5a37]/35 text-[#f4f3ef]/80 p-5 rounded-none font-body text-xs animate-fade-in-up">
              <p className="font-semibold text-[#cc5a37]">⚠️ {errorMessage}</p>
            </div>
          )}

          <button
            id="verify-settle-btn"
            onClick={handleVerify}
            disabled={images.length === 0 || isVerifying}
            className={`neo-btn w-full py-4.5 text-xs font-bold tracking-[0.2em] animate-fade-in-up [animation-delay:300ms] ${
              isVerifying ? '!bg-neo-bg-purple !border-neo-bg-purple !text-white' : ''
            }`}
          >
            {isVerifying ? verifyingStep : 'VERIFY EVIDENCE & INITIALIZE SETTLEMENT'}
          </button>
        </>
      ) : (
        /* Post-Settlement Invoice Receipt */
        <div className="neo-container flex flex-col gap-6 animate-fade-in-up relative">
          {/* Blueprint style stamp */}
          <div className="absolute top-0 right-0 w-16 h-16 border-b border-l border-[#f4f3ef]/5 pointer-events-none"></div>

          {/* Verdict Banner */}
          <div className={`p-5 text-center border rounded-none ${
            settlement.damageCost > 0 
              ? 'bg-[#cc5a37]/5 border-[#cc5a37]/35 text-[#cc5a37]' 
              : 'bg-[#3e9c70]/5 border-[#3e9c70]/35 text-[#3e9c70]'
          }`}>
            <h3 className="font-pixel text-[10px] tracking-[0.2em] uppercase font-bold">
              {settlement.damageCost > 0 ? '● DAMAGE ASSESSED BY GEMINI' : '○ MOVE-OUT APPROVED // NO DAMAGES'}
            </h3>
          </div>

          {/* Audit invoice report */}
          <div className="neo-inner-card bg-black/20 border border-[#f4f3ef]/5 p-6 rounded-none font-body">
            <h4 className="font-pixel text-[9px] text-white/50 mb-4 tracking-[0.2em] uppercase font-bold">// AI VISION PARSE LOG</h4>
            
            <div className="flex justify-between items-baseline border-b border-[#f4f3ef]/10 pb-4 mb-4 gap-4">
              <span className="font-heading italic text-lg text-[#f4f3ef] leading-tight">
                {settlement.damageDesc || "No new structural/cosmetic damage detected in check-out photos."}
              </span>
              <span className={`font-pixel text-xs font-bold whitespace-nowrap ${settlement.damageCost > 0 ? 'text-[#cc5a37]' : 'text-[#3e9c70]'}`}>
                -${settlement.damageCost}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-[#9c998f] font-pixel">
              <span>INITIAL SECURITY ESCROW</span>
              <span>${property.deposit}</span>
            </div>
          </div>

          {/* Ledger Settlement Box */}
          <div className="bg-gradient-to-br from-[#151513] to-[#12221b] border border-neo-accent-green/30 p-6 text-center rounded-none shadow-xl relative">
            <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-neo-accent-green/40"></div>
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-neo-accent-green/40"></div>
            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-neo-accent-green/40"></div>
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-neo-accent-green/40"></div>
            
            <p className="font-pixel text-[9px] text-[#9c998f] tracking-[0.2em] mb-2 uppercase font-bold">
              AMOUNT REFUNDED TO TENANT
            </p>
            <p className="font-pixel text-4xl text-neo-accent-green font-extrabold tracking-tight">
              ${settlement.refund}
            </p>
          </div>

          {/* Blockchain receipts ledger */}
          <div className="neo-inner-card bg-black/30 text-[10px] font-pixel flex flex-col gap-4.5 p-5 rounded-none border border-[#f4f3ef]/5">
            <div className="flex flex-col sm:flex-row justify-between border-b border-[#f4f3ef]/5 pb-3 gap-2">
              <span className="text-white/40 tracking-[0.15em] font-bold">MONAD TX RECEIPT</span>
              <a
                href={`https://testnet.monadscan.com/tx/${settlement.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7d9bb0] hover:text-neo-bg-yellow underline truncate max-w-[320px] transition-colors"
              >
                {settlement.txHash}
              </a>
            </div>
            <div className="flex flex-col sm:flex-row justify-between gap-2">
              <span className="text-white/40 tracking-[0.15em] font-bold">INSPECTION AUDIT HASH</span>
              <span className="text-white/70 truncate max-w-[320px]">
                {settlement.reportHash}
              </span>
            </div>
          </div>

          <button
            id="return-home-btn"
            onClick={() => navigate("/")}
            className="neo-btn w-full py-4 text-xs font-bold tracking-[0.2em] !bg-transparent !border-[#f4f3ef]/10 hover:!border-[#f4f3ef]/25 !text-white hover:!bg-white/[0.02]"
          >
            RETURN TO DIRECTORY
          </button>
        </div>
      )}
    </div>
  );
}
