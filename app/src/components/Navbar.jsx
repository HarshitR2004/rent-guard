import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

export function Navbar() {
  const location = useLocation();
  const { isConnected, address, isWrongNetwork, isConnecting, connectWallet, disconnectWallet } = useWallet();

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <nav className="w-full max-w-5xl px-6 py-5 mb-12 flex flex-row justify-between items-center border-b border-[#f4f3ef]/10 backdrop-blur-md z-50 gap-4 animate-fade-in-up relative">
      {/* Corner architectural crosshairs */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-neo-bg-yellow/40"></div>
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-neo-bg-yellow/40"></div>
      
      <Link 
        to="/" 
        className="font-heading font-normal tracking-[0.2em] text-xl sm:text-2xl text-[#f4f3ef] hover:text-neo-bg-yellow transition-colors duration-400 uppercase"
      >
        RENT<span className="text-neo-bg-yellow font-light font-body mx-1.5">/</span>GUARD
      </Link>
      
      <div className="flex items-center gap-6">
        <Link 
          to="/properties" 
          className="font-pixel text-[10px] tracking-[0.2em] text-[#dcdad2] hover:text-neo-bg-yellow transition-colors py-1 relative group uppercase font-bold"
        >
          PROPERTIES
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-neo-bg-yellow scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
        </Link>

        {isWrongNetwork ? (
          <button
            onClick={connectWallet}
            className="font-pixel text-[9px] bg-neo-bg-red/25 border border-neo-bg-red text-[#f4f3ef] px-3.5 py-1.5 hover:bg-neo-bg-red hover:text-white transition-all cursor-pointer font-bold tracking-wider"
          >
            SWITCH TO MONAD
          </button>
        ) : isConnected ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-black/45 border border-[#f4f3ef]/10 rounded-full px-3 py-1 gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neo-accent-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neo-accent-green"></span>
              </span>
              <span className="font-pixel text-[9px] text-neo-accent-green font-bold tracking-widest uppercase">
                {formatAddress(address)}
              </span>
            </div>
            <button
              onClick={disconnectWallet}
              className="font-pixel text-[8px] text-[#9c998f] hover:text-neo-bg-red transition-colors font-bold uppercase tracking-wider cursor-pointer"
            >
              [ DISCONNECT ]
            </button>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="font-pixel text-[9px] bg-neo-bg-yellow text-black border border-neo-bg-yellow px-4 py-1.5 hover:bg-[#f4f3ef] hover:border-[#f4f3ef] transition-all cursor-pointer font-bold tracking-wider"
          >
            {isConnecting ? "CONNECTING..." : "CONNECT WALLET"}
          </button>
        )}
      </div>
    </nav>
  );
}

