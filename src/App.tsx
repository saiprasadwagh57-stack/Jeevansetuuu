import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { LocationProvider } from "./context/LocationContext";
import { Navbar } from "./components/Navbar";
import { PatientPortal } from "./components/patient/PatientPortal";
import { HospitalRegistrationPage } from "./components/hospitalReg/HospitalRegistrationPage";
import { HospitalManagementPortal } from "./components/hospitalMgmt/HospitalManagementPortal";
import { DoctorPortal } from "./components/doctor/DoctorPortal";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { FloatingAssistant } from "./components/FloatingAssistant";
import { MedicalBackgroundDecor } from "./components/MedicalBackgroundDecor";
import { LocationPermissionModal } from "./components/location/LocationPermissionModal";
import { ManualAddressModal } from "./components/location/ManualAddressModal";
import { ChangeLocationModal } from "./components/location/ChangeLocationModal";
import { MobileBottomNav } from "./components/navigation/MobileBottomNav";
import { HeartPulse, ShieldCheck, Stethoscope } from "lucide-react";

const MainContent: React.FC = () => {
  const { activeRole } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {activeRole === "patient" && <PatientPortal />}
      {activeRole === "hospital_reg" && <HospitalRegistrationPage />}
      {activeRole === "hospital_mgmt" && <HospitalManagementPortal />}
      {activeRole === "admin" && <AdminDashboard />}
    </main>
  );
};

const FooterContent: React.FC = () => {
  const { t } = useApp();
  return (
    <footer className="bg-[#21005D] text-[#EADDFF] border-t border-[#6750A4]/20 py-8 text-xs mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#6750A4] text-white flex items-center justify-center font-bold shadow-sm">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-sm">{t("footerTitle", "Jeevan Setu (जीवन सेतु)")}</span>
            <p className="text-[10px] text-[#EADDFF]/80">{t("footerTagline", "Unified Healthcare & Hospital Trust Ecosystem")}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[#EADDFF]/90">
          <span className="flex items-center gap-1.5 bg-[#6750A4]/30 px-3 py-1 rounded-full border border-[#6750A4]/40">
            <ShieldCheck className="w-3.5 h-3.5 text-[#EADDFF]" /> {t("adminAuthActive", "Government Admin Auth Active")}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 bg-[#6750A4]/30 px-3 py-1 rounded-full border border-[#6750A4]/40">
            <Stethoscope className="w-3.5 h-3.5 text-[#EADDFF]" /> {t("aiTriagingEnabled", "AI Symptom Triaging Enabled")}
          </span>
        </div>

        <p className="text-[#EADDFF]/60 text-[11px]">
          © {new Date().getFullYear()} {t("copyright", "Jeevan Setu Platform. Unified Healthcare System.")}
        </p>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <LocationProvider>
      <AppProvider>
        <div className="min-h-screen bg-[#FEF7FF] text-[#1C1B1F] font-sans flex flex-col justify-between selection:bg-[#EADDFF] selection:text-[#21005D] relative overflow-x-hidden">
          <MedicalBackgroundDecor />
          <div className="relative z-10">
            {/* Global Header & Navigation */}
            <Navbar />

            {/* Role View Portals */}
            <MainContent />
          </div>

          {/* Global Footer */}
          <div className="relative z-10">
            <FooterContent />
          </div>

          {/* Location Permission & Address Modals */}
          <LocationPermissionModal />
          <ManualAddressModal />
          <ChangeLocationModal />

          {/* Global Floating AI Healthcare Assistant */}
          <FloatingAssistant />

          {/* Master Mobile Bottom Portal Navigation Bar */}
          <MobileBottomNav />
        </div>
      </AppProvider>
    </LocationProvider>
  );
}

