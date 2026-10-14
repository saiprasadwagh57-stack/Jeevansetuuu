import React from "react";
import { useLocation } from "../../context/LocationContext";
import { MapPin, Navigation, Edit3, ShieldAlert, Sparkles, Loader2 } from "lucide-react";

export const LocationPermissionModal: React.FC = () => {
  const {
    permissionModalOpen,
    closePermissionModal,
    requestGpsLocation,
    openManualModal,
    isLocating,
  } = useLocation();

  if (!permissionModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-purple-100 space-y-6 relative overflow-hidden transform transition-all scale-100">
        {/* Subtle Decorative Gradient Header */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#7C5CFC] via-[#6848F0] to-amber-400" />

        {/* Icon & Title */}
        <div className="text-center space-y-3 pt-2">
          <div className="w-16 h-16 rounded-3xl bg-purple-100 text-[#7C5CFC] border border-purple-200 flex items-center justify-center mx-auto shadow-inner relative">
            <MapPin className="w-8 h-8 text-[#7C5CFC] animate-bounce" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
          </div>

          <h3 className="text-2xl font-black text-slate-900 font-serif tracking-tight">
            Allow Location Access
          </h3>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#7C5CFC] border border-purple-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#7C5CFC]" />
            Smart Location Healthcare Engine
          </div>
        </div>

        {/* Core Message */}
        <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200/80 text-center text-slate-600 text-xs sm:text-sm leading-relaxed">
          <p className="font-medium">
            <strong>Jeevan Setu</strong> needs your location to find nearby verified hospitals, calculate accurate distances, estimate travel time, and provide emergency healthcare assistance.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100/80 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-[#7C5CFC] shrink-0 font-bold">
              📍
            </div>
            <div>
              <span className="font-extrabold text-xs text-slate-900 block">Nearby Hospitals</span>
              <span className="text-[10px] text-slate-500">Sorted by live distance</span>
            </div>
          </div>

          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100/80 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-[#7C5CFC] shrink-0 font-bold">
              ⏱️
            </div>
            <div>
              <span className="font-extrabold text-xs text-slate-900 block">Accurate ETA</span>
              <span className="text-[10px] text-slate-500">Real-time driving time</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => requestGpsLocation()}
            disabled={isLocating}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] hover:from-[#6949F2] hover:to-[#5635E0] text-white font-black text-sm shadow-lg shadow-[#7C5CFC]/30 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer disabled:opacity-75"
          >
            {isLocating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Detecting GPS Location...</span>
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                <span>Allow Location</span>
              </>
            )}
          </button>

          <button
            onClick={() => openManualModal()}
            disabled={isLocating}
            className="w-full py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-200"
          >
            <Edit3 className="w-4 h-4 text-slate-600" />
            <span>Enter Address Manually</span>
          </button>
        </div>

        {/* Privacy Assurance Footer */}
        <div className="text-center pt-1 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldAlert className="w-3 h-3 text-slate-400" />
            Your location is processed securely & stored locally for healthcare calculations.
          </p>
        </div>
      </div>
    </div>
  );
};
