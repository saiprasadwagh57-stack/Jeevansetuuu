import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { useLocation } from "../../context/LocationContext";
import { UserRole } from "../../types";
import { GoogleDriveVaultModal } from "../GoogleDriveVaultModal";
import {
  Building2,
  Calendar,
  FileText,
  User,
  LayoutGrid,
  HeartHandshake,
  ShieldCheck,
  Stethoscope,
  PhoneCall,
  HardDrive,
  Globe,
  MapPin,
  X,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Home,
  LogOut,
  UserPlus,
  LogIn,
} from "lucide-react";

export const MobileBottomNav: React.FC = () => {
  const {
    activeRole,
    setActiveRole,
    patientPortalTab,
    setPatientPortalTab,
    loggedInPatient,
    setAuthModalOpen,
    setAuthMode,
    setProfileModalOpen,
    appointments,
    reports,
    hospitals,
    language,
    setLanguage,
    t,
  } = useApp();

  const { location, requestLocation, isLocating } = useLocation();

  const [isPortalSheetOpen, setIsPortalSheetOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  // Compute patient-specific appointments count
  const patientAppointmentsCount = appointments.filter((apt) => {
    if (loggedInPatient) {
      return apt.patientMobile === loggedInPatient.mobile || apt.patientName === loggedInPatient.fullName;
    }
    return apt.status === "scheduled" || apt.status === "confirmed";
  }).length;

  // Compute patient-specific reports count
  const patientReportsCount = reports.filter((rep) => {
    if (loggedInPatient) {
      return rep.patientMobile === loggedInPatient.mobile || rep.patientName === loggedInPatient.fullName;
    }
    return true;
  }).length;

  // Pending admin verification count
  const pendingVerificationsCount = hospitals.filter((h) => h.verificationStatus === "pending").length;

  const portalsList: {
    id: UserRole;
    title: string;
    description: string;
    icon: React.ReactNode;
    badge?: number;
    accentColor: string;
  }[] = [
    {
      id: "patient",
      title: t("patientPortal", "Patient Portal"),
      description: "Search Hospitals, GPS Distance, Appointments & Reports",
      icon: <HeartHandshake className="w-5 h-5 text-[#7C5CFC]" />,
      accentColor: "from-[#7C5CFC] to-[#6848F0]",
    },
    {
      id: "hospital_reg",
      title: t("hospitalRegistration", "Hospital Registration"),
      description: "Register Rural & Urban Medical Centers with GPS Pinning",
      icon: <Building2 className="w-5 h-5 text-indigo-600" />,
      accentColor: "from-indigo-600 to-blue-600",
    },
    {
      id: "hospital_mgmt",
      title: t("hospitalManagement", "Hospital Management"),
      description: "Staff Hub, Doctor Roster, ICU/General Beds, Expenses & Analytics",
      icon: <Stethoscope className="w-5 h-5 text-emerald-600" />,
      accentColor: "from-emerald-600 to-teal-700",
    },
    {
      id: "admin",
      title: t("adminPortal", "Govt Admin Portal"),
      description: "Admin Hospital Approvals, Document Verification & Reviews",
      icon: <ShieldCheck className="w-5 h-5 text-purple-700" />,
      badge: pendingVerificationsCount > 0 ? pendingVerificationsCount : undefined,
      accentColor: "from-[#23125E] to-[#3B1F8C]",
    },
  ];

  const handlePortalSwitch = (role: UserRole) => {
    setActiveRole(role);
    setIsPortalSheetOpen(false);
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePatientTabClick = (tab: "browse" | "appointments" | "reports") => {
    if (activeRole !== "patient") {
      setActiveRole("patient");
    }
    setPatientPortalTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProfileClick = () => {
    if (loggedInPatient) {
      setProfileModalOpen(true);
    } else {
      setAuthMode("login");
      setAuthModalOpen(true);
    }
  };

  return (
    <>
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          STICKY MOBILE BOTTOM NAVIGATION BAR (md:hidden only)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <nav
        id="mobile-bottom-portal-bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-[#E2D9FF] px-2 py-1.5 shadow-[0_-4px_25px_rgba(35,18,94,0.08)] pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
        aria-label="Mobile Navigation"
      >
        {activeRole === "patient" ? (
          /* PATIENT PORTAL BOTTOM NAVIGATION (5 Primary Actions) */
          <div className="grid grid-cols-5 items-center gap-1 max-w-lg mx-auto">
            {/* 1. Hospitals / Browse */}
            <button
              id="mobile-nav-hospitals"
              onClick={() => handlePatientTabClick("browse")}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer select-none active:scale-95 min-h-[48px] ${
                patientPortalTab === "browse"
                  ? "bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] text-white shadow-md shadow-[#7C5CFC]/30"
                  : "text-slate-600 hover:text-[#23125E] hover:bg-[#F4F0FF]"
              }`}
            >
              <Building2 className={`w-4.5 h-4.5 shrink-0 ${patientPortalTab === "browse" ? "text-white" : "text-slate-600"}`} />
              <span className="text-[10px] font-extrabold mt-0.5 tracking-tight truncate max-w-full">
                {t("hospitals", "Hospitals")}
              </span>
            </button>

            {/* 2. Appointments */}
            <button
              id="mobile-nav-appointments"
              onClick={() => handlePatientTabClick("appointments")}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer select-none active:scale-95 min-h-[48px] ${
                patientPortalTab === "appointments"
                  ? "bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] text-white shadow-md shadow-[#7C5CFC]/30"
                  : "text-slate-600 hover:text-[#23125E] hover:bg-[#F4F0FF]"
              }`}
            >
              {patientAppointmentsCount > 0 && (
                <span className={`absolute top-1 right-2 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold leading-none ${
                  patientPortalTab === "appointments" ? "bg-amber-300 text-slate-950" : "bg-red-500 text-white"
                }`}>
                  {patientAppointmentsCount}
                </span>
              )}
              <Calendar className={`w-4.5 h-4.5 shrink-0 ${patientPortalTab === "appointments" ? "text-white" : "text-slate-600"}`} />
              <span className="text-[10px] font-extrabold mt-0.5 tracking-tight truncate max-w-full">
                {t("appointments", "Bookings")}
              </span>
            </button>

            {/* 3. Reports */}
            <button
              id="mobile-nav-reports"
              onClick={() => handlePatientTabClick("reports")}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer select-none active:scale-95 min-h-[48px] ${
                patientPortalTab === "reports"
                  ? "bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] text-white shadow-md shadow-[#7C5CFC]/30"
                  : "text-slate-600 hover:text-[#23125E] hover:bg-[#F4F0FF]"
              }`}
            >
              {patientReportsCount > 0 && (
                <span className={`absolute top-1 right-2 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold leading-none ${
                  patientPortalTab === "reports" ? "bg-emerald-300 text-slate-950" : "bg-emerald-600 text-white"
                }`}>
                  {patientReportsCount}
                </span>
              )}
              <FileText className={`w-4.5 h-4.5 shrink-0 ${patientPortalTab === "reports" ? "text-white" : "text-slate-600"}`} />
              <span className="text-[10px] font-extrabold mt-0.5 tracking-tight truncate max-w-full">
                {t("reports", "Reports")}
              </span>
            </button>

            {/* 4. Patient Profile / Auth */}
            <button
              id="mobile-nav-profile"
              onClick={handleProfileClick}
              className="flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-slate-600 hover:text-[#23125E] hover:bg-[#F4F0FF] transition-all cursor-pointer select-none active:scale-95 min-h-[48px]"
            >
              {loggedInPatient ? (
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#6848F0] text-white flex items-center justify-center text-[10px] font-black shadow-xs shrink-0">
                  {loggedInPatient.fullName.charAt(0).toUpperCase()}
                </div>
              ) : (
                <User className="w-4.5 h-4.5 text-slate-600 shrink-0" />
              )}
              <span className="text-[10px] font-bold mt-0.5 tracking-tight truncate max-w-full">
                {loggedInPatient ? loggedInPatient.fullName.split(" ")[0] : t("login", "Profile")}
              </span>
            </button>

            {/* 5. Portals Switcher Button */}
            <button
              id="mobile-nav-portals-switcher"
              onClick={() => setIsPortalSheetOpen(true)}
              className="relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-[#23125E] bg-[#F4F0FF] hover:bg-[#EAE5FF] border border-[#E2D9FF] transition-all cursor-pointer select-none active:scale-95 min-h-[48px]"
            >
              {pendingVerificationsCount > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              )}
              <LayoutGrid className="w-4.5 h-4.5 text-[#7C5CFC] shrink-0" />
              <span className="text-[10px] font-black text-[#23125E] mt-0.5 tracking-tight">
                Portals
              </span>
            </button>
          </div>
        ) : (
          /* NON-PATIENT PORTALS BOTTOM BAR (Hospital Reg / Mgmt / Admin) */
          <div className="grid grid-cols-4 items-center gap-1 max-w-lg mx-auto">
            {/* 1. Back to Patient Portal */}
            <button
              onClick={() => handlePortalSwitch("patient")}
              className="flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-slate-600 hover:text-[#23125E] hover:bg-[#F4F0FF] transition-all cursor-pointer select-none active:scale-95 min-h-[48px]"
            >
              <Home className="w-4.5 h-4.5 text-slate-600 shrink-0" />
              <span className="text-[10px] font-bold mt-0.5 tracking-tight">
                Patient View
              </span>
            </button>

            {/* 2. Active Portal Indicator */}
            <div className="flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] text-white shadow-md shadow-[#7C5CFC]/25 min-h-[48px]">
              {activeRole === "hospital_reg" && <Building2 className="w-4.5 h-4.5 shrink-0" />}
              {activeRole === "hospital_mgmt" && <Stethoscope className="w-4.5 h-4.5 shrink-0" />}
              {activeRole === "admin" && <ShieldCheck className="w-4.5 h-4.5 shrink-0" />}
              <span className="text-[10px] font-extrabold mt-0.5 tracking-tight truncate max-w-full">
                {activeRole === "hospital_reg" ? "Registration" : activeRole === "hospital_mgmt" ? "Management" : "Admin"}
              </span>
            </div>

            {/* 3. Switch Portals */}
            <button
              onClick={() => setIsPortalSheetOpen(true)}
              className="relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-[#23125E] bg-[#F4F0FF] hover:bg-[#EAE5FF] border border-[#E2D9FF] transition-all cursor-pointer select-none active:scale-95 min-h-[48px]"
            >
              {pendingVerificationsCount > 0 && (
                <span className="absolute top-1 right-2 px-1 py-0.2 rounded-full bg-red-500 text-white text-[8px] font-black">
                  {pendingVerificationsCount}
                </span>
              )}
              <LayoutGrid className="w-4.5 h-4.5 text-[#7C5CFC] shrink-0" />
              <span className="text-[10px] font-black mt-0.5 tracking-tight">
                All Portals
              </span>
            </button>

            {/* 4. Emergency Direct Call */}
            <a
              href="tel:108"
              className="flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all select-none active:scale-95 min-h-[48px]"
            >
              <PhoneCall className="w-4.5 h-4.5 text-red-600 animate-pulse shrink-0" />
              <span className="text-[10px] font-black mt-0.5 tracking-tight">
                Emergency
              </span>
            </a>
          </div>
        )}
      </nav>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MOBILE PORTAL SWITCHER BOTTOM SHEET MODAL
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {isPortalSheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setIsPortalSheetOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          />

          {/* Bottom Sheet Modal Container */}
          <div className="relative z-10 w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl border-t border-[#E2D9FF] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            {/* Drag Handle Bar */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 mb-1 shrink-0" />

            {/* Sheet Header */}
            <div className="p-4 border-b border-[#E2D9FF] flex items-center justify-between bg-gradient-to-r from-[#23125E] via-[#3B1F8C] to-[#7C5CFC] text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-inner">
                  <HeartHandshake className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight font-serif flex items-center gap-1.5">
                    Jeevan Setu
                    <span className="text-[10px] font-sans px-2 py-0.2 rounded-full bg-white/20 text-white font-bold">
                      Portals Hub
                    </span>
                  </h3>
                  <p className="text-[10.5px] text-purple-200">
                    Switch portals or launch healthcare utilities
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPortalSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="Close portal sheet"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Sheet Scrollable Body */}
            <div className="p-4 overflow-y-auto space-y-4 max-h-[60vh]">
              {/* Section 1: All 4 Jeevan Setu Portals */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Select Jeevan Setu Portal
                  </span>
                  <span className="text-[10px] text-[#7C5CFC] font-bold">
                    Active: {activeRole.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {portalsList.map((portal) => {
                    const isActive = activeRole === portal.id;
                    return (
                      <button
                        key={portal.id}
                        onClick={() => handlePortalSwitch(portal.id)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isActive
                            ? "bg-gradient-to-r from-[#F4F0FF] to-[#EAE5FF] border-[#7C5CFC] shadow-sm ring-2 ring-[#7C5CFC]/20"
                            : "bg-white hover:bg-slate-50 border-[#E2D9FF]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                              isActive
                                ? "bg-[#7C5CFC] text-white shadow-md shadow-[#7C5CFC]/30"
                                : "bg-[#F4F0FF] text-[#23125E] border border-[#E2D9FF]"
                            }`}
                          >
                            {portal.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-xs text-[#23125E] truncate">
                                {portal.title}
                              </h4>
                              {isActive && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full bg-[#7C5CFC] text-white text-[9px] font-black">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> Current
                                </span>
                              )}
                              {portal.badge !== undefined && portal.badge > 0 && (
                                <span className="px-2 py-0.2 rounded-full bg-red-500 text-white text-[9px] font-black animate-pulse">
                                  {portal.badge} Pending
                                </span>
                              )}
                            </div>
                            <p className="text-[10.5px] text-slate-500 truncate mt-0.5 font-medium">
                              {portal.description}
                            </p>
                          </div>
                        </div>

                        <ChevronRight className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-[#7C5CFC]" : "text-slate-400"}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Quick Mobile Healthcare Tools */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Quick Mobile Health Tools
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {/* Google Drive Vault */}
                  <button
                    onClick={() => {
                      setIsDriveModalOpen(true);
                      setIsPortalSheetOpen(false);
                    }}
                    className="p-3 rounded-2xl bg-[#FEF7FF] hover:bg-[#F4F0FF] border border-[#D0BCFF] text-left transition-all cursor-pointer flex flex-col justify-between min-h-[72px]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-1.5 rounded-xl bg-[#EADDFF] text-[#6750A4]">
                        <HardDrive className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-bold bg-purple-100 text-[#6750A4] px-1.5 py-0.2 rounded-md">
                        Vault
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-[#23125E] mt-1 block">
                      Google Drive Vault
                    </span>
                  </button>

                  {/* 24x7 Emergency Helpline */}
                  <a
                    href="tel:108"
                    className="p-3 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-left transition-all flex flex-col justify-between min-h-[72px]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-1.5 rounded-xl bg-red-500 text-white">
                        <PhoneCall className="w-4 h-4 animate-pulse" />
                      </div>
                      <span className="text-[9px] font-bold bg-red-200 text-red-800 px-1.5 py-0.2 rounded-md">
                        24×7
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-red-900 block">
                        Emergency 108
                      </span>
                    </div>
                  </a>
                </div>

                {/* Language Switcher Bar */}
                <div className="p-3 rounded-2xl bg-[#F4F0FF] border border-[#E2D9FF] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#7C5CFC]" />
                    <span className="text-xs font-bold text-[#23125E]">Language:</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(["en", "hi", "mr"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          language === lang
                            ? "bg-[#7C5CFC] text-white shadow-xs"
                            : "bg-white text-slate-700 hover:bg-purple-100"
                        }`}
                      >
                        {lang === "en" ? "EN" : lang === "hi" ? "हिंदी" : "मराठी"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* GPS Location Info */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 block">Your GPS Location</span>
                      <p className="text-xs font-extrabold text-slate-800 truncate">
                        {location.city || "Sinnar, Nashik"} ({location.lat.toFixed(3)}, {location.lng.toFixed(3)})
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => requestLocation()}
                    disabled={isLocating}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-300 rounded-xl text-[10px] font-bold text-emerald-700 cursor-pointer shrink-0"
                  >
                    {isLocating ? "Updating..." : "Refresh GPS"}
                  </button>
                </div>
              </div>
            </div>

            {/* Sheet Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center shrink-0">
              <p className="text-[10px] text-slate-500 font-medium">
                Jeevan Setu Unified Healthcare Network © 2026
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Google Drive Health Vault Modal */}
      <GoogleDriveVaultModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
      />
    </>
  );
};
