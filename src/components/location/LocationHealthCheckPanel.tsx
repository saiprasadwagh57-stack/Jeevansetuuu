import React, { useState } from "react";
import { useLocation } from "../../context/LocationContext";
import { HospitalProfile } from "../../types";
import { CheckCircle2, AlertTriangle, ShieldCheck, Cpu, Terminal, ChevronDown, ChevronUp, RefreshCw, Navigation } from "lucide-react";

interface LocationHealthCheckPanelProps {
  hospitals: HospitalProfile[];
  patientLat: number;
  patientLng: number;
}

export const LocationHealthCheckPanel: React.FC<LocationHealthCheckPanelProps> = ({
  hospitals,
  patientLat,
  patientLng,
}) => {
  const { isGpsActive, permissionStatus, requestGpsLocation } = useLocation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const verifiedHospitalsCount = hospitals.filter((h) => h.verificationStatus === "verified").length;
  const hospitalsWithGpsCount = hospitals.filter(
    (h) => h.verificationStatus === "verified" && typeof h.lat === "number" && typeof h.lng === "number"
  ).length;

  const isPatientGpsValid = Boolean(patientLat && patientLng && patientLat !== 0 && patientLng !== 0);
  const isHospitalGpsValid = hospitalsWithGpsCount > 0;
  const isDistanceEngineActive = isPatientGpsValid && isHospitalGpsValid;
  const isAllChecksPassed = isPatientGpsValid && isHospitalGpsValid && isDistanceEngineActive;

  return (
    <div className="bg-white rounded-2xl border border-purple-200 shadow-sm overflow-hidden text-slate-800 transition-all">
      {/* Header Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gradient-to-r from-purple-900/5 via-indigo-900/5 to-purple-950/5 hover:bg-purple-50/50 p-3.5 px-4 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
            isAllChecksPassed ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-amber-100 text-amber-800 border border-amber-300"
          }`}>
            {isAllChecksPassed ? <ShieldCheck className="w-4 h-4 text-emerald-700" /> : <AlertTriangle className="w-4 h-4 text-amber-700" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-xs text-slate-900 font-serif">
                Location Health & Distance Diagnostics
              </h4>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                isAllChecksPassed
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}>
                {isAllChecksPassed ? "✓ System Operational" : "⚠ Diagnostics Action Required"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Verified coordinates active for {hospitalsWithGpsCount} of {verifiedHospitalsCount} hospitals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-purple-700 text-xs font-bold">
          <span>{isOpen ? "Hide Diagnostics" : "Inspect Diagnostics"}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Health Check Details */}
      {isOpen && (
        <div className="p-4 border-t border-purple-100 space-y-4 bg-slate-50/60 text-xs">
          {/* Health Check Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {/* Check 1: Patient GPS */}
            <div className={`p-3 rounded-xl border ${
              isPatientGpsValid ? "bg-emerald-50/70 border-emerald-200 text-emerald-950" : "bg-amber-50 border-amber-200 text-amber-950"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-black text-slate-500">1. Patient GPS</span>
                {isPatientGpsValid ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                )}
              </div>
              <p className="font-extrabold text-xs">
                {isPatientGpsValid ? `${patientLat.toFixed(4)}, ${patientLng.toFixed(4)}` : "Manual Address Active"}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Permission: <strong className="uppercase">{permissionStatus}</strong>
              </p>
            </div>

            {/* Check 2: Hospital GPS */}
            <div className={`p-3 rounded-xl border ${
              isHospitalGpsValid ? "bg-emerald-50/70 border-emerald-200 text-emerald-950" : "bg-amber-50 border-amber-200 text-amber-950"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-black text-slate-500">2. Hospital GPS</span>
                {isHospitalGpsValid ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                )}
              </div>
              <p className="font-extrabold text-xs">{hospitalsWithGpsCount} Hospitals Verified</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Lat/Lng stored in Firestore</p>
            </div>

            {/* Check 3: Distance API Engine */}
            <div className={`p-3 rounded-xl border ${
              isDistanceEngineActive ? "bg-emerald-50/70 border-emerald-200 text-emerald-950" : "bg-amber-50 border-amber-200 text-amber-950"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-black text-slate-500">3. Distance Engine</span>
                {isDistanceEngineActive ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                )}
              </div>
              <p className="font-extrabold text-xs">Road Distance API Active</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Real road geometry & ETA</p>
            </div>

            {/* Check 4: Sorting Engine */}
            <div className="p-3 rounded-xl border bg-purple-50/80 border-purple-200 text-purple-950">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-black text-purple-700">4. Numeric Sort</span>
                <Cpu className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <p className="font-extrabold text-xs">Numeric distanceKm</p>
              <p className="text-[10px] text-purple-700 mt-0.5">Nearest → Farthest sort</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-200">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-slate-400 font-mono" />
              Calculations update in real time without refreshing the page
            </span>

            <button
              onClick={() => requestGpsLocation()}
              className="bg-white hover:bg-slate-100 text-purple-900 border border-purple-200 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3 text-purple-600" />
              Re-sync Location Diagnostics
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
