import React from "react";
import { HospitalProfile } from "../../types";
import { useApp } from "../../context/AppContext";
import { useLocation } from "../../context/LocationContext";
import { calculateRoadDistanceAndEta } from "../../utils/location";
import {
  MapPin,
  Star,
  ShieldCheck,
  Building2,
  Bed,
  IndianRupee,
  Stethoscope,
  ChevronRight,
  Phone,
  Navigation,
  Clock,
} from "lucide-react";

interface HospitalCardProps {
  hospital: HospitalProfile;
  onSelect: (hospital: HospitalProfile) => void;
  highlightSpecialty?: string;
  patientLocation?: { lat: number; lng: number };
}

export const HospitalCard: React.FC<HospitalCardProps> = ({
  hospital,
  onSelect,
  highlightSpecialty,
  patientLocation,
}) => {
  const { t, getHospitalRatingStats, loggedInPatient } = useApp();
  const { location: activeUserLoc } = useLocation();

  const ratingStats = getHospitalRatingStats(hospital.id);
  const displayRating = ratingStats.totalReviews > 0 ? ratingStats.avgRating : (hospital.rating || 4.5);

  const totalBedsAvail =
    hospital.beds.icuAvailable +
    hospital.beds.generalAvailable +
    hospital.beds.privateAvailable;

  const hasHighlightedSpecialty =
    highlightSpecialty &&
    highlightSpecialty !== "All" &&
    hospital.departments.some((d) =>
      d.toLowerCase().includes(highlightSpecialty.toLowerCase())
    );

  // Compute real road distance & ETA using active user location or loggedInPatient coordinates
  const currentPatLat = patientLocation?.lat || activeUserLoc?.lat || loggedInPatient?.lat || 19.8451;
  const currentPatLng = patientLocation?.lng || activeUserLoc?.lng || loggedInPatient?.lng || 73.9961;
  const hospLat = hospital.lat || 19.5761;
  const hospLng = hospital.lng || 74.2072;

  const distanceResult = calculateRoadDistanceAndEta(
    { lat: currentPatLat, lng: currentPatLng },
    { lat: hospLat, lng: hospLng }
  );

  const displayDistanceKm = distanceResult.distanceKm;
  const displayEtaMins = distanceResult.etaMins;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentPatLat},${currentPatLng}&destination=${hospLat},${hospLng}&travelmode=driving`;

  return (
    <div
      onClick={() => onSelect(hospital)}
      className={`bg-white/95 rounded-3xl p-5 border transition-all duration-300 cursor-pointer group flex flex-col justify-between ${
        hasHighlightedSpecialty
          ? "border-[#7C5CFC] ring-2 ring-[#7C5CFC]/25 shadow-lg shadow-[#7C5CFC]/10 bg-gradient-to-b from-[#F4F0FF] to-white"
          : "border-[#E2D9FF] hover:border-[#7C5CFC] hover:shadow-xl hover:shadow-[#7C5CFC]/15 hover:-translate-y-1"
      }`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start gap-4 mb-3">
          <img
            src={
              hospital.logoUrl ||
              "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&q=80"
            }
            alt={hospital.name}
            className="w-16 h-16 rounded-2xl object-cover border border-[#E2D9FF] shadow-xs shrink-0 group-hover:scale-105 transition-transform"
          />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> {t("governmentVerified", "Govt Verified")}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {hospital.hospitalType}
              </span>
            </div>

            <h3 className="font-bold text-[#1C1B1F] text-base font-serif group-hover:text-[#7C5CFC] transition-colors truncate">
              {hospital.name}
            </h3>

            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#7C5CFC] shrink-0" />
              {hospital.address || `${hospital.city}, ${hospital.state}`}
            </p>
          </div>
        </div>

        {/* Real-time Google Maps Distance & ETA Banner */}
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200/80 rounded-2xl p-2.5 mb-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#7C5CFC] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Navigation className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-[#23125E] text-xs block">
                {displayDistanceKm} km away
              </span>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-600" /> ~{displayEtaMins} mins driving
              </span>
            </div>
          </div>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="bg-white hover:bg-purple-100 text-[#7C5CFC] border border-purple-200 text-[11px] font-extrabold px-2.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1 transition-all cursor-pointer hover:scale-105"
            title="Open turn-by-turn navigation in Google Maps"
          >
            Directions <Navigation className="w-3 h-3" />
          </a>
        </div>

        {/* Highlight Banner if matching AI Specialty */}

        {/* Highlight Banner if matching AI Specialty */}
        {hasHighlightedSpecialty && (
          <div className="bg-[#EAE5FF] border border-[#E2D9FF] rounded-xl px-3 py-1.5 text-xs text-[#23125E] font-medium mb-3 flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-[#7C5CFC] shrink-0" />
            <span>
              Matches query: <strong className="font-bold">{highlightSpecialty}</strong>
            </span>
          </div>
        )}

        {/* Stats Pills Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4 bg-[#F4F0FF]/80 p-2.5 rounded-2xl border border-[#E2D9FF] text-center">
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">{t("consultationFee", "OPD Fee")}</span>
            <span className="font-bold text-[#7C5CFC] text-xs">₹{hospital.expenses.opdFee}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">{t("bedsAvailable", "Beds Free")}</span>
            <span className="font-bold text-emerald-700 text-xs">
              {totalBedsAvail}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Rating</span>
            <span className="font-extrabold text-amber-600 text-xs flex items-center justify-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> {displayRating}
              {ratingStats.totalReviews > 0 && (
                <span className="text-[10px] text-slate-500 font-normal">({ratingStats.totalReviews})</span>
              )}
            </span>
          </div>
        </div>

        {/* Facilities Chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {hospital.facilities.slice(0, 5).map((fac) => (
            <span
              key={fac.id}
              className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-lg border border-slate-200/60"
            >
              {fac.name} ({fac.count})
            </span>
          ))}
          {hospital.facilities.length > 5 && (
            <span className="bg-[#EAE5FF] text-[#23125E] text-[10px] font-bold px-2 py-0.5 rounded-lg border border-[#E2D9FF]">
              +{hospital.facilities.length - 5}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-3 border-t border-[#E2D9FF]/60 flex items-center justify-between mt-2">
        <a
          href={`tel:${hospital.emergencyContact}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-red-600 font-semibold flex items-center gap-1 hover:underline"
        >
          <Phone className="w-3.5 h-3.5" /> Emergency
        </a>

        <button className="bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] group-hover:from-[#6949F2] group-hover:to-[#5635E0] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-[#7C5CFC]/20 transition-all flex items-center gap-1 cursor-pointer min-h-[44px]">
          {t("bookConsultation", "Book Consultation")} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
