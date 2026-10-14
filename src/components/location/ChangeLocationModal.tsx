import React from "react";
import { useLocation } from "../../context/LocationContext";
import { MapPin, Navigation, Edit3, X, Sparkles, Loader2, CheckCircle2 } from "lucide-react";

export const ChangeLocationModal: React.FC = () => {
  const {
    changeLocationModalOpen,
    closeChangeLocationModal,
    requestGpsLocation,
    openManualModal,
    location,
    isGpsActive,
    isLocating,
  } = useLocation();

  if (!changeLocationModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 space-y-5 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 text-[#7C5CFC] flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5 text-[#7C5CFC]" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 font-serif">
                Change Patient Location
              </h3>
              <p className="text-[11px] text-slate-500">
                Select your preferred location detection mode
              </p>
            </div>
          </div>

          <button
            onClick={closeChangeLocationModal}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Location Card */}
        <div className="bg-purple-50/80 p-3.5 rounded-2xl border border-purple-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block mb-1">
            Active Current Location
          </span>
          <p className="text-xs font-bold text-slate-900 truncate">
            {location.formattedAddress}
          </p>
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 font-mono">
            <span>Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}</span>
            <span className="text-purple-300">•</span>
            <span className="font-sans text-[#7C5CFC] font-semibold">{isGpsActive ? "📡 Live GPS Active" : "✍️ Manual Entry"}</span>
          </div>
        </div>

        {/* Option 1: Use Current GPS */}
        <button
          onClick={async () => {
            await requestGpsLocation();
          }}
          disabled={isLocating}
          className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
            isGpsActive
              ? "bg-purple-50/90 border-[#7C5CFC] ring-2 ring-[#7C5CFC]/20"
              : "bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/30"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] text-white flex items-center justify-center shrink-0 shadow-sm">
              {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs text-slate-900">
                  Use Current GPS (Real-Time Tracking)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Automatically fetches live GPS coordinates & watches location movements.
              </p>
            </div>
          </div>

          {isGpsActive && <CheckCircle2 className="w-5 h-5 text-[#7C5CFC] shrink-0" />}
        </button>

        {/* Option 2: Enter Address Manually */}
        <button
          onClick={() => {
            closeChangeLocationModal();
            openManualModal();
          }}
          className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
            !isGpsActive
              ? "bg-purple-50/90 border-[#7C5CFC] ring-2 ring-[#7C5CFC]/20"
              : "bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/30"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
              <Edit3 className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <span className="font-extrabold text-xs text-slate-900 block">
                Enter Address / PIN Code Manually
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Type House No., Street, City, or 6-digit PIN Code for auto-detection.
              </p>
            </div>
          </div>

          {!isGpsActive && <CheckCircle2 className="w-5 h-5 text-[#7C5CFC] shrink-0" />}
        </button>
      </div>
    </div>
  );
};
