export function Footer() {
  return (
    <footer className="w-full max-w-5xl mt-24 pt-8 pb-12 border-t border-[#f4f3ef]/10 flex flex-col md:flex-row justify-between items-center gap-6 z-50 animate-fade-in-up relative">
      <div className="absolute top-0 left-0 w-2 h-[1px] bg-neo-bg-yellow/40"></div>
      <div className="absolute top-0 right-0 w-2 h-[1px] bg-neo-bg-yellow/40"></div>
      
      <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
        <span className="font-heading font-normal text-lg tracking-[0.15em] text-[#f4f3ef] uppercase">
          RENT<span className="text-neo-bg-yellow">/</span>GUARD
        </span>
        <span className="font-body text-[11px] text-[#9c998f] tracking-wide">
          Trustless property escrow registry powered by Monad & Gemini AI.
        </span>
      </div>
      
      <div className="flex flex-wrap gap-x-8 gap-y-2 justify-center font-pixel text-[9px] text-[#9c998f] tracking-widest uppercase">
        <div>
          <span className="text-white/30">NETWORK //</span> <span className="text-neo-bg-yellow font-bold">MONAD TESTNET</span>
        </div>
        <div>
          <span className="text-white/30">INTELLIGENCE //</span> <span className="text-neo-accent-green font-bold">GEMINI VISION</span>
        </div>
      </div>
    </footer>
  );
}

