import { useNavigate } from "react-router-dom";
import { PROPERTIES } from "../data/properties";
import { useWallet } from "../context/WalletContext";

export default function PropertiesPage() {
  const navigate = useNavigate();
  const { isConnected, isConnecting, connectWallet, error } = useWallet();

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto mt-12 animate-fade-in-up">
        <div className="neo-container bg-[#151513] border border-[#f4f3ef]/10 text-white text-center py-12 flex flex-col items-center gap-6">
          {/* Cyber Lock Icon */}
          <div className="w-16 h-16 rounded-full bg-neo-bg-yellow/5 border border-neo-bg-yellow/30 flex items-center justify-center text-2xl text-neo-bg-yellow animate-pulse">
            🔒
          </div>

          <div>
            <h2 className="font-heading font-light text-2xl text-[#f4f3ef] tracking-wide uppercase mb-2">
              Access Restricted
            </h2>
            <span className="font-pixel text-[8px] text-neo-bg-yellow tracking-[0.2em] uppercase font-bold">
              [ WALLET AUTHENTICATION REQUIRED ]
            </span>
          </div>

          <p className="font-body text-xs text-[#9c998f] leading-relaxed px-4">
            To view the active property registry, audit escrow contract status, or record moves on Monad Testnet, you must authorize your Web3 wallet.
          </p>

          {error && (
            <div className="bg-[#cc5a37]/5 border border-[#cc5a37]/35 text-[#cc5a37] text-[10px] font-pixel p-3.5 w-full rounded-none">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="neo-btn w-full mt-4 text-xs font-bold tracking-[0.2em]"
          >
            {isConnecting ? "AUTHORIZING WALLET..." : "CONNECT WEB3 WALLET"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row justify-between items-baseline border-b border-[#f4f3ef]/10 pb-5 animate-fade-in-up relative">
        <div className="absolute bottom-0 left-0 w-8 h-[1px] bg-neo-bg-yellow"></div>
        
        <h2 className="font-heading font-light text-4xl text-[#f4f3ef] tracking-wide uppercase">
          Available Rentals
        </h2>
        <span className="font-pixel text-[9px] text-[#9c998f] uppercase tracking-[0.2em] mt-2 md:mt-0 font-bold">
          [ Select a listing to audit escrow state ]
        </span>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {PROPERTIES.map((p, index) => (
          <div 
            key={p.id} 
            className="neo-container flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 animate-fade-in-up opacity-0 relative group"
            style={{ animationDelay: `${100 + index * 120}ms` }}
          >
            <div>
              {/* Image Container with Ken Burns effect */}
              <div className="w-full h-52 bg-[#1c1c1a] mb-5 overflow-hidden relative border border-[#f4f3ef]/10">
                {p.image ? (
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    className="w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-[1500ms] ease-out filter grayscale-[15%] group-hover:grayscale-0" 
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center font-pixel text-[10px] text-[#9c998f] tracking-widest uppercase">
                    NO PREVIEW AVAILABLE
                  </div>
                )}
                
                {/* Sage Green Verified Label */}
                <div className="absolute top-3 right-3 bg-black/85 backdrop-blur-md px-3 py-1 border border-neo-accent-green/35">
                  <span className="font-pixel text-[8px] text-neo-accent-green tracking-widest uppercase font-bold">VERIFIED AI</span>
                </div>
              </div>
              
              <h3 className="font-heading font-normal text-2xl mb-1.5 text-[#f4f3ef] tracking-wide">{p.name}</h3>
              <p className="font-body text-[#9c998f] text-xs mb-5 tracking-wide">{p.location}</p>
              
              {/* Editorial Ledger Row */}
              <div className="border-t border-b border-[#f4f3ef]/5 py-3.5 mb-6 flex justify-between items-center">
                <span className="font-pixel text-[9px] text-[#9c998f] uppercase tracking-[0.15em]">SECURITY ESCROW</span>
                <span className="font-pixel text-[13px] text-neo-bg-yellow font-bold">${p.deposit}</span>
              </div>
            </div>

            <button
              id={`property-${p.id}-details-btn`}
              onClick={() => navigate(`/property/${p.id}`)}
              className="neo-btn w-full text-[10px] py-3 tracking-[0.18em]"
            >
              AUDIT STATUS
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

