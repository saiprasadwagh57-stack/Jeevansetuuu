import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { UserRole } from "../types";
import { LanguageSelector } from "./LanguageSelector";
import { GoogleDriveVaultModal } from "./GoogleDriveVaultModal";
import {
  HeartHandshake,
  User,
  Building2,
  ShieldCheck,
  RefreshCw,
  PhoneCall,
  Sparkles,
  HardDrive,
  Menu,
  X,
  Home,
  LogOut,
  UserCheck,
  ChevronRight,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { activeRole, setActiveRole, hospitals, resetDemoData, loggedInPatient, logoutPatient, t } = useApp();
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const pendingCount = hospitals.filter((h) => h.verificationStatus === "pending").length;

  const roles: { id: UserRole; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: "patient",
      label: t("patientPortal", "Patient Portal"),
      icon: <User className="w-4 h-4" />,
    },
    {
      id: "hospital_reg",
      label: t("hospitalRegistration", "Hospital Registration"),
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: "hospital_mgmt",
      label: t("hospitalManagement", "Hospital Management"),
      icon: <Building2 className="w-4 h-4 text-[#7C5CFC]" />,
    },
    {
      id: "admin",
      label: t("adminPortal", "Admin Portal"),
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
  ];

  const handleRoleSelect = (roleId: UserRole) => {
    setActiveRole(roleId);
    setIsMobileDrawerOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#E2D9FF] shadow-xs">
      {/* Top Banner - Rural Healthcare 24x7 Emergency Line */}
      <div className="bg-gradient-to-r from-[#23125E] via-[#3B1F8C] to-[#23125E] text-white text-xs px-3 sm:px-4 py-1.5 flex flex-wrap justify-between items-center gap-2 shadow-xs">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/25 text-red-200 border border-red-400/40 animate-pulse text-[10px] sm:text-[11px] font-semibold">
            <PhoneCall className="w-3 h-3 text-red-300 shrink-0" />
            <span className="hidden xs:inline">{t("emergencyHelpline", "24×7 Emergency Helpline")}:</span> 108 / +91 98230 99999
          </span>
          <span className="hidden md:inline text-[#EAE5FF]/90 text-[11px]">
            • {t("brandTagline", "Connecting Patients, Hospitals, Doctors & Govt Admin Verification")}
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Hamburger Menu & Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Hamburger Trigger */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="md:hidden p-2 rounded-2xl bg-[#F4F0FF] hover:bg-[#EAE5FF] text-[#23125E] border border-[#E2D9FF] transition-all cursor-pointer active:scale-95"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#7C5CFC] to-[#6848F0] flex items-center justify-center text-white shadow-md shadow-[#7C5CFC]/25 shrink-0">
              <HeartHandshake className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#1C1B1F]">
                  Jeevan<span className="text-[#7C5CFC]">Setu</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#EAE5FF] text-[#23125E] border border-[#E2D9FF]">
                  <Sparkles className="w-2.5 h-2.5 text-[#7C5CFC]" /> {t("aiVerified", "AI Verified")}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block font-medium">
                {t("brandTagline", "Connecting Patients, Hospitals, Doctors & Govt Admin Verification")}
              </p>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Navigation Portal Switcher Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F4F0FF] p-1.5 rounded-full border border-[#E2D9FF]">
            {roles.map((role) => {
              const isActive = activeRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] text-white shadow-md shadow-[#7C5CFC]/30"
                      : "text-slate-600 hover:text-[#1C1B1F] hover:bg-[#EAE5FF]"
                  }`}
                >
                  {role.icon}
                  <span>{role.label}</span>
                  {role.badge !== undefined && role.badge > 0 && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-[#EAE5FF] text-[#23125E]"
                          : "bg-[#7C5CFC] text-white"
                      }`}
                    >
                      {role.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Google Drive Vault Launcher */}
          <button
            onClick={() => setIsDriveModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#FEF7FF] hover:bg-[#F4F0FF] text-[#6750A4] border border-[#D0BCFF] hover:border-[#6750A4] font-bold text-xs px-2.5 py-2 sm:px-3 sm:py-2 rounded-full transition-all cursor-pointer shadow-2xs"
            title="Google Drive Health Vault"
          >
            <HardDrive className="w-4 h-4 text-[#6750A4]" />
            <span className="hidden sm:inline">Drive Vault</span>
          </button>

          {/* Global Language Selector */}
          <LanguageSelector />
        </div>
      </div>

      {/* FULL-HEIGHT MOBILE SLIDE-OVER DRAWER */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 border-r border-[#E2D9FF] animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="p-4 bg-gradient-to-r from-[#23125E] via-[#3B1F8C] to-[#7C5CFC] text-white flex items-center justify-between border-b border-purple-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <HeartHandshake className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight font-serif">Jeevan Setu</h3>
                  <p className="text-[10px] text-purple-200">Rural Healthcare Network</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Logged in User Badge */}
            {loggedInPatient && (
              <div className="p-3 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-[#7C5CFC] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {loggedInPatient.fullName.charAt(0)}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 truncate">{loggedInPatient.fullName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{loggedInPatient.mobile}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logoutPatient();
                    setIsMobileDrawerOpen(false);
                  }}
                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-100/50 text-xs font-semibold shrink-0"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Portal Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Select Portal
              </p>

              {roles.map((role) => {
                const isActive = activeRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] text-white shadow-md shadow-[#7C5CFC]/20"
                        : "bg-[#F4F0FF]/60 hover:bg-[#F4F0FF] text-slate-700 border border-[#E2D9FF]/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isActive ? "bg-white/20 text-white" : "bg-[#EAE5FF] text-[#7C5CFC]"}`}>
                        {role.icon}
                      </div>
                      <span>{role.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {role.badge !== undefined && role.badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-extrabold">
                          {role.badge}
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    </div>
                  </button>
                );
              })}

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  Health Tools
                </p>

                <button
                  onClick={() => {
                    setIsDriveModalOpen(true);
                    setIsMobileDrawerOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl text-xs font-bold bg-[#FEF7FF] text-[#6750A4] border border-[#D0BCFF] hover:bg-[#F4F0FF] transition-all"
                >
                  <div className="p-2 rounded-xl bg-[#EADDFF] text-[#6750A4]">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <span>Google Drive Health Vault</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
              <p className="text-[10px] text-slate-500 font-medium">Jeevan Setu Rural Network © 2026</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Verified Healthcare & Emergency Services</p>
            </div>
          </div>
        </div>
      )}

      {/* Google Drive Vault Modal */}
      <GoogleDriveVaultModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
      />
    </header>
  );
};


