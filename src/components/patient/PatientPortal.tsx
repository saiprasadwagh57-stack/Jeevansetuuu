import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { useLocation } from "../../context/LocationContext";
import { HospitalProfile } from "../../types";
import { SymptomCheckerWidget } from "./SymptomCheckerWidget";
import { HospitalCard } from "./HospitalCard";
import { HospitalDetailModal } from "./HospitalDetailModal";
import { PatientAppointments } from "./PatientAppointments";
import { PatientReports } from "./PatientReports";
import { PatientReviewModal } from "./PatientReviewModal";
import { PatientAuthModal } from "./PatientAuthModal";
import { PatientProfileModal } from "./PatientProfileModal";
import { LocationMapPickerModal } from "../common/LocationMapPickerModal";
import { LiveLocationBadge } from "../location/LiveLocationBadge";
import { LiveHospitalMap } from "../location/LiveHospitalMap";
import { LocationHealthCheckPanel } from "../location/LocationHealthCheckPanel";
import { calculateRoadDistanceAndEta } from "../../utils/location";
import { Appointment } from "../../types";
import {
  Building2,
  Search,
  Filter,
  ShieldCheck,
  Calendar,
  FileText,
  SlidersHorizontal,
  Stethoscope,
  Sparkles,
  User,
  LogOut,
  LogIn,
  UserPlus,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Star,
  ChevronDown,
  Settings,
  Edit2,
  MapPin,
  Navigation,
  Compass,
  Clock,
  Map as MapIcon,
} from "lucide-react";

