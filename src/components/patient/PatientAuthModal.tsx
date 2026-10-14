import React, { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { useLocation } from "../../context/LocationContext";
import { LocationMapPickerModal } from "../common/LocationMapPickerModal";
import { parseGoogleMapsUrl } from "../../utils/location";
import {
  X,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Upload,
  Trash2,
  RefreshCw,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Stethoscope,
  Building2,
  Calendar,
  LogIn,
  UserPlus,
  MapPin,
  Link as LinkIcon,
  Compass,
} from "lucide-react";

interface PatientAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

export const PatientAuthModal: React.FC<PatientAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "login",
}) => {
  const { patientLogin, registerPatient, t } = useApp();

  const [authMode, setAuthMode] = useState<"login" | "register">(initialMode);
  
  // Registration Inputs
  const [patientNameInput, setPatientNameInput] = useState("");
  const [patientMobileInput, setPatientMobileInput] = useState("");
  const [patientAgeInput, setPatientAgeInput] = useState<number>(30);
  const [patientGenderInput, setPatientGenderInput] = useState<string>("Male");
  const [patientProfilePhoto, setPatientProfilePhoto] = useState<string>("");
  const [patientPasswordInput, setPatientPasswordInput] = useState("");
  const [patientConfirmPasswordInput, setPatientConfirmPasswordInput] = useState("");

  const { location: activeLoc } = useLocation();

  // Location inputs (Google Maps)
  const [patientAddress, setPatientAddress] = useState<string>(activeLoc?.formattedAddress || "Sinnar, Nashik, Maharashtra - 422103");
  const [patientLat, setPatientLat] = useState<number>(activeLoc?.lat || 19.8451);
  const [patientLng, setPatientLng] = useState<number>(activeLoc?.lng || 73.9961);
  const [patientMapsUrl, setPatientMapsUrl] = useState<string>(`https://www.google.com/maps?q=${activeLoc?.lat || 19.8451},${activeLoc?.lng || 73.9961}`);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Photo File Upload
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type.toLowerCase())) {
      setAuthError("Unsupported file format. Please upload JPG, JPEG, or PNG.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAuthError("File size exceeds 5 MB. Please upload a smaller image.");
      return;
    }

    setAuthError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPatientProfilePhoto(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLinkInputChange = (inputStr: string) => {
    setPatientMapsUrl(inputStr);
    const parsed = parseGoogleMapsUrl(inputStr);
    if (parsed) {
      setPatientLat(parsed.lat);
      setPatientLng(parsed.lng);
      if (parsed.address) setPatientAddress(parsed.address);
      setAuthError(null);
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (authMode === "register") {
      if (!patientNameInput.trim()) {
        setAuthError("Full Name is required.");
        return;
      }
      if (!patientMobileInput.trim()) {
        setAuthError("Mobile Number is required.");
        return;
      }
      if (patientMobileInput.trim().length < 10) {
        setAuthError("Please enter a valid 10-digit mobile number.");
        return;
      }
      if (!patientAddress.trim()) {
        setAuthError("Home Address / Google Maps Location is required.");
        return;
      }
      if (!patientPasswordInput.trim()) {
        setAuthError("Password is required.");
        return;
      }
      if (patientPasswordInput !== patientConfirmPasswordInput) {
        setAuthError("Passwords do not match. Please re-enter.");
        return;
      }

      const res = registerPatient(
        patientNameInput,
        patientMobileInput,
        patientAgeInput,
        patientPasswordInput,
        patientProfilePhoto,
        patientGenderInput,
        patientAddress,
        patientLat,
        patientLng,
        patientMapsUrl
      );

      if (!res.success) {
        setAuthError(res.error || "Registration failed. Mobile number may already exist.");
      } else {
        onClose();
      }
    } else {
      if (!patientMobileInput.trim() || !patientPasswordInput.trim()) {
        setAuthError("Please fill in both mobile number and password.");
        return;
      }

      const res = patientLogin(patientMobileInput, patientPasswordInput);
      if (!res.success) {
        setAuthError(res.error || "Invalid mobile number or password.");
      } else {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-[#FAF8FF] via-[#F3EFFF] to-[#EAE4FF] border border-purple-200/80 shadow-2xl rounded-3xl overflow-hidden my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-purple-100 flex items-center justify-center cursor-pointer shadow-xs transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[550px]">
          {/* LEFT PANEL: Healthcare Illustration & Welcoming Value Proposition */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#23125E] via-[#3B1F8C] to-[#1E0F52] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Background Decorative Blobs & Patterns */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-[#7C5CFC]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-[#6848F0]/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Brand Emblem */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C5CFC] to-[#6848F0] flex items-center justify-center text-white shadow-lg shadow-[#7C5CFC]/40 border border-white/20">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-extrabold text-2xl tracking-tight text-white block">
                    Jeevan<span className="text-[#A892FF]">Setu</span>
                  </span>
                  <span className="text-[10px] text-purple-200 font-semibold tracking-wider uppercase block">
                    Healthcare Network Portal
                  </span>
                </div>
              </div>

              {/* Healthcare Vector Illustration Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-4 my-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-[#7C5CFC] to-[#A892FF] p-0.5 shadow-md flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-[#23125E] flex items-center justify-center text-white">
                    <Stethoscope className="w-8 h-8 text-[#A892FF] animate-pulse" />
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified Govt Approvals
                  </span>
                  <p className="text-xs text-purple-100 font-medium leading-relaxed pt-1">
                    Connect directly with top multi-specialty hospitals, real-time bed tracking, and certified medical specialists.
                  </p>
                </div>
              </div>

              {/* Feature Highlights List */}
              <div className="space-y-3 pt-2">
                {[
                  { title: "Instant Doctor Appointments", icon: <Calendar className="w-4 h-4 text-[#A892FF]" /> },
                  { title: "Live Hospital Bed Availability", icon: <Building2 className="w-4 h-4 text-[#A892FF]" /> },
                  { title: "Secure Digital Medical Reports", icon: <Sparkles className="w-4 h-4 text-[#A892FF]" /> },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-purple-100 font-medium">
                    <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <span>{item.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Footer Tagline */}
            <div className="relative z-10 pt-6 border-t border-white/10 text-[11px] text-purple-200">
              <p>Direct emergency access & AI symptom matching enabled for registered patients.</p>
            </div>
          </div>

          {/* RIGHT PANEL: Modern Centered Authentication Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white/90 backdrop-blur-md space-y-6">
            {/* Header Title */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#7C5CFC] tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {authMode === "login" ? "Welcome Back to Jeevan Setu" : "Join Jeevan Setu Healthcare"}
              </span>
              <h2 className="text-2xl font-bold font-serif text-slate-900">
                {authMode === "login" ? "Patient Account Login" : "Register Patient Account"}
              </h2>
              <p className="text-xs text-slate-500">
                {authMode === "login"
                  ? "Enter your mobile number and password to access your healthcare portal."
                  : "Create your personal health profile for verified appointment booking."}
              </p>
            </div>

            {/* Auth Mode Toggle Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  authMode === "login"
                    ? "bg-[#7C5CFC] text-white shadow-md shadow-[#7C5CFC]/25"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LogIn className="w-4 h-4" /> Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setAuthError(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  authMode === "register"
                    ? "bg-[#7C5CFC] text-white shadow-md shadow-[#7C5CFC]/25"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <UserPlus className="w-4 h-4" /> Register New Patient
              </button>
            </div>

            {/* Error Banner */}
            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-2xl flex items-start gap-2 animate-shake">
                <X className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "register" ? (
                /* REGISTRATION MULTI-SECTION FORM */
                <div className="space-y-5">
                  {/* SECTION 1: Personal Information */}
                  <div className="space-y-3 bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-900 border-b border-purple-200/60 pb-2">
                      <User className="w-4 h-4 text-[#7C5CFC]" />
                      <span>Personal Information</span>
                    </div>

                    {/* Profile Photo Upload Section */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">
                        📷 Profile Photo <span className="text-slate-400 font-normal">(Optional, max 5MB)</span>
                      </label>

                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-2xl border border-purple-200/80">
                        {/* Image Preview */}
                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-purple-100 border-2 border-[#7C5CFC] shrink-0 flex items-center justify-center shadow-sm">
                          {patientProfilePhoto ? (
                            <img
                              src={patientProfilePhoto}
                              alt="Profile Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-8 h-8 text-[#7C5CFC]" />
                          )}
                        </div>

                        <div className="flex-1 space-y-2 text-center sm:text-left">
                          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                            {/* File Upload Trigger */}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-[#7C5CFC] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" /> Browse Files
                            </button>

                            {/* Camera Trigger */}
                            <button
                              type="button"
                              onClick={() => cameraInputRef.current?.click()}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                              title="Capture photo using camera"
                            >
                              <Camera className="w-3.5 h-3.5 text-purple-700" /> Camera
                            </button>

                            {/* Remove Image Option */}
                            {patientProfilePhoto && (
                              <button
                                type="button"
                                onClick={() => setPatientProfilePhoto("")}
                                className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            )}
                          </div>

                          <span className="text-[10px] text-slate-500 block">
                            Supported: JPG, JPEG, PNG (Max 5 MB)
                          </span>
                        </div>

                        {/* Hidden Inputs */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handlePhotoSelect}
                          accept="image/jpeg,image/jpg,image/png"
                          className="hidden"
                        />
                        <input
                          type="file"
                          ref={cameraInputRef}
                          onChange={handlePhotoSelect}
                          accept="image/*"
                          capture="user"
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={patientNameInput}
                        onChange={(e) => setPatientNameInput(e.target.value)}
                        placeholder="e.g. Ramesh Patil"
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#7C5CFC] outline-none"
                      />
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number * <span className="text-slate-400 font-normal">(Unique Login Identifier)</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={patientMobileInput}
                          onChange={(e) => setPatientMobileInput(e.target.value)}
                          placeholder="e.g. 9823099999"
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 pl-10 text-xs focus:ring-2 focus:ring-[#7C5CFC] outline-none"
                        />
                      </div>
                    </div>

                    {/* Age & Gender Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Age (Years) *
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={120}
                          value={patientAgeInput}
                          onChange={(e) => setPatientAgeInput(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#7C5CFC] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Gender *
                        </label>
                        <select
                          value={patientGenderInput}
                          onChange={(e) => setPatientGenderInput(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#7C5CFC] outline-none"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: Home Address & Google Maps Location */}
                  <div className="space-y-3 bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                    <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                        <MapPin className="w-4 h-4 text-[#7C5CFC]" />
                        <span>Home Address (Google Maps Location) *</span>
                      </div>
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                        For Distance Matrix
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Pin your exact home location on Google Maps for real-time distance calculations to nearby hospitals.
                    </p>

                    {/* Current Selected Address Box */}
                    <div className="bg-white p-3 rounded-2xl border border-purple-200/80 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Selected Google Maps Location
                          </span>
                          <p className="text-xs font-bold text-slate-800 leading-snug">
                            {patientAddress || "No location pinned yet"}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Coordinates: {patientLat.toFixed(4)}, {patientLng.toFixed(4)}
                          </p>
                        </div>

                        {/* Map Picker Trigger Button */}
                        <button
                          type="button"
                          onClick={() => setLocationModalOpen(true)}
                          className="bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] hover:from-[#6949F2] hover:to-[#5635E0] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                        >
                          <Compass className="w-3.5 h-3.5" /> Select on Map
                        </button>
                      </div>

                      {/* Option 2: Paste Google Maps Link Fallback */}
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                          <LinkIcon className="w-3 h-3 text-purple-600" /> Option 2: Or Paste Google Maps Link / Coordinates
                        </label>
                        <input
                          type="text"
                          value={patientMapsUrl}
                          onChange={(e) => handleLinkInputChange(e.target.value)}
                          placeholder="e.g. https://maps.app.goo.gl/... or 18.5204, 73.8567"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:ring-2 focus:ring-[#7C5CFC] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: Account Security */}
                  <div className="space-y-3 bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-900 border-b border-purple-200/60 pb-2">
                      <Lock className="w-4 h-4 text-[#7C5CFC]" />
                      <span>Account Information</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={patientPasswordInput}
                            onChange={(e) => setPatientPasswordInput(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 pr-10 text-xs focus:ring-2 focus:ring-[#7C5CFC] outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={patientConfirmPasswordInput}
                            onChange={(e) => setPatientConfirmPasswordInput(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 pr-10 text-xs focus:ring-2 focus:ring-[#7C5CFC] outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* LOGIN FORM */
                <div className="space-y-4 py-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={patientMobileInput}
                        onChange={(e) => setPatientMobileInput(e.target.value)}
                        placeholder="e.g. 9823099999"
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 pl-10 text-xs focus:ring-2 focus:ring-[#7C5CFC] outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={patientPasswordInput}
                        onChange={(e) => setPatientPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 pl-10 pr-10 text-xs focus:ring-2 focus:ring-[#7C5CFC] outline-none font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Demo Prefill Shortcut */}
                  <div className="pt-2 bg-purple-50/70 p-3 rounded-xl border border-purple-200/80 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setPatientMobileInput("9823099999");
                        setPatientPasswordInput("123456");
                      }}
                      className="text-xs text-[#7C5CFC] font-extrabold flex items-center justify-center gap-1.5 mx-auto hover:underline cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Prefill Demo Credentials (Ramesh Patil / 9823099999)
                    </button>
                  </div>
                </div>
              )}

              {/* Primary Large Action Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] hover:from-[#6949F2] hover:to-[#5635E0] text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg shadow-[#7C5CFC]/30 transition-all transform active:scale-[0.99] hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                {authMode === "login" ? (
                  <>
                    <LogIn className="w-4 h-4" /> Login to Patient Dashboard
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Complete Registration
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Location Map Picker Modal for Patient Registration */}
      <LocationMapPickerModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        initialLat={patientLat}
        initialLng={patientLng}
        initialAddress={patientAddress}
        title="Pin Patient Home Location on Google Map"
        onConfirmLocation={(loc) => {
          setPatientAddress(loc.address);
          setPatientLat(loc.lat);
          setPatientLng(loc.lng);
          if (loc.googleMapsUrl) setPatientMapsUrl(loc.googleMapsUrl);
        }}
      />
    </div>
  );
};
