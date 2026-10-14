import React from "react";
import { useLocation } from "../../context/LocationContext";
import { MapPin, Navigation, Compass, RefreshCw, Radio, Clock } from "lucide-react";

export const LiveLocationBadge: React.FC = () => {
  const {
    location,
    isGpsActive,
    isLocating,
    requestGpsLocation,
    openChangeLocationModal,
  } = useLocation();

  return (
    <div className="bg-gradient-to-r from-[#23125E] via-indigo-950 to-[#23125E] text-white p-4.5 rounded-3xl shadow-lg border border-purple-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Location Details */}
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="relative w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 border border-white/20 shrink-0 shadow-inner">
          <MapPin className="w-6 h-6 text-amber-300 animate-bounce" />
          <span
            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#23125E] ${
              isGpsActive ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
            }`}
            title={isGpsActive ? "GPS Active" : "Manual Address"}
          />
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
              📍 Current Location
            </span>

            {isGpsActive ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                GPS Active (Live)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 text-[10px] font-extrabold">
                ✍️ Manual Address
              </span>
            )}

            <span className="text-[10px] text-purple-300 flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-purple-400" />
              {location.lastUpdated ? `Updated ${location.lastUpdated}` : "Updated Just Now"}
            </span>
          </div>

          <h4 className="text-sm font-extrabold text-white leading-snug">
            {location.formattedAddress}
          </h4>

          <div className="flex items-center gap-3 text-[10px] text-purple-200 font-mono">
            <span>Lat: {location.lat.toFixed(4)}</span>
            <span>•</span>
            <span>Lng: {location.lng.toFixed(4)}</span>
            <span>•</span>
            <span>PIN: {location.pinCode || "422103"}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
        <button
          onClick={() => requestGpsLocation()}
          disabled={isLocating}
          title="Refresh GPS Coordinates"
          className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer border border-white/10 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLocating ? "animate-spin text-amber-300" : ""}`} />
        </button>

        <button
          onClick={() => openChangeLocationModal()}
          className="flex-1 sm:flex-initial bg-amber-400 hover:bg-amber-500 text-purple-950 font-black text-xs px-4.5 py-2.5 rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-102 active:scale-95"
        >
          <Compass className="w-4 h-4 text-purple-950" />
          <span>📍 Change Location</span>
        </button>
      </div>
    </div>
  );
};
