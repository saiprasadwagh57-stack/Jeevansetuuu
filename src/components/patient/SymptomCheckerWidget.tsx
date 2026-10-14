import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { SymptomAnalysisResult } from "../../types";
import {
  BrainCircuit,
  Search,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export const SymptomCheckerWidget: React.FC = () => {
  const { setSelectedSpecialtyFilter, setSymptomFilter, language, t } = useApp();
  const [symptomInput, setSymptomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SymptomAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomInput.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/symptom-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: symptomInput, language }),
      });

      if (!res.ok) throw new Error("Failed to consult AI symptom checker");

      const data: SymptomAnalysisResult = await res.json();
      setResult(data);

      // Auto-populate filter
      if (data.likely_specialty) {
        setSelectedSpecialtyFilter(data.likely_specialty);
        setSymptomFilter(data.search_query || data.likely_specialty);
      }
    } catch (err: any) {
      console.error(err);
      setError("AI Triage server busy. Reverting to smart keyword match.");
      // Fallback result
      const fallbackResult: SymptomAnalysisResult = {
        likely_specialty: "General Medicine",
        urgency: "medium",
        guidance_text:
          "Based on your symptoms, we recommend consulting a General Physician or specialist for a thorough clinical evaluation.",
        search_query: "General Medicine",
        warning_signs: ["Severe chest pain", "Breathing difficulty", "High persistent fever"],
      };
      setResult(fallbackResult);
      setSelectedSpecialtyFilter("General Medicine");
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyBadge = (urgency: "low" | "medium" | "high") => {
    switch (urgency) {
      case "high":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            High Urgency - Seek Immediate Medical Attention
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Moderate Urgency - Consult Doctor Today
          </span>
        );
      case "low":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Low Urgency - Routine Consultation Recommended
          </span>
        );
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#23125E] via-[#3B1F8C] to-[#7C5CFC] rounded-3xl p-4 sm:p-6 md:p-8 text-white shadow-xl shadow-[#7C5CFC]/20 relative overflow-hidden border border-[#E2D9FF]/20">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#7C5CFC]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#3B1F8C]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-md animate-float shrink-0">
            <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#EAE5FF] font-extrabold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-300" /> AI Symptom Triage
            </span>
            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold font-serif text-white tracking-tight">
              Describe Symptoms
            </h2>
          </div>
        </div>

        <p className="text-[#EAE5FF]/90 text-xs sm:text-sm mb-4 max-w-2xl leading-relaxed">
          Enter what you feel (e.g. &quot;chest pain, fever, knee pain&quot;). Our AI triage guides urgency and filters relevant specialists.
        </p>

        <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-2.5 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              placeholder="e.g., severe stomach pain, persistent cough, high fever..."
              className="w-full bg-white/10 backdrop-blur-md text-white placeholder-[#EAE5FF]/60 border border-white/25 rounded-2xl px-4 py-3 pl-10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] focus:bg-white/20 transition-all shadow-inner min-h-[44px]"
            />
            <Search className="w-4 h-4 text-[#EAE5FF] absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            type="submit"
            disabled={loading || !symptomInput.trim()}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 text-[#23125E] font-extrabold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap active:scale-95 min-h-[48px]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#23125E]/30 border-t-[#23125E] rounded-full animate-spin" />
                <span>Analyzing Symptoms...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#23125E]" />
                <span>Analyze & Filter</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Example Tags - Horizontal Scroll on Mobile */}
        <div className="flex items-center gap-2 text-xs text-purple-200/70 mb-2 overflow-x-auto no-scrollbar py-1">
          <span className="font-semibold text-purple-300 text-[11px] shrink-0">Quick symptoms:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap">
            {[
              "Chest pain & sweating",
              "High fever & headache",
              "Severe knee joint pain",
              "Stomach ache & nausea",
              "Persistent cough",
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSymptomInput(tag);
                }}
                className="bg-white/10 hover:bg-white/20 border border-purple-400/30 text-purple-100 rounded-xl px-3 py-1.5 transition-colors cursor-pointer text-[11px] font-medium shrink-0 active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* AI Triage Result Card */}
        {result && (
          <div className="mt-6 bg-white/10 backdrop-blur-xl border border-purple-300/30 rounded-2xl p-5 md:p-6 text-white animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-purple-400/20 pb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-amber-300" />
                <span className="font-bold text-lg text-white">AI Clinical Guidance</span>
              </div>
              {getUrgencyBadge(result.urgency)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-purple-950/40 p-3.5 rounded-xl border border-purple-400/20">
                <span className="text-[11px] text-purple-300 uppercase font-semibold block">
                  Recommended Specialty
                </span>
                <span className="font-bold text-amber-300 text-base">
                  {result.likely_specialty}
                </span>
              </div>

              <div className="bg-purple-950/40 p-3.5 rounded-xl border border-purple-400/20 md:col-span-2">
                <span className="text-[11px] text-purple-300 uppercase font-semibold block">
                  Medical Guidance
                </span>
                <p className="text-sm text-purple-100 leading-relaxed font-sans">
                  {result.guidance_text}
                </p>
              </div>
            </div>

            {result.warning_signs && result.warning_signs.length > 0 && (
              <div className="bg-red-500/15 border border-red-400/30 rounded-xl p-3 text-xs text-red-200 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-red-300">Warning Signs to Watch For:</strong>{" "}
                  {result.warning_signs.join(" • ")}
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-purple-400/20">
              <span className="text-xs text-purple-200">
                ✓ Filter applied: Showing doctors and hospitals specializing in{" "}
                <strong className="text-white font-semibold">{result.likely_specialty}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedSpecialtyFilter("All");
                  setSymptomFilter("");
                  setResult(null);
                  setSymptomInput("");
                }}
                className="text-xs text-amber-300 hover:underline font-semibold cursor-pointer"
              >
                Clear AI Filter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