export const PatientPortal: React.FC = () => {
  const {
    hospitals,
    symptomFilter,
    setSymptomFilter,
    selectedSpecialtyFilter,
    setSelectedSpecialtyFilter,
    loggedInPatient,
    patientLogin,
    registerPatient,
    logoutPatient,
    appointments,
    getHospitalRatingStats,
    updatePatientProfile,
    patientPortalTab: activeTab,
    setPatientPortalTab: setActiveTab,
    authModalOpen,
    setAuthModalOpen,
    authMode,
    setAuthMode,
    profileModalOpen,
    setProfileModalOpen,
    t,
  } = useApp();

  const { location, locationError } = useLocation();

  const [selectedHospital, setSelectedHospital] = useState<HospitalProfile | null>(null);
  const [sortBy, setSortBy] = useState<"rating" | "distance" | "beds">("distance");
  const [distanceMaxFilter, setDistanceMaxFilter] = useState<string>("all");
  const [pendingReviewApt, setPendingReviewApt] = useState<Appointment | null>(null);
  const [showInteractiveMap, setShowInteractiveMap] = useState<boolean>(true);

  // Patient Profile Modal Edit State
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileModalEdit, setProfileModalEdit] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  // Real-time location coordinates from LocationContext
  const patLat = location.lat;
  const patLng = location.lng;
  const patAddress = location.formattedAddress;

  // ONLY verified hospitals appear on the Patient Portal!
  const verifiedHospitals = hospitals.filter((h) => h.verificationStatus === "verified");

  // Compute road distances for all verified hospitals using active user GPS / manual location
  const hospitalsWithDistance = verifiedHospitals.map((h) => {
    const hLat = typeof h.lat === "number" && !isNaN(h.lat) && h.lat !== 0 ? h.lat : 19.5761;
    const hLng = typeof h.lng === "number" && !isNaN(h.lng) && h.lng !== 0 ? h.lng : 74.2072;
    const res = calculateRoadDistanceAndEta(
      { lat: patLat, lng: patLng },
      { lat: hLat, lng: hLng }
    );
    return {
      ...h,
      computedDistanceKm: res.distanceKm,
      computedEtaMins: res.etaMins,
    };
  });

  // Search, specialty, and distance filter logic
  const filteredHospitals = hospitalsWithDistance.filter((h) => {
    // Specialty match
    const matchesSpecialty =
      selectedSpecialtyFilter === "All" ||
      h.departments.some((d) =>
        d.toLowerCase().includes(selectedSpecialtyFilter.toLowerCase())
      );

    // Distance match
    let matchesDistance = true;
    if (distanceMaxFilter !== "all") {
      const maxKm = parseFloat(distanceMaxFilter);
      matchesDistance = h.computedDistanceKm <= maxKm;
    }

    // Text search match
    const query = symptomFilter.toLowerCase().trim();
    const matchesQuery =
      !query ||
      h.name.toLowerCase().includes(query) ||
      h.city.toLowerCase().includes(query) ||
      h.departments.some((d) => d.toLowerCase().includes(query)) ||
      h.facilities.some((f) => f.name.toLowerCase().includes(query));

    return matchesSpecialty && matchesDistance && matchesQuery;
  });

  // Check for unreviewed completed appointments for current patient or mobile
  const unreviewedCompletedApts = appointments.filter((apt) => {
    if (apt.status !== "completed" || apt.reviewSubmitted) return false;
    if (loggedInPatient) {
      return apt.patientMobile === loggedInPatient.mobile || apt.patientName === loggedInPatient.fullName;
    }
    return true; // if guest, show if there is any completed appointment needing review
  });

  // Sorting logic based on Rule 11: Verified Hospital Ranking
  const sortedHospitals = [...filteredHospitals].sort((a, b) => {
    const statsA = getHospitalRatingStats(a.id);
    const statsB = getHospitalRatingStats(b.id);

    const ratingA = statsA.totalReviews > 0 ? statsA.avgRating : (a.rating || 4.5);
    const ratingB = statsB.totalReviews > 0 ? statsB.avgRating : (b.rating || 4.5);

    if (sortBy === "distance") {
      // Sort strictly by real-time calculated distance
      return a.computedDistanceKm - b.computedDistanceKm;
    }

    if (sortBy === "rating") {
      // 1. Higher average hospital rating
      if (ratingB !== ratingA) return ratingB - ratingA;
      // 2. Higher number of reviews
      if (statsB.totalReviews !== statsA.totalReviews) return statsB.totalReviews - statsA.totalReviews;
      // 3. Distance from patient
      if (a.computedDistanceKm !== b.computedDistanceKm) return a.computedDistanceKm - b.computedDistanceKm;
      // 4. Availability of beds
      const aBeds = a.beds.icuAvailable + a.beds.generalAvailable;
      const bBeds = b.beds.icuAvailable + b.beds.generalAvailable;
      return bBeds - aBeds;
    }

    if (sortBy === "beds") {
      const aBeds = a.beds.icuAvailable + a.beds.generalAvailable;
      const bBeds = b.beds.icuAvailable + b.beds.generalAvailable;
      return bBeds - aBeds;
    }
    return 0;
  });

  // Extract all unique specialties for the dropdown filter
  const allSpecialties = Array.from(
    new Set(verifiedHospitals.flatMap((h) => h.departments))
  ).sort();

  return (
    <div className="space-y-8 pb-safe-bottom md:pb-16">
      {/* AI Symptom Checker Header Widget */}
      <SymptomCheckerWidget />

      {/* Review Request Trigger Banner for Completed Appointments */}
      {unreviewedCompletedApts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-4 rounded-2xl shadow-md border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm font-serif">Appointment Completed! Rate Your Experience</h4>
              <p className="text-xs text-amber-100">
                You recently completed a consultation with <strong>{unreviewedCompletedApts[0].doctorName}</strong> at <strong>{unreviewedCompletedApts[0].hospitalName}</strong>. Please share your rating.
              </p>
            </div>
          </div>
          <button
            onClick={() => setPendingReviewApt(unreviewedCompletedApts[0])}
            className="bg-white text-amber-800 hover:bg-amber-50 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all whitespace-nowrap cursor-pointer shrink-0"
          >
            ⭐ Share Review Now
          </button>
        </div>
      )}

      {/* Main Patient Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/90 backdrop-blur-xl p-3 rounded-2xl border border-[#E2D9FF] shadow-xs">
        <div className="flex items-center gap-2">
          {[
            { id: "browse", label: t("findHospitalsTab", "Find Verified Hospitals"), icon: <Building2 className="w-4 h-4" /> },
            { id: "appointments", label: t("myAppointmentsTab", "My Appointments"), icon: <Calendar className="w-4 h-4" /> },
            { id: "reports", label: t("myReportsTab", "My Medical Reports"), icon: <FileText className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] text-white shadow-md shadow-[#7C5CFC]/25"
                  : "text-slate-600 hover:bg-[#F4F0FF] hover:text-[#7C5CFC]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {loggedInPatient ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 bg-white hover:bg-purple-50/80 p-1.5 pr-4 rounded-full border border-purple-200 shadow-sm transition-all cursor-pointer"
              >
                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-purple-100 border border-[#7C5CFC] flex items-center justify-center shrink-0">
                  {loggedInPatient.profilePhoto ? (
                    <img
                      src={loggedInPatient.profilePhoto}
                      alt={loggedInPatient.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-extrabold text-xs text-[#7C5CFC]">
                      {loggedInPatient.fullName.charAt(0)}
                    </span>
                  )}
                  <span
                    className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white"
                    title="Online"
                  />
                </div>

                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900">{loggedInPatient.fullName}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" title="Online" />
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Age: {loggedInPatient.age} | 📱 +91 {loggedInPatient.mobile}
                  </span>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                    profileDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-purple-100 rounded-2xl shadow-xl z-50 p-2 space-y-1">
                  <div className="p-3 bg-purple-50/70 rounded-xl mb-1 border border-purple-100/80">
                    <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider block">
                      Logged in Patient
                    </span>
                    <span className="font-extrabold text-xs text-slate-900 block truncate">
                      {loggedInPatient.fullName}
                    </span>
                    <span className="text-[10px] text-slate-500 block">📱 {loggedInPatient.mobile}</span>
                  </div>

                  <button
                    onClick={() => {
                      setProfileModalOpen(true);
                      setProfileModalEdit(false);
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-[#7C5CFC] rounded-xl transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-purple-600" /> My Profile
                  </button>

                  <button
                    onClick={() => {
                      setProfileModalOpen(true);
                      setProfileModalEdit(true);
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-[#7C5CFC] rounded-xl transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4 text-purple-600" /> Edit Profile
                  </button>

                  <button
                    onClick={() => {
                      alert("Account Preferences & Privacy settings active for " + loggedInPatient.fullName);
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-[#7C5CFC] rounded-xl transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-purple-600" /> Settings
                  </button>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        logoutPatient();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-600" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthMode("login");
                setAuthModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] text-white font-extrabold text-xs hover:from-[#6949F2] hover:to-[#5635E0] transition-all cursor-pointer shadow-md shadow-[#7C5CFC]/25 transform active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              {t("patientLoginTitle", "Patient Login / Register")}
            </button>
          )}

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Strict Admin Approval Gate Active
          </span>
        </div>
      </div>

      {/* TAB 1: BROWSE HOSPITALS */}
      {activeTab === "browse" && (
        <div className="space-y-6">
          {/* Live Location Badge */}
          <LiveLocationBadge />

          {/* Location Health & Diagnostics Panel */}
          <LocationHealthCheckPanel hospitals={verifiedHospitals} patientLat={patLat} patientLng={patLng} />

          {/* Location Error / Notice Banner if any */}
          {locationError && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-center gap-3 text-xs text-amber-900 font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{locationError}</span>
            </div>
          )}

          {/* Interactive Live Google / Leaflet Map Container */}
          {verifiedHospitals.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapIcon className="w-4 h-4 text-[#7C5CFC]" />
                  Live Map View (Nearby Hospitals)
                </span>

                <button
                  onClick={() => setShowInteractiveMap(!showInteractiveMap)}
                  className="text-xs font-extrabold text-[#7C5CFC] hover:underline cursor-pointer"
                >
                  {showInteractiveMap ? "Hide Interactive Map" : "Show Interactive Map"}
                </button>
              </div>

              {showInteractiveMap && (
                <LiveHospitalMap
                  userLat={patLat}
                  userLng={patLng}
                  userAddress={patAddress}
                  hospitals={sortedHospitals}
                  onSelectHospital={(h) => setSelectedHospital(h)}
                />
              )}
            </div>
          )}

          {/* Controls & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={symptomFilter}
                onChange={(e) => setSymptomFilter(e.target.value)}
                placeholder="Search hospital, city, or specialty..."
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 pl-9 text-xs focus:ring-2 focus:ring-purple-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Specialty Dropdown & Distance Filter */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Stethoscope className="w-4 h-4 text-purple-600" />
                <span>Specialty:</span>
                <select
                  value={selectedSpecialtyFilter}
                  onChange={(e) => setSelectedSpecialtyFilter(e.target.value)}
                  className="bg-purple-50 border border-purple-200 text-purple-900 rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-purple-500"
                >
                  <option value="All">All Specialties ({allSpecialties.length})</option>
                  {allSpecialties.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Distance Range Filter */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Navigation className="w-4 h-4 text-purple-600" />
                <span>Radius:</span>
                <select
                  value={distanceMaxFilter}
                  onChange={(e) => setDistanceMaxFilter(e.target.value)}
                  className="bg-purple-50 border border-purple-200 text-purple-900 rounded-xl px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Distances</option>
                  <option value="2">Within 2 km</option>
                  <option value="5">Within 5 km</option>
                  <option value="10">Within 10 km</option>
                  <option value="25">Within 25 km</option>
                  <option value="50">Within 50 km</option>
                </select>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <SlidersHorizontal className="w-4 h-4 text-purple-600" />
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-100 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold"
                >
                  <option value="distance">Nearest Distance (GPS)</option>
                  <option value="rating">Top Rated</option>
                  <option value="beds">Most Available Beds</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid of Verified Hospital Cards */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg font-serif flex items-center gap-2">
                  Verified Hospitals ({sortedHospitals.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Sorted by <strong className="text-purple-700">{sortBy === "distance" ? "Nearest Distance (GPS)" : sortBy === "rating" ? "Top Rating" : "Available Beds"}</strong>
                </p>
              </div>

              {/* Radius Quick Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[11px] font-bold text-slate-500 shrink-0">Radius:</span>
                {[
                  { label: "All", val: "all" },
                  { label: "5 km", val: "5" },
                  { label: "10 km", val: "10" },
                  { label: "20 km", val: "20" },
                  { label: "50 km", val: "50" },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setDistanceMaxFilter(item.val)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      distanceMaxFilter === item.val
                        ? "bg-[#7C5CFC] text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {verifiedHospitals.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 border border-[#E2D9FF] text-center text-slate-500 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-[#F4F0FF] text-[#7C5CFC] border border-[#E2D9FF] flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8" />
                </div>
                <h4 className="font-extrabold text-[#23125E] text-lg font-serif">
                  No hospitals have been registered yet
                </h4>
                <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                  Verified medical centers will appear here once submitted through the Hospital Registration portal and authenticated by Government Admin.
                </p>
              </div>
            ) : sortedHospitals.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 border border-[#E2D9FF] text-center text-slate-500 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-[#F4F0FF] text-[#7C5CFC] border border-[#E2D9FF] flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8" />
                </div>
                <h4 className="font-extrabold text-[#23125E] text-lg font-serif">
                  No verified hospitals match your search query
                </h4>
                <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                  Try clearing your search terms or selecting a different specialty filter.
                </p>
                <button
                  onClick={() => {
                    setSymptomFilter("");
                    setSelectedSpecialtyFilter("All");
                  }}
                  className="mt-5 bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-md shadow-[#7C5CFC]/20 hover:from-[#6949F2] hover:to-[#5635E0] cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedHospitals.map((hosp) => (
                  <HospitalCard
                    key={hosp.id}
                    hospital={hosp}
                    onSelect={(h) => setSelectedHospital(h)}
                    highlightSpecialty={selectedSpecialtyFilter}
                    patientLocation={{ lat: patLat, lng: patLng }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: APPOINTMENTS */}
      {activeTab === "appointments" && <PatientAppointments />}

      {/* TAB 3: REPORTS */}
      {activeTab === "reports" && <PatientReports />}

      {/* Hospital Detail Modal */}
      {selectedHospital && (
        <HospitalDetailModal
          hospital={selectedHospital}
          onClose={() => setSelectedHospital(null)}
        />
      )}

      {/* Patient Auth Modal */}
      <PatientAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* Patient Profile Modal */}
      <PatientProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        initialEditing={profileModalEdit}
      />

      {/* Location Map Picker Modal for Quick Search Location Change */}
      <LocationMapPickerModal
        isOpen={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        initialLat={patLat}
        initialLng={patLng}
        initialAddress={patAddress}
        title="Pin Your Patient Home Location on Google Map"
        onConfirmLocation={(loc) => {
          if (loggedInPatient) {
            updatePatientProfile({
              address: loc.address,
              lat: loc.lat,
              lng: loc.lng,
              googleMapsUrl: loc.googleMapsUrl || `https://maps.google.com/?q=${loc.lat},${loc.lng}`,
            });
          }
        }}
      />

      {pendingReviewApt && (
        <PatientReviewModal
          appointment={pendingReviewApt}
          isOpen={!!pendingReviewApt}
          onClose={() => setPendingReviewApt(null)}
        />
      )}
    </div>
  );
};
