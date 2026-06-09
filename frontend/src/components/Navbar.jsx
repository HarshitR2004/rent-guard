import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

export function Navbar() {
  const location = useLocation();

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
      </div>
    </nav>
  );
}

