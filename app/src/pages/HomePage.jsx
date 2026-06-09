import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

export default function HomePage() {
  const navigate = useNavigate();
  const { isConnected, connectWallet } = useWallet();

  const handleEnterRegistry = async () => {
    if (isConnected) {
      navigate("/properties");
    } else {
      await connectWallet();
      navigate("/properties");
    }
  };

  return (
    <div className="flex flex-col gap-20 pb-20 mt-8">
      {/* Editorial Hero Banner */}
      <section className="text-left flex flex-col items-start px-4 md:px-0 relative max-w-3xl">
        <div className="absolute -left-6 top-0 bottom-0 w-[1px] bg-neo-bg-yellow/20 hidden md:block"></div>
        
        <span className="font-pixel text-[10px] tracking-[0.25em] text-neo-bg-yellow uppercase mb-6 animate-fade-in-up block font-bold">
          [ 00 // THE REGISTRY OF TRUST ]
        </span>
        
        <h2 className="font-heading font-light text-5xl sm:text-6xl md:text-7xl text-[#f4f3ef] leading-[1.05] mb-8 animate-fade-in-up tracking-tight [animation-delay:100ms]">
          Evidence Decides.<br />
          <span className="font-serif italic text-neo-bg-yellow font-normal">No More Veto Power</span>
          <span className="block text-xl sm:text-2xl font-body font-light text-[#9c998f] tracking-wide mt-4 lowercase">
            — restoring symmetrical balance to rental deposits.
          </span>
        </h2>

        <p className="text-sm md:text-base font-body text-[#dcdad2] max-w-2xl mb-12 leading-relaxed animate-fade-in-up [animation-delay:200ms] border-l-2 border-neo-bg-yellow/30 pl-6">
          <strong className="text-white font-semibold">RentGuard</strong> is an architectural paradigm for tenancy trust. 
          By combining the finality of the <span className="text-neo-bg-yellow font-semibold">Monad blockchain</span> with property condition analysis from <span className="text-neo-accent-green font-semibold">Gemini Vision AI</span>, security deposit disputes are resolved mathematically. No bias, no landlord delay.
        </p>

        <div className="animate-fade-in-up [animation-delay:300ms]">
          <button
            id="view-properties-btn"
            onClick={handleEnterRegistry}
            className="neo-btn text-xs px-10 py-4.5"
          >
            {isConnected ? "ENTER THE REGISTRY" : "CONNECT WALLET TO ENTER"}
          </button>
        </div>
      </section>

      {/* Asymmetrical 3-Column Modernist Blueprint Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0 mt-8 relative">
        {/* Horizontal thin divider */}
        <div className="absolute -top-6 left-0 right-0 h-[1px] bg-[#f4f3ef]/10 animate-line-draw"></div>
        
        <div className="neo-container bg-gradient-to-b from-[#151513] to-[#1a1a17]/50 border-t border-t-neo-bg-purple/20 text-[#dcdad2] hover:-translate-y-1.5 transition-transform duration-400 animate-fade-in-up [animation-delay:400ms]">
          <span className="font-pixel text-[9px] text-neo-bg-purple tracking-[0.2em] block mb-6 font-bold">01 // PHOTOGRAPH CONDITION</span>
          <p className="font-body text-[13px] text-[#9c998f] leading-relaxed">
            Record rooms in detail during move-in. The visual record is compressed, hashed, and immediately registered on-chain for tamper-proof auditing.
          </p>
        </div>
        
        <div className="neo-container bg-gradient-to-b from-[#151513] to-[#1a1a17]/50 border-t border-t-neo-bg-yellow/20 text-[#dcdad2] hover:-translate-y-1.5 transition-transform duration-400 animate-fade-in-up [animation-delay:500ms]">
          <span className="font-pixel text-[9px] text-neo-bg-yellow tracking-[0.2em] block mb-6 font-bold">02 // DEPOSIT LOCK ESCROW</span>
          <p className="font-body text-[13px] text-[#9c998f] leading-relaxed">
            Escrow deposits are held by a smart contract. The contract operates on the high-throughput Monad Testnet, ensuring transparent custody.
          </p>
        </div>
        
        <div className="neo-container bg-gradient-to-b from-[#151513] to-[#1a1a17]/50 border-t border-t-neo-accent-green/20 text-[#dcdad2] hover:-translate-y-1.5 transition-transform duration-400 animate-fade-in-up [animation-delay:600ms]">
          <span className="font-pixel text-[9px] text-neo-accent-green tracking-[0.2em] block mb-6 font-bold">03 // AI DAMAGE COMPARISON</span>
          <p className="font-body text-[13px] text-[#9c998f] leading-relaxed">
            At check-out, Gemini Vision parses current photos against move-in evidence, auto-assesses damages, and prompts the contract to release your refund.
          </p>
        </div>
      </section>
    </div>
  );
}

