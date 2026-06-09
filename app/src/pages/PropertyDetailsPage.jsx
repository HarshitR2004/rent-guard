import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PROPERTIES } from "../data/properties";

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [propertyState, setPropertyState] = useState(null);
  const [mounted, setMounted] = useState(false);

  const property = PROPERTIES.find(p => p.id === parseInt(id));

  useEffect(() => {
    setMounted(true);
    const savedState = localStorage.getItem(`property_${id}_state`);
    if (savedState) {
      setPropertyState(JSON.parse(savedState));
    }
  }, [id]);

  if (!property) return <div className="font-pixel text-center py-12 text-[#9c998f]">[ Property not registered in index ]</div>;
  if (!mounted) return null;

  const isOccupied = propertyState && propertyState.status === 'Occupied';

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start mt-6">
      {/* Left Column: Architecture Image Plate */}
      <div className="md:col-span-5 h-[28rem] md:h-[34rem] bg-[#1c1c1a] relative overflow-hidden border border-[#f4f3ef]/10 animate-fade-in-up">
        {property.image ? (
          <img src={property.image} alt={property.name} className="w-full h-full object-cover filter grayscale-[10%] group-hover:grayscale-0 transition-all duration-700" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center font-pixel text-gray-500 text-xs gap-3">
            <span className="text-3xl">🏠</span>
            <span>NO ROOM PREVIEW AVAILABLE</span>
          </div>
        )}
        
        {/* Frame corner alignment guides */}
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/20"></div>
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/20"></div>
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/20"></div>
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/20"></div>
      </div>

      {/* Right Column: Registry details and actions */}
      <div className="md:col-span-7 flex flex-col gap-6 animate-fade-in-up [animation-delay:150ms]">
        <div className="border-b border-[#f4f3ef]/10 pb-6">
          <span className="font-pixel text-[9px] text-neo-bg-yellow tracking-[0.2em] uppercase block mb-3 font-bold">
            // LISTING AUDIT
          </span>
          <h2 className="font-heading font-light text-4xl sm:text-5xl text-[#f4f3ef] mb-2 leading-none tracking-wide">
            {property.name}
          </h2>
          <p className="font-body text-xs text-[#9c998f] tracking-widest uppercase font-medium">{property.location}</p>
        </div>

        {/* Ledger Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="neo-inner-card bg-gradient-to-br from-[#151513] to-neo-bg-yellow/5 border-t border-t-neo-bg-yellow/30 rounded-none relative">
            <span className="font-pixel text-[8px] uppercase tracking-[0.2em] block mb-2 text-neo-bg-yellow font-bold">ESCROW VALUE</span>
            <span className="font-pixel text-xl font-bold text-[#f4f3ef]">${property.deposit}</span>
          </div>
          <div className="neo-inner-card bg-gradient-to-br from-[#151513] to-neo-bg-blue/5 border-t border-t-neo-bg-blue/30 rounded-none relative">
            <span className="font-pixel text-[8px] uppercase tracking-[0.2em] block mb-2 text-neo-bg-blue font-bold">REGISTERED LANDLORD</span>
            <span className="font-heading italic text-lg text-[#f4f3ef] font-medium">{property.host}</span>
          </div>
        </div>

        {/* Escrow stamp */}
        <div className={`p-5 flex flex-col justify-center border rounded-none relative ${
          isOccupied 
            ? 'bg-neo-bg-red/5 border-[#cc5a37]/30 border-l-2 border-l-[#cc5a37]' 
            : 'bg-neo-accent-green/5 border-[#3e9c70]/30 border-l-2 border-l-[#3e9c70]'
        }`}>
          <span className="font-pixel text-[8px] uppercase tracking-[0.2em] block mb-2 text-[#9c998f] font-bold">LEDGER STATUS</span>
          <span className={`font-pixel text-xs tracking-[0.15em] font-bold ${isOccupied ? 'text-[#cc5a37]' : 'text-[#3e9c70]'}`}>
            {isOccupied ? '● OCCUPIED // FUNDS LOCKED ON-CHAIN' : '○ AVAILABLE // REGISTRY OPEN'}
          </span>
        </div>

        {/* Action button */}
        <div className="mt-4">
          {!isOccupied ? (
            <button
              id="move-in-btn"
              onClick={() => navigate(`/property/${id}/move-in`)}
              className="neo-btn w-full py-4.5 text-xs font-bold tracking-[0.25em]"
            >
              INITIATE SECURE LEASE
            </button>
          ) : (
            <button
              id="move-out-btn"
              onClick={() => navigate(`/property/${id}/move-out`)}
              className="neo-btn w-full py-4.5 text-xs font-bold tracking-[0.25em] !bg-neo-bg-red !border-neo-bg-red !text-[#0c0c0a] hover:!border-[#f4f3ef]"
            >
              INITIATE AI SETTLEMENT
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

