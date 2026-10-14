import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { HospitalProfile } from "../../types";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Bed,
  FileText,
  IndianRupee,
  MapPin,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  Lock,
  Search,
  Filter,
  Users,
  Edit3,
  X,
  Sparkles,
  Star,
  Trash2,
  ShieldAlert,
  Check,
  Settings,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Database,
  Server,
  History,
  Terminal,
  Activity,
} from "lucide-react";

import { AUTHORIZED_ADMIN_EMAILS, ALLOWED_ADMIN_EMAILS } from "../../types";

export const AdminDashboard: React.FC = () => {
  const {
    hospitals,
    adminApproveHospital,
    adminRejectHospital,
    adminRequestChanges,
    loggedInAdmin,
    adminLogin,
    registerAdmin,
    logoutAdmin,
    reviews,
    updateReviewStatus,
    deleteReview,
    auditLogs,
    executeAdminSeedReset,
    t,
  } = useApp();

  // Admin Auth Form State
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    "pending" | "verified" | "rejected" | "changes" | "reviews_moderation" | "system_maintenance"
  >("pending");
  const [selectedHosp, setSelectedHosp] = useState<HospitalProfile | null>(null);

  // Modal states
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [changesModalOpen, setChangesModalOpen] = useState(false);
  const [changesNotes, setChangesNotes] = useState("");

  // Reset Seed Data Modal States
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0);
  const [resetInput, setResetInput] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [resetErrorMessage, setResetErrorMessage] = useState<string | null>(null);

  // Approval Modal with generated credentials
  const [approvedHospResult, setApprovedHospResult] = useState<HospitalProfile | null>(null);

  const pendingList = hospitals.filter((h) => h.verificationStatus === "pending");
  const verifiedList = hospitals.filter((h) => h.verificationStatus === "verified");
  const rejectedList = hospitals.filter((h) => h.verificationStatus === "rejected");
  const changesList = hospitals.filter((h) => h.verificationStatus === "changes_requested");

  // Email verification helper
  const cleanEmailInput = authEmail.trim().toLowerCase();
  const isEmailAuthorized =
    cleanEmailInput.length > 0 &&
    AUTHORIZED_ADMIN_EMAILS.some((e) => e.toLowerCase() === cleanEmailInput);

  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (authMode === "register") {
      if (!isEmailAuthorized) {
        setAuthError("Access Denied. This email is not registered as an administrator.");
        return;
      }
      if (authPassword !== confirmPassword) {
        setAuthError("Passwords do not match.");
        return;
      }
      const res = registerAdmin(authEmail, authPassword);
      if (!res.success) {
        setAuthError(res.error || "Admin registration failed.");
      }
    } else {
      const res = adminLogin(authEmail, authPassword);
      if (!res.success) {
        setAuthError(res.error || "Admin login failed.");
      }
    }
  };

  // If Admin is NOT logged in, render the Admin Authentication Page
  if (!loggedInAdmin) {
    return (
      <div className="max-w-xl mx-auto space-y-6 pb-16 animate-fadeIn">
        <div className="bg-gradient-to-br from-[#23125E] via-[#3B1F8C] to-[#7C5CFC] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-[#7C5CFC]/20 text-center space-y-3 relative overflow-hidden">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-300 to-amber-400 text-[#23125E] rounded-2xl flex items-center justify-center mx-auto shadow-lg animate-float">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-tight">
            {t("adminGatewayTitle", "Government & District Admin Gateway")}
          </h1>
          <p className="text-xs text-[#EAE5FF]/90 max-w-md mx-auto leading-relaxed">
            {t("adminGatewayDesc", "Strict Whitelist Enforced. Only authorized healthcare officials can access the hospital verification dashboard.")}
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-[#E2D9FF] shadow-lg shadow-[#7C5CFC]/5 space-y-6">
          <div className="flex bg-[#F4F0FF] p-1.5 rounded-2xl border border-[#E2D9FF]">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === "login"
                  ? "bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] text-white shadow-sm"
                  : "text-slate-600 hover:text-[#1C1B1F]"
              }`}
            >
              Admin Login
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("register");
                setAuthError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === "register"
                  ? "bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] text-white shadow-sm"
                  : "text-slate-600 hover:text-[#1C1B1F]"
              }`}
            >
              Admin Registration
            </button>
          </div>

          {authError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Authentication Failed</p>
                <p className="mt-0.5 text-red-600">{authError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleAdminAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1C1B1F] mb-1.5">
                Authorized Government Email Address *
              </label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="e.g. saiprasadwagh57@gmail.com or sakshi212007@gmail.com"
                className="w-full bg-[#F4F0FF]/50 border border-[#E2D9FF] rounded-2xl p-3.5 text-xs text-[#1C1B1F] focus:ring-2 focus:ring-[#7C5CFC] focus:outline-hidden"
              />
            </div>

            {/* Registration Verification Indicator Message */}
            {authMode === "register" && cleanEmailInput.length > 0 && (
              <div
                className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 font-medium ${
                  isEmailAuthorized
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-red-50 border-red-300 text-red-800"
                }`}
              >
                {isEmailAuthorized ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Verified Admin Email. You are authorized to register as an administrator.</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Access Denied. This email is not registered as an administrator.</span>
                  </>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#1C1B1F] mb-1.5">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F4F0FF]/50 border border-[#E2D9FF] rounded-2xl p-3.5 pr-12 text-xs text-[#1C1B1F] focus:ring-2 focus:ring-[#7C5CFC] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 p-1 rounded-lg cursor-pointer transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authMode === "register" && (
              <div>
                <label className="block text-xs font-bold text-[#1C1B1F] mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#F4F0FF]/50 border border-[#E2D9FF] rounded-2xl p-3.5 pr-12 text-xs text-[#1C1B1F] focus:ring-2 focus:ring-[#7C5CFC] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 p-1 rounded-lg cursor-pointer transition-colors"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={authMode === "register" && !isEmailAuthorized}
              className={`w-full font-bold text-xs py-3.5 rounded-2xl shadow-md cursor-pointer transition-all ${
                authMode === "register" && !isEmailAuthorized
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] hover:from-[#6949F2] hover:to-[#5635E0] text-white shadow-[#7C5CFC]/25"
              }`}
            >
              {authMode === "login" ? "Authenticate Admin Session" : "Complete Registration & Access Dashboard"}
            </button>
          </form>

          {/* Whitelist Info Box */}
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Authorized Admin Whitelist</span>
            </div>
            <p className="text-[11px] text-amber-800">
              Only emails in the authorized list can register or log in. Demo whitelisted emails:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {ALLOWED_ADMIN_EMAILS.map((email) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => {
                    setAuthEmail(email);
                    setAuthPassword("adminpass123");
                  }}
                  className="bg-white border border-amber-300 text-amber-900 font-mono text-[10px] px-2.5 py-1 rounded-lg hover:bg-amber-100 cursor-pointer"
                  title="Click to prefill"
                >
                  {email}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleApprove = (hosp: HospitalProfile) => {
    const res = adminApproveHospital(hosp.id);
    if (res) {
      setApprovedHospResult(res);
      setSelectedHosp(null);
    }
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedHosp && rejectReason) {
      adminRejectHospital(selectedHosp.id, rejectReason);
      setRejectModalOpen(false);
      setSelectedHosp(null);
      setRejectReason("");
    }
  };

  const handleConfirmChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedHosp && changesNotes) {
      adminRequestChanges(selectedHosp.id, changesNotes);
      setChangesModalOpen(false);
      setSelectedHosp(null);
      setChangesNotes("");
    }
  };

  const handleConfirmResetExecution = async () => {
    const clean = resetInput.trim().toUpperCase();
    if (!["RESET", "CONFIRM"].includes(clean)) {
      setResetErrorMessage("Validation failed: Text must match RESET or CONFIRM");
      return;
    }

    setIsResetting(true);
    setResetErrorMessage(null);

    const res = await executeAdminSeedReset("System Seed Data Reset initiated by Platform Admin");
    setIsResetting(false);

    if (res.success) {
      setResetStep(0);
      setResetSuccessMessage(
        "Cloud database seed reset executed successfully! All collections restored to initial seed state."
      );
      setTimeout(() => setResetSuccessMessage(null), 8000);
    } else {
      setResetErrorMessage(res.error || "Failed to execute seed reset.");
    }
  };

  const activeList =
    activeTab === "pending"
      ? pendingList
      : activeTab === "verified"
      ? verifiedList
      : activeTab === "rejected"
      ? rejectedList
      : changesList;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-purple-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-purple-950 flex items-center justify-center font-bold shadow-lg">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-300 font-bold">
                Government Health Authority Portal
              </span>
              <h1 className="text-2xl md:text-3xl font-bold font-serif text-white">
                Admin Verification & Trust Gate
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
              <span className="text-purple-300 block text-[10px] uppercase font-bold">Queue Status</span>
              <span className="font-extrabold text-amber-300 text-sm">{pendingList.length} Pending Approvals</span>
            </div>
            {loggedInAdmin && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                <div>
                  <span className="text-purple-300 block text-[10px] uppercase font-bold">Authenticated Admin</span>
                  <span className="font-bold text-white text-xs">{loggedInAdmin.email}</span>
                </div>
                <button
                  onClick={logoutAdmin}
                  className="ml-2 bg-red-500/30 hover:bg-red-500 text-white font-bold text-[11px] px-3 py-1 rounded-xl transition-colors cursor-pointer border border-red-300/30"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Registered Hospitals Statistics Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#E7E0EC] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7E0EC] pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#6750A4]" />
            <h2 className="text-lg font-bold font-serif text-[#1C1B1F]">
              Registered Hospitals Overview
            </h2>
          </div>
          <span className="text-[11px] font-bold text-[#6750A4] bg-[#F3EDF7] px-3 py-1 rounded-full border border-[#E7E0EC] self-start sm:self-auto">
            Auto-Updating Live Statistics
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#FEF7FF] border border-[#E7E0EC] rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-xs font-bold text-[#49454F] uppercase block">Total Hospitals</span>
              <span className="text-2xl font-extrabold text-[#1C1B1F] mt-0.5 block">{hospitals.length}</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#EADDFF] text-[#21005D] flex items-center justify-center font-bold text-lg">
              🏥
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase block">Verified</span>
              <span className="text-2xl font-extrabold text-emerald-950 mt-0.5 block">{verifiedList.length}</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-lg">
              ✅
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-xs font-bold text-amber-900 uppercase block">Pending</span>
              <span className="text-2xl font-extrabold text-amber-950 mt-0.5 block">{pendingList.length}</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-lg">
              ⏳
            </div>
          </div>

          <div className="bg-red-50/70 border border-red-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-xs font-bold text-red-900 uppercase block">Rejected</span>
              <span className="text-2xl font-extrabold text-red-950 mt-0.5 block">{rejectedList.length}</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-red-200 text-red-900 flex items-center justify-center font-bold text-lg">
              ❌
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div
          onClick={() => setActiveTab("pending")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "pending"
              ? "bg-amber-500 text-purple-950 border-amber-400 font-bold shadow-lg ring-2 ring-amber-300"
              : "bg-white border-slate-200 hover:border-amber-300"
          }`}
        >
          <span className="text-[11px] uppercase block font-semibold">Pending Queue</span>
          <span className="text-2xl font-extrabold">{pendingList.length}</span>
          <span className="text-[10px] block opacity-80">Awaiting Authentication</span>
        </div>

        <div
          onClick={() => setActiveTab("verified")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "verified"
              ? "bg-emerald-700 text-white border-emerald-600 font-bold shadow-lg ring-2 ring-emerald-400"
              : "bg-white border-slate-200 hover:border-emerald-300"
          }`}
        >
          <span className="text-[11px] uppercase block font-semibold">Verified Hospitals</span>
          <span className="text-2xl font-extrabold">{verifiedList.length}</span>
          <span className="text-[10px] block opacity-80">Publicly Listed</span>
        </div>

        <div
          onClick={() => setActiveTab("changes")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "changes"
              ? "bg-purple-700 text-white border-purple-600 font-bold shadow-lg ring-2 ring-purple-400"
              : "bg-white border-slate-200 hover:border-purple-300"
          }`}
        >
          <span className="text-[11px] uppercase block font-semibold">Changes Requested</span>
          <span className="text-2xl font-extrabold">{changesList.length}</span>
          <span className="text-[10px] block opacity-80">Sent Back for Edits</span>
        </div>

        <div
          onClick={() => setActiveTab("rejected")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "rejected"
              ? "bg-red-700 text-white border-red-600 font-bold shadow-lg ring-2 ring-red-400"
              : "bg-white border-slate-200 hover:border-red-300"
          }`}
        >
          <span className="text-[11px] uppercase block font-semibold">Rejected Apps</span>
          <span className="text-2xl font-extrabold">{rejectedList.length}</span>
          <span className="text-[10px] block opacity-80">Access Denied</span>
        </div>

        <div
          onClick={() => setActiveTab("reviews_moderation")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "reviews_moderation"
              ? "bg-amber-600 text-white border-amber-500 font-bold shadow-lg ring-2 ring-amber-300"
              : "bg-white border-slate-200 hover:border-amber-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase block font-semibold">Review Moderation</span>
            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-200" />
          </div>
          <span className="text-2xl font-extrabold">{reviews.length}</span>
          <span className="text-[10px] block opacity-80">
            {reviews.filter((r) => r.status === "pending").length} Pending Review(s)
          </span>
        </div>

        <div
          onClick={() => setActiveTab("system_maintenance")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "system_maintenance"
              ? "bg-slate-900 text-white border-slate-800 font-bold shadow-lg ring-2 ring-slate-400"
              : "bg-white border-slate-200 hover:border-slate-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase block font-semibold">Settings / Maintenance</span>
            <Settings className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-2xl font-extrabold">{auditLogs.length}</span>
          <span className="text-[10px] block opacity-80">Audit Logs & Seed Reset</span>
        </div>
      </div>

      {/* Main Content Area */}
      {resetSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{resetSuccessMessage}</span>
          </div>
          <button
            onClick={() => setResetSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {activeTab === "system_maintenance" ? (
        <div className="space-y-6">
          {/* Settings & Maintenance Section Header */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-900 text-white rounded-xl">
                    <Settings className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold font-serif text-slate-900">
                    Settings / System Maintenance
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Privileged maintenance tools, database seed management, and immutable audit logs restricted strictly to Platform Administrators.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Firebase Firestore Cloud Active
                </span>
              </div>
            </div>

            {/* Seed Reset Card */}
            <div className="p-6 bg-gradient-to-br from-red-50/80 via-white to-amber-50/50 border border-red-200/80 rounded-3xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Administrator Database Seed Maintenance</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 font-serif">
                    Reset Cloud Seed Data
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Resets all cloud collections (Hospitals, Doctors, Appointments, Diagnostic Reports, Patient Reviews, Notifications) back to clean initial baseline seed data.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setResetStep(1);
                    setResetInput("");
                    setResetErrorMessage(null);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 border border-red-500"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset Seed Data</span>
                </button>
              </div>

              <div className="p-3 bg-white/80 border border-red-100 rounded-2xl flex items-center gap-2 text-[11px] text-slate-600">
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  <strong>Security Enforcement:</strong> Access restricted to authenticated Platform Admin ({loggedInAdmin?.email}). Requires two-step verification and logs an audit trail event.
                </span>
              </div>
            </div>
          </div>

          {/* System Audit Trail Table */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-700" />
                <h3 className="text-lg font-bold font-serif text-slate-900">
                  Platform Action & Maintenance Audit Trail ({auditLogs.length})
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                Live Cloud Sync
              </span>
            </div>

            {auditLogs.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold">No audit logs recorded yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Administrative actions and system seed resets will automatically record entries here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Admin Email</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Notes / Purpose</th>
                      <th className="py-3 px-4">Device Info</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap text-slate-900 font-bold">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 font-semibold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200/60">
                            <ShieldCheck className="w-3 h-3 text-purple-600" />
                            {log.adminEmail}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-red-100 text-red-800 border border-red-200">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={log.notes}>
                          {log.notes || "System Maintenance Operation"}
                        </td>
                        <td className="py-3 px-4 font-mono text-[10px] text-slate-400 max-w-xs truncate" title={log.deviceInfo}>
                          {log.deviceInfo || "Web Browser"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === "reviews_moderation" ? (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold font-serif text-slate-900">
                Patient Review Moderation & Verification Gate ({reviews.length})
              </h2>
              <p className="text-xs text-slate-500">
                Moderate, approve, or reject patient feedback before ratings impact hospital rankings.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                {reviews.filter((r) => r.status === "pending").length} Pending Review(s)
              </span>
            </div>
          </div>

          {/* Super Admin Internal Verification Notice */}
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl text-xs text-purple-950 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Super Admin Security & Identity Privileges</p>
              <p className="text-purple-800 text-[11px]">
                To verify authenticity and eliminate fake reviews, Super Admins can view the real patient identity even when a review was marked as "Anonymous" for the public view.
              </p>
            </div>
          </div>

          {/* Reviews Moderation Cards */}
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Star className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-700 text-sm">No patient reviews submitted yet</h3>
              <p className="text-xs text-slate-500 mt-1">Patient reviews will appear here after consultations are completed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:border-purple-300 transition-all space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{rev.patientName}</span>
                        {rev.isAnonymous && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-bold">
                            Submitted Anonymously to Public (Verified Admin View)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-purple-700 font-medium">
                        Hospital: <strong>{rev.hospitalName}</strong> • Doctor: <strong>{rev.doctorName}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-medium">{rev.createdAt}</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          rev.status === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : rev.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        Status: {rev.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <span className="font-extrabold text-amber-600 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                      Hospital: <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> {rev.hospitalRating} / 5
                    </span>
                    <span className="font-extrabold text-amber-600 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                      Doctor: <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> {rev.doctorRating} / 5
                    </span>
                  </div>

                  {rev.feedback && (
                    <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 italic">
                      "{rev.feedback}"
                    </p>
                  )}

                  {/* Moderation Controls */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                    {rev.status !== "approved" && (
                      <button
                        onClick={() => updateReviewStatus(rev.id, "approved")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Review
                      </button>
                    )}
                    {rev.status !== "rejected" && (
                      <button
                        onClick={() => updateReviewStatus(rev.id, "rejected")}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Moderate / Reject
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm("Delete this patient review permanently?")) {
                          deleteReview(rev.id);
                        }
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900 capitalize">
              {activeTab} Hospital Applications ({activeList.length})
            </h2>
            <p className="text-xs text-slate-500">
              Inspect government certificates, bed counts, and expense structure before granting verified credentials.
            </p>
          </div>
        </div>

        {activeList.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <div className="w-14 h-14 rounded-2xl bg-[#F4F0FF] text-[#7C5CFC] border border-[#E2D9FF] flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-[#23125E] text-base font-serif">
              {activeTab === "pending" && "No pending hospital verification requests"}
              {activeTab === "verified" && "No verified hospitals in the network yet"}
              {activeTab === "rejected" && "No rejected hospital applications"}
              {activeTab === "changes" && "No applications currently awaiting edits"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Applications submitted through the official Hospital Registration portal will automatically queue here for Government Admin review.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeList.map((hosp) => (
              <div
                key={hosp.id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-purple-300 bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={hosp.logoUrl}
                    alt={hosp.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{hosp.name}</h3>
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full">
                        {hosp.hospitalType}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 flex items-center gap-3 mt-1">
                      <span>Reg #: <strong className="font-mono">{hosp.registrationNumber}</strong></span>
                      <span>City: <strong>{hosp.city}, {hosp.state}</strong></span>
                      <span>Submitted: <strong>{hosp.submittedAt}</strong></span>
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Facilities: {hosp.facilities.length} active • OPD Fee: ₹{hosp.expenses.opdFee} • ICU Beds: {hosp.beds.icuTotal}
                    </p>

                    {hosp.verificationStatus === "verified" && (
                      <p className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-mono font-bold mt-2 inline-block">
                        ID: {hosp.hospitalId} | Password: {hosp.password}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedHosp(hosp)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-purple-600" /> Inspect Profile
                  </button>

                  {hosp.verificationStatus === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(hosp)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Issue ID
                      </button>

                      <button
                        onClick={() => {
                          setSelectedHosp(hosp);
                          setChangesModalOpen(true);
                        }}
                        className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-3 py-2 rounded-xl cursor-pointer"
                      >
                        Request Edits
                      </button>

                      <button
                        onClick={() => {
                          setSelectedHosp(hosp);
                          setRejectModalOpen(true);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-2 rounded-xl cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* FULL INSPECTION DRAWER / MODAL */}
      {selectedHosp && !rejectModalOpen && !changesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 border border-purple-100 shadow-2xl my-8 space-y-6 animate-scaleIn">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <img src={selectedHosp.logoUrl} alt={selectedHosp.name} className="w-14 h-14 rounded-2xl object-cover border" />
                <div>
                  <h3 className="font-bold text-slate-900 text-xl font-serif">{selectedHosp.name}</h3>
                  <p className="text-xs text-slate-500">Reg #: {selectedHosp.registrationNumber} • Type: {selectedHosp.hospitalType}</p>
                </div>
              </div>

              <button onClick={() => setSelectedHosp(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Inspection Details */}
            <div className="space-y-4 text-xs text-slate-700 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p><strong>Address:</strong> {selectedHosp.address}, {selectedHosp.city}, {selectedHosp.state} - {selectedHosp.pinCode}</p>
                <p><strong>Emergency Contact:</strong> <span className="text-red-600 font-bold">{selectedHosp.emergencyContact}</span></p>
                <p><strong>Official Contact:</strong> {selectedHosp.contactNumber} ({selectedHosp.email})</p>
                <p><strong>Website:</strong> {selectedHosp.website || "N/A"}</p>
              </div>

              {/* Verified GPS Location & Accuracy */}
              <div className="bg-purple-50/80 p-4 rounded-2xl border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-purple-600" /> Verified GPS Location Coordinates
                  </span>
                  <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> GPS Verified
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs bg-white p-2.5 rounded-xl border border-purple-100 text-center">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-sans font-bold uppercase">Latitude</span>
                    <span className="font-bold text-slate-800">{selectedHosp.lat ? selectedHosp.lat.toFixed(4) : "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-sans font-bold uppercase">Longitude</span>
                    <span className="font-bold text-slate-800">{selectedHosp.lng ? selectedHosp.lng.toFixed(4) : "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-sans font-bold uppercase">Accuracy</span>
                    <span className="font-bold text-emerald-700">{selectedHosp.accuracy || 8} meters</span>
                  </div>
                </div>
              </div>

              {/* Facilities */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase mb-2">Facility Counts</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedHosp.facilities.map((fac) => (
                    <span key={fac.id} className="bg-purple-50 text-purple-900 font-bold px-2.5 py-1 rounded-xl border border-purple-100">
                      {fac.name}: {fac.count}
                    </span>
                  ))}
                </div>
              </div>

              {/* Treatment Expenses */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase mb-2">Submitted Expense Schedule</h4>
                <div className="grid grid-cols-3 gap-2 bg-purple-900 text-white p-3 rounded-2xl text-center">
                  <div>
                    <span className="text-[10px] text-purple-300 block uppercase">OPD Fee</span>
                    <span className="font-bold text-amber-300">₹{selectedHosp.expenses.opdFee}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-300 block uppercase">ICU Charge / Day</span>
                    <span className="font-bold text-amber-300">₹{selectedHosp.expenses.icuChargesPerDay}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-300 block uppercase">General Ward / Day</span>
                    <span className="font-bold text-amber-300">₹{selectedHosp.expenses.generalWardPerDay}</span>
                  </div>
                </div>
              </div>

              {/* Certificates Proofs */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase mb-2">Government Verification Proofs</h4>
                <div className="space-y-1.5">
                  <a href={selectedHosp.documents.hospitalLicenseUrl} target="_blank" rel="noreferrer" className="block text-purple-700 hover:underline flex items-center gap-1 font-semibold">
                    <FileText className="w-3.5 h-3.5" /> View State Hospital License Certificate
                  </a>
                  <a href={selectedHosp.documents.govRegistrationCertUrl} target="_blank" rel="noreferrer" className="block text-purple-700 hover:underline flex items-center gap-1 font-semibold">
                    <FileText className="w-3.5 h-3.5" /> View Municipal Registration Certificate
                  </a>
                  <a href={selectedHosp.documents.ownershipProofUrl} target="_blank" rel="noreferrer" className="block text-purple-700 hover:underline flex items-center gap-1 font-semibold">
                    <FileText className="w-3.5 h-3.5" /> View Property Ownership / Lease Deed
                  </a>
                </div>
              </div>
            </div>

            {/* Approval Footer */}
            {selectedHosp.verificationStatus === "pending" && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => handleApprove(selectedHosp)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" /> Approve & Generate Hospital ID / Password
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REJECT REASON MODAL */}
      {rejectModalOpen && selectedHosp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-red-100 shadow-2xl space-y-4">
            <h3 className="font-bold text-red-900 text-lg font-serif">Reject Application</h3>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State Rejection Reason</label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. License registration number invalid in state municipal database."
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setRejectModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-red-600 text-white text-xs font-bold rounded-xl">
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUEST CHANGES MODAL */}
      {changesModalOpen && selectedHosp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-purple-100 shadow-2xl space-y-4">
            <h3 className="font-bold text-purple-900 text-lg font-serif">Request Profile Changes</h3>

            <form onSubmit={handleConfirmChanges} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Specify Required Corrections</label>
                <textarea
                  required
                  rows={3}
                  value={changesNotes}
                  onChange={(e) => setChangesNotes(e.target.value)}
                  placeholder="e.g. Please re-upload a clearer image of NABH certificate."
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setChangesModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-purple-700 text-white text-xs font-bold rounded-xl">
                  Send Change Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVAL SUCCESS POPUP */}
      {approvedHospResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 border border-emerald-100 shadow-2xl space-y-5 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="font-bold text-slate-900 text-xl font-serif">
              Hospital Successfully Authenticated!
            </h3>

            <p className="text-xs text-slate-600">
              The application for <strong>{approvedHospResult.name}</strong> has been approved. The hospital is now live on the <strong>Patient Portal</strong> and can log into <strong>Hospital Management</strong> using these credentials:
            </p>

            <div className="bg-purple-950 text-white p-4 rounded-2xl space-y-2 text-left">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-300 block">Generated Hospital ID</span>
                <span className="font-mono text-lg font-bold text-amber-300">{approvedHospResult.hospitalId}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-300 block">Generated Password</span>
                <span className="font-mono text-lg font-bold text-amber-300">{approvedHospResult.password}</span>
              </div>
            </div>

            <button
              onClick={() => setApprovedHospResult(null)}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-3 rounded-xl cursor-pointer"
            >
              Close & Return to Admin Queue
            </button>
          </div>
        </div>
      )}

      {/* RESET SEED DATA STEP 1 MODAL (WARNING DIALOG) */}
      {resetStep === 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 space-y-5">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">⚠ Reset Application Data</h3>
                <span className="text-xs text-red-600 font-semibold">Step 1 of 2: Security Warning</span>
              </div>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900 space-y-2">
              <p className="font-bold">This action will remove all seeded/demo data from the application.</p>
              <p className="text-[11px] text-red-800">
                All hospitals, doctors, appointments, medical reports, and reviews will be reset across all connected users in real time. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setResetStep(0)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => setResetStep(2)}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET SEED DATA STEP 2 MODAL (TEXT INPUT AUTHORIZATION STEP) */}
      {resetStep === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Final Security Authorization</h3>
                  <span className="text-xs text-amber-700 font-semibold">Step 2 of 2: Confirm Intent</span>
                </div>
              </div>
              <button onClick={() => setResetStep(0)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 font-medium">
                To authorize system seed reset, please type <strong className="text-red-600 font-mono">RESET</strong> or <strong className="text-red-600 font-mono">CONFIRM</strong> in capital letters below:
              </p>

              <input
                type="text"
                value={resetInput}
                onChange={(e) => setResetInput(e.target.value)}
                placeholder="Type RESET or CONFIRM"
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 font-mono text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-red-500 uppercase"
                autoFocus
              />

              {resetInput && !["RESET", "CONFIRM"].includes(resetInput.trim().toUpperCase()) && (
                <p className="text-[11px] text-amber-600 font-medium">
                  Text must match "RESET" or "CONFIRM" exactly to enable execution.
                </p>
              )}

              {resetErrorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                  {resetErrorMessage}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setResetStep(0)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
                disabled={isResetting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResetExecution}
                disabled={!["RESET", "CONFIRM"].includes(resetInput.trim().toUpperCase()) || isResetting}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                  ["RESET", "CONFIRM"].includes(resetInput.trim().toUpperCase()) && !isResetting
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/30"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                }`}
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Seed Reset...</span>
                  </>
                ) : (
                  <span>Confirm & Execute Reset</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
