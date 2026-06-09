import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PROPERTIES } from "../data/properties";
import { ImageUploader } from "../components/ImageUploader";

export default function MoveInPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const property = PROPERTIES.find(p => p.id === parseInt(id));

  const [bookingId, setBookingId] = useState("");
  const [depositAmount, setDepositAmount] = useState(0);
  const [images, setImages] = useState([]);
  const [isLocking, setIsLocking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (property) {
      setDepositAmount(property.deposit);
      setBookingId(`BOOK-${id}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [property, id]);

  const handleLockFunds = async () => {
    setIsLocking(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/move-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          depositAmount: Number(depositAmount),
          images
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register deposit on Monad");
      }

      // Save move-in evidence and state to localStorage
      localStorage.setItem(`property_${id}_state`, JSON.stringify({
        status: 'Occupied',
        deposit: Number(depositAmount),
        bookingId,
        moveInImages: images,
        moveInTxHash: data.transactionHash,
        timestamp: new Date().toISOString()
      }));

      setIsLocking(false);
      navigate(`/property/${id}`);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "On-chain transaction failed.");
      setIsLocking(false);
    }
  };

  const handleBypass = () => {
    // Save state with mock tx hash to allow frontend testing when keys/contracts are not ready
    localStorage.setItem(`property_${id}_state`, JSON.stringify({
      status: 'Occupied',
      deposit: Number(depositAmount),
      bookingId,
      moveInImages: images,
      moveInTxHash: "0x" + Array(64).fill(0).map(() => Math.floor(Math.random()*16).toString(16)).join(""),
      timestamp: new Date().toISOString()
    }));
    navigate(`/property/${id}`);
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
          <div className="bg-[#cc5a37]/5 border border-[#cc5a37]/35 text-[#f4f3ef]/80 p-5 rounded-none mb-8 font-body text-xs relative">
            <p className="mb-3 font-semibold flex items-center gap-2 text-[#cc5a37]">⚠️ {errorMessage}</p>
            <button
              onClick={handleBypass}
              className="text-[9px] text-neo-bg-yellow hover:text-white transition-colors uppercase font-pixel cursor-pointer tracking-wider font-bold"
            >
              [ Bypass on-chain register for testing ]
            </button>
          </div>
        )}

        <button
          id="lock-funds-btn"
          onClick={handleLockFunds}
          disabled={images.length === 0 || isLocking || !bookingId}
          className="neo-btn w-full py-4.5 text-xs font-bold tracking-[0.2em]"
        >
          {isLocking ? 'LOCKING ON MONAD TESTNET...' : 'SUBMIT EVIDENCE & LOCK ESCROW'}
        </button>
      </div>
    </div>
  );
}
