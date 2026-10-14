import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { HospitalProfile, FacilityItem, HospitalType } from "../../types";
import { FileUpload } from "../FileUpload";
import { LocationMapPickerModal } from "../common/LocationMapPickerModal";
import { HospitalLocationVerificationModal } from "./HospitalLocationVerificationModal";
import { parseGoogleMapsUrl } from "../../utils/location";
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  Upload,
  IndianRupee,
  Activity,
  Bed,
  Phone,
  MapPin,
  Globe,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Edit3,
  Compass,
  Link as LinkIcon,
} from "lucide-react";

export const HospitalRegistrationPage: React.FC = () => {
  const { registerHospital, updateHospitalRegistration, hospitals, setActiveRole, hospitalLogin, t } = useApp();

  // Check if there is an existing submitted application stored in local state or draft
  const [submittedHosp, setSubmittedHosp] = useState<HospitalProfile | null>(null);

  // Form Fields State
  const [name, setName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [hospitalType, setHospitalType] = useState<HospitalType>("Multi-Specialty");
  const [logoUrl, setLogoUrl] = useState("https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&q=80");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("Maharashtra");
  const [pinCode, setPinCode] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("https://maps.google.com");
  const [website, setWebsite] = useState("");

  // Coordinates & Location Verification State
  const [hospLat, setHospLat] = useState<number | null>(null);
  const [hospLng, setHospLng] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number>(8);
  const [isLocVerified, setIsLocVerified] = useState<boolean>(false);
  const [mapPickerOpen, setMapPickerOpen] = useState<boolean>(false);
  const [locVerificationModalOpen, setLocVerificationModalOpen] = useState<boolean>(true);

  // Facilities Checkboxes + Counts
  const defaultFacilityNames = [
    "ICU",
    "Emergency Ward",
    "Ambulance",
    "Blood Bank",
    "Pharmacy",
    "X-Ray",
    "MRI",
    "CT Scan",
    "Ultrasound",
    "ECG",
    "Operation Theatres",
    "Ventilators",
    "Oxygen Beds",
    "General Beds",
    "Private Rooms",
    "Deluxe Rooms",
    "Laboratories",
  ];

  const [selectedFacilities, setSelectedFacilities] = useState<Record<string, { enabled: boolean; count: number }>>({
    ICU: { enabled: true, count: 12 },
    "Emergency Ward": { enabled: true, count: 20 },
    Ambulance: { enabled: true, count: 4 },
    "Blood Bank": { enabled: true, count: 1 },
    Pharmacy: { enabled: true, count: 1 },
    "X-Ray": { enabled: true, count: 2 },
    MRI: { enabled: true, count: 1 },
    "CT Scan": { enabled: true, count: 1 },
    Ultrasound: { enabled: true, count: 2 },
    ECG: { enabled: true, count: 4 },
    "Operation Theatres": { enabled: true, count: 3 },
    Ventilators: { enabled: true, count: 8 },
    "Oxygen Beds": { enabled: true, count: 40 },
    "General Beds": { enabled: true, count: 80 },
    "Private Rooms": { enabled: true, count: 15 },
    "Deluxe Rooms": { enabled: true, count: 5 },
    Laboratories: { enabled: true, count: 2 },
  });

  // Medical Departments
  const availableDepartments = [
    "Cardiology",
    "Neurology",
    "Oncology",
    "Pediatrics",
    "Orthopedics",
    "Dermatology",
    "Gynecology",
    "Psychiatry",
    "ENT",
    "Ophthalmology",
    "Urology",
    "Gastroenterology",
    "General Medicine",
    "Pulmonology",
  ];

  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([
    "Cardiology",
    "Orthopedics",
    "Pediatrics",
    "General Medicine",
    "Gynecology",
  ]);

  // Services
  const availableServices = [
    "Cashless Insurance",
    "Government Schemes",
    "Online Appointment",
    "Telemedicine",
    "Home Care",
    "24×7 Emergency",
  ];

  const [selectedServices, setSelectedServices] = useState<string[]>([
    "Cashless Insurance",
    "Government Schemes",
    "Online Appointment",
    "24×7 Emergency",
  ]);

  // Expense Information
  const [opdFee, setOpdFee] = useState(300);
  const [icuChargesPerDay, setIcuChargesPerDay] = useState(4000);
  const [generalWardPerDay, setGeneralWardPerDay] = useState(700);
  const [privateRoomPerDay, setPrivateRoomPerDay] = useState(2000);
  const [deluxeRoomPerDay, setDeluxeRoomPerDay] = useState(3800);
  const [mriCost, setMriCost] = useState(3200);
  const [ctScanCost, setCtScanCost] = useState(2000);
  const [bloodTestCost, setBloodTestCost] = useState(400);
  const [xrayCost, setXrayCost] = useState(280);
  const [ambulanceCharges, setAmbulanceCharges] = useState(600);

  // Documents State
  const [hospitalLicenseUrl, setHospitalLicenseUrl] = useState("https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80");
  const [govRegistrationCertUrl, setGovRegistrationCertUrl] = useState("https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&q=80");
  const [nabhCertUrl, setNabhCertUrl] = useState("https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&q=80");
  const [hospitalImageUrl, setHospitalImageUrl] = useState("https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&q=80");
  const [ownershipProofUrl, setOwnershipProofUrl] = useState("https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&q=80");

  const toggleDept = (dept: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const toggleService = (srv: string) => {
    setSelectedServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    );
  };

  const handleFacilityToggle = (name: string) => {
    setSelectedFacilities((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        enabled: !prev[name]?.enabled,
      },
    }));
  };

  const handleFacilityCountChange = (name: string, count: number) => {
    setSelectedFacilities((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        count: Math.max(0, count),
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Strict Hospital Location Validation
    if (
      hospLat === null ||
      hospLat === undefined ||
      isNaN(hospLat) ||
      hospLat === 0 ||
      hospLng === null ||
      hospLng === undefined ||
      isNaN(hospLng) ||
      hospLng === 0 ||
      !isLocVerified
    ) {
      alert("Please select/verify the exact hospital location on the map before submitting.");
      setLocVerificationModalOpen(true);
      return;
    }

    // Construct facilities array
    const facilitiesList: FacilityItem[] = (
      Object.entries(selectedFacilities) as [string, { enabled: boolean; count: number }][]
    )
      .filter(([_, val]) => val.enabled)
      .map(([facName, val], idx) => ({
        id: `fac-${idx}`,
        name: facName,
        count: val.count,
        available: true,
        category: facName.includes("Bed") || facName.includes("Room") || facName.includes("ICU") ? "Inpatient & Critical" : "Diagnostics & Services",
      }));

    // Extract bed availability counts
    const beds = {
      icuTotal: selectedFacilities["ICU"]?.count || 10,
      icuAvailable: Math.max(1, Math.floor((selectedFacilities["ICU"]?.count || 10) * 0.4)),
      generalTotal: selectedFacilities["General Beds"]?.count || 50,
      generalAvailable: Math.max(2, Math.floor((selectedFacilities["General Beds"]?.count || 50) * 0.3)),
      privateTotal: selectedFacilities["Private Rooms"]?.count || 10,
      privateAvailable: Math.max(1, Math.floor((selectedFacilities["Private Rooms"]?.count || 10) * 0.2)),
      deluxeTotal: selectedFacilities["Deluxe Rooms"]?.count || 4,
      deluxeAvailable: 1,
    };

    if (submittedHosp && (submittedHosp.verificationStatus === "rejected" || submittedHosp.verificationStatus === "changes_requested")) {
      // Resubmit existing profile
      updateHospitalRegistration(submittedHosp.id, {
        name,
        registrationNumber,
        hospitalType,
        logoUrl: hospitalImageUrl || logoUrl,
        address,
        city,
        state: stateName,
        pinCode,
        contactNumber,
        email,
        emergencyContact,
        googleMapsUrl,
        lat: hospLat,
        lng: hospLng,
        isLocationVerified: true,
        accuracy: accuracy,
        website,
        facilities: facilitiesList,
        departments: selectedDepartments,
        services: selectedServices,
        expenses: {
          opdFee,
          icuChargesPerDay,
          generalWardPerDay,
          privateRoomPerDay,
          deluxeRoomPerDay,
          mriCost,
          ctScanCost,
          bloodTestCost,
          xrayCost,
          ambulanceCharges,
        },
        beds,
        documents: {
          hospitalLicenseUrl,
          govRegistrationCertUrl,
          nabhCertUrl,
          hospitalImageUrl,
          ownershipProofUrl,
        },
      });

      const updated = hospitals.find((h) => h.id === submittedHosp.id);
      if (updated) setSubmittedHosp({ ...updated, verificationStatus: "pending" });
    } else {
      // Register brand new hospital application
      const newHosp = registerHospital({
        name,
        registrationNumber,
        hospitalType,
        logoUrl: hospitalImageUrl || logoUrl,
        address,
        city,
        state: stateName,
        pinCode,
        contactNumber,
        email,
        emergencyContact,
        googleMapsUrl,
        lat: hospLat,
        lng: hospLng,
        isLocationVerified: true,
        accuracy: accuracy,
        website,
        facilities: facilitiesList,
        departments: selectedDepartments,
        services: selectedServices,
        expenses: {
          opdFee,
          icuChargesPerDay,
          generalWardPerDay,
          privateRoomPerDay,
          deluxeRoomPerDay,
          mriCost,
          ctScanCost,
          bloodTestCost,
          xrayCost,
          ambulanceCharges,
        },
        beds,
        documents: {
          hospitalLicenseUrl,
          govRegistrationCertUrl,
          nabhCertUrl,
          hospitalImageUrl,
          ownershipProofUrl,
        },
      });

      setSubmittedHosp(newHosp);
    }
  };

  // If there is an active submitted hospital application, show status view
  const currentStatusHosp = submittedHosp
    ? hospitals.find((h) => h.id === submittedHosp.id) || submittedHosp
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#23125E] via-[#3B1F8C] to-[#7C5CFC] rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-[#7C5CFC]/20 border border-[#E2D9FF]/20 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#7C5CFC]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3.5 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 border border-white/20 shadow-md animate-float">
            <Building2 className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#EAE5FF] font-extrabold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> {t("hospitalRegistrationTitle", "Hospital Registration Application")}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold font-serif text-white tracking-tight">
              {t("hospitalRegistrationTitle", "Hospital Registration Portal")}
            </h1>
          </div>
        </div>
        <p className="text-[#EAE5FF]/90 text-xs sm:text-sm max-w-3xl leading-relaxed relative z-10 mt-2">
          {t("hospitalRegistrationDesc", "Complete the medical infrastructure, facility counts, department offerings, estimated costs, and government proof verification documents to submit for Admin Authentication.")}
        </p>
      </div>

      {/* Submitted Application Banner / Resubmit Alert */}
      {currentStatusHosp && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs text-slate-500 uppercase font-semibold">Submitted Profile</span>
              <h3 className="text-xl font-bold font-serif text-slate-900">{currentStatusHosp.name}</h3>
              <p className="text-xs text-slate-600">Reg #: {currentStatusHosp.registrationNumber} • Submitted: {currentStatusHosp.submittedAt}</p>
            </div>

            {/* Status Pill */}
            {currentStatusHosp.verificationStatus === "pending" && (
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 animate-pulse">
                <Clock className="w-4 h-4 text-amber-600" /> Pending Admin Review
              </span>
            )}
            {currentStatusHosp.verificationStatus === "verified" && (
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Admin Verified & Approved
              </span>
            )}
            {currentStatusHosp.verificationStatus === "rejected" && (
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600" /> Application Rejected
              </span>
            )}
            {currentStatusHosp.verificationStatus === "changes_requested" && (
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-purple-600" /> Changes Requested
              </span>
            )}
          </div>

          {/* Pending details */}
          {currentStatusHosp.verificationStatus === "pending" && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900">
              <p className="font-bold text-sm mb-1">Application Submitted to Admin Verification Queue!</p>
              <p>Your hospital application is currently awaiting admin verification. Switch to the <strong className="text-purple-700 underline cursor-pointer" onClick={() => setActiveRole("admin")}>Admin Portal</strong> to inspect and approve this application!</p>
            </div>
          )}

          {/* Verified Credentials Box */}
          {currentStatusHosp.verificationStatus === "verified" && currentStatusHosp.hospitalId && (
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
                <h4 className="font-bold text-lg font-serif">Verification Complete! Hospital Credentials Generated</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/10 p-4 rounded-xl border border-white/20 text-xs">
                <div>
                  <span className="text-emerald-200 block text-[10px] uppercase font-bold">Unique Hospital ID</span>
                  <span className="text-xl font-mono font-bold text-amber-300">{currentStatusHosp.hospitalId}</span>
                </div>
                <div>
                  <span className="text-emerald-200 block text-[10px] uppercase font-bold">Secure Login Password</span>
                  <span className="text-xl font-mono font-bold text-amber-300">{currentStatusHosp.password}</span>
                </div>
              </div>

              <p className="text-xs text-emerald-100">
                Your hospital is now visible on the <strong>Patient Portal</strong>! You can now log into the <strong>Hospital Management Portal</strong> to manage doctors, beds, and appointments.
              </p>

              <button
                type="button"
                onClick={() => {
                  if (currentStatusHosp.hospitalId && currentStatusHosp.password) {
                    hospitalLogin(currentStatusHosp.hospitalId, currentStatusHosp.password);
                  }
                  setActiveRole("hospital_mgmt");
                }}
                className="bg-amber-400 hover:bg-amber-500 text-purple-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer flex items-center gap-2"
              >
                Go to Hospital Management Login <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Rejection or Changes Requested Notice */}
          {(currentStatusHosp.verificationStatus === "rejected" || currentStatusHosp.verificationStatus === "changes_requested") && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-900 space-y-2">
              <p className="font-bold text-sm">
                Admin Feedback: {currentStatusHosp.rejectionReason || currentStatusHosp.adminNotes || "Please review and update document proof or facility counts."}
              </p>
              <p className="text-red-700">Update the form below with requested corrections and click resubmit.</p>
            </div>
          )}
        </div>
      )}

      {/* Main Registration Form */}
      {(!currentStatusHosp || currentStatusHosp.verificationStatus === "rejected" || currentStatusHosp.verificationStatus === "changes_requested") && (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: BASIC HOSPITAL DETAILS */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-lg font-serif">
                1. Hospital Identification & Contact Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hospital Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanjeevani Multi-Specialty Hospital"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registration Number / Govt License *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. REG-MH-2026-9901"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hospital Type *
                </label>
                <select
                  value={hospitalType}
                  onChange={(e) => setHospitalType(e.target.value as HospitalType)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="Government">Government / District Hospital</option>
                  <option value="Private">Private Hospital</option>
                  <option value="Multi-Specialty">Multi-Specialty Hospital</option>
                  <option value="Super Specialty">Super Specialty Hospital</option>
                  <option value="Trust">Trust / Charitable Hospital</option>
                  <option value="Clinic">Clinic / Nursing Home</option>
                </select>
              </div>

              <div>
                <FileUpload
                  label="Upload Hospital Logo"
                  value={logoUrl}
                  onChange={(val) => setLogoUrl(val)}
                  accept=".jpg,.jpeg,.png,image/*"
                  iconType="image"
                  description="Upload hospital branding logo (JPG, PNG)"
                />
              </div>

              <div>
                <FileUpload
                  label="Upload Hospital Photo"
                  value={hospitalImageUrl}
                  onChange={(val) => setHospitalImageUrl(val)}
                  accept=".jpg,.jpeg,.png,image/*"
                  iconType="image"
                  description="Upload hospital building exterior photo (JPG, PNG)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Building No, Street, Landmark"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nagpur"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="440001"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98230 00000"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Email *</label>
                <input
                  type="email"
                  required
                  placeholder="hospital@domain.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-red-700 mb-1">
                  24×7 Emergency Helpline Contact *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98230 99999"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full border border-red-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-red-500 bg-red-50/30"
                />
              </div>

              <div className="md:col-span-2 space-y-2 bg-purple-50/70 p-4 rounded-2xl border border-purple-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/60 pb-2">
                  <div>
                    <label className="block text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-purple-600" /> Hospital Google Maps GPS Location *
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Pin exact hospital location for real-time distance calculations and patient navigation.
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setLocVerificationModalOpen(true)}
                      className="bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] hover:from-[#6949F2] text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-amber-300 animate-bounce" /> 📍 Verify GPS Location
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapPickerOpen(true)}
                      className="bg-white hover:bg-purple-100 text-purple-900 border border-purple-300 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Compass className="w-4 h-4 text-purple-600" /> Select on Map
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Pinned Address / City</span>
                    <p className="text-xs font-bold text-slate-800">
                      {address || city ? `${address}${city ? `, ${city}` : ""}` : "Click 'Verify GPS Location' to pin hospital location"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Verified Coordinates</span>
                    <p className={`text-xs font-mono font-bold ${hospLat && hospLng && isLocVerified ? "text-purple-700" : "text-amber-700 font-sans font-medium"}`}>
                      {hospLat && hospLng && isLocVerified
                        ? `Lat: ${hospLat.toFixed(4)}, Lng: ${hospLng.toFixed(4)}`
                        : "📍 Not Set (Verification Required)"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Verification Status</span>
                    {hospLat && hospLng && isLocVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified ({accuracy}m accuracy)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Pending GPS Verification
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-purple-100">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3 text-purple-600" /> Or Paste Google Maps Share Link
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://maps.app.goo.gl/... or 18.5204, 73.8567"
                    value={googleMapsUrl}
                    onChange={(e) => {
                      setGoogleMapsUrl(e.target.value);
                      const parsed = parseGoogleMapsUrl(e.target.value);
                      if (parsed) {
                        setHospLat(parsed.lat);
                        setHospLng(parsed.lng);
                        if (parsed.address) setAddress(parsed.address);
                      }
                    }}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500 bg-white"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://myhospital.org"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: FACILITIES & COUNTS */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-lg font-serif">
                  2. Hospital Facilities & Quantity Counts
                </h3>
              </div>
              <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                Check facilities & enter quantity
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {defaultFacilityNames.map((facName) => {
                const item = selectedFacilities[facName] || { enabled: false, count: 0 };
                return (
                  <div
                    key={facName}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      item.enabled
                        ? "bg-purple-50/80 border-purple-300 shadow-sm"
                        : "bg-slate-50 border-slate-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => handleFacilityToggle(facName)}
                          className="w-4 h-4 text-purple-700 rounded focus:ring-purple-500"
                        />
                        {facName}
                      </label>
                    </div>

                    {item.enabled && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-purple-200/60">
                        <span className="text-[10px] text-slate-500 font-semibold">Quantity Count:</span>
                        <input
                          type="number"
                          min={1}
                          value={item.count}
                          onChange={(e) => handleFacilityCountChange(facName, Number(e.target.value))}
                          className="w-20 bg-white border border-purple-300 rounded-lg p-1 text-xs font-bold text-purple-900 text-center"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: MEDICAL DEPARTMENTS & SERVICES */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-lg font-serif">
                3. Medical Departments & Clinical Services Offered
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-2">
                Medical Departments (Select all active departments):
              </label>
              <div className="flex flex-wrap gap-2">
                {availableDepartments.map((dept) => {
                  const isSel = selectedDepartments.includes(dept);
                  return (
                    <button
                      type="button"
                      key={dept}
                      onClick={() => toggleDept(dept)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSel
                          ? "bg-purple-700 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700"
                      }`}
                    >
                      {isSel && "✓ "} {dept}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-900 mb-2">
                Special Services & Patient Schemes:
              </label>
              <div className="flex flex-wrap gap-2">
                {availableServices.map((srv) => {
                  const isSel = selectedServices.includes(srv);
                  return (
                    <button
                      type="button"
                      key={srv}
                      onClick={() => toggleService(srv)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSel
                          ? "bg-emerald-700 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      {isSel && "✓ "} {srv}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 4: ESTIMATED EXPENSE INFORMATION */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-lg font-serif">
                  4. Estimated Expense Schedule & Treatment Charges
                </h3>
              </div>
              <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                Visible to patients for price comparison
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">OPD Consultation Fee (₹) *</label>
                <input
                  type="number"
                  required
                  value={opdFee}
                  onChange={(e) => setOpdFee(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-purple-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ICU Charges / Day (₹) *</label>
                <input
                  type="number"
                  required
                  value={icuChargesPerDay}
                  onChange={(e) => setIcuChargesPerDay(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-purple-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">General Ward / Day (₹) *</label>
                <input
                  type="number"
                  required
                  value={generalWardPerDay}
                  onChange={(e) => setGeneralWardPerDay(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-purple-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Private Room / Day (₹)</label>
                <input
                  type="number"
                  value={privateRoomPerDay}
                  onChange={(e) => setPrivateRoomPerDay(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-purple-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deluxe Room / Day (₹)</label>
                <input
                  type="number"
                  value={deluxeRoomPerDay}
                  onChange={(e) => setDeluxeRoomPerDay(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-purple-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">MRI Scan Cost (₹)</label>
                <input
                  type="number"
                  value={mriCost}
                  onChange={(e) => setMriCost(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-purple-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CT Scan Cost (₹)</label>
                <input
                  type="number"
                  value={ctScanCost}
                  onChange={(e) => setCtScanCost(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-purple-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Blood Test Cost (₹)</label>
                <input
                  type="number"
                  value={bloodTestCost}
                  onChange={(e) => setBloodTestCost(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-purple-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ambulance Transport (₹)</label>
                <input
                  type="number"
                  value={ambulanceCharges}
                  onChange={(e) => setAmbulanceCharges(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-purple-900"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: UPLOAD VERIFICATION DOCUMENTS */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-lg font-serif">
                  5. Upload Government Verification Certificates
                </h3>
              </div>
              <span className="text-xs text-amber-800 font-bold bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                Inspected by Govt Admin
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUpload
                label="Upload Hospital License"
                value={hospitalLicenseUrl}
                onChange={(val) => setHospitalLicenseUrl(val)}
                iconType="document"
                required
                description="Valid state health authority certificate (PDF, JPG, PNG)"
              />

              <FileUpload
                label="Upload Registration Certificate"
                value={govRegistrationCertUrl}
                onChange={(val) => setGovRegistrationCertUrl(val)}
                iconType="document"
                required
                description="Official municipal / district registration (PDF, JPG, PNG)"
              />

              <FileUpload
                label="Upload NABH Certificate (Optional)"
                value={nabhCertUrl}
                onChange={(val) => setNabhCertUrl(val)}
                iconType="document"
                description="NABH Accreditation proof document (PDF, JPG, PNG)"
              />

              <FileUpload
                label="Upload Ownership Proof"
                value={ownershipProofUrl}
                onChange={(val) => setOwnershipProofUrl(val)}
                iconType="document"
                required
                description="Ownership or property lease agreement (PDF, JPG, PNG)"
              />
            </div>
          </div>

          {/* FINAL SUBMISSION BUTTON */}
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-6 text-white text-center shadow-xl flex flex-col items-center justify-center space-y-3 border border-purple-800">
            <ShieldCheck className="w-10 h-10 text-amber-300 animate-pulse" />
            <h3 className="text-xl font-bold font-serif">Ready to Authenticate Hospital?</h3>
            <p className="text-xs text-purple-200 max-w-xl">
              Submitting sends your complete hospital profile, expense structure, and verification certificates directly to the Admin Verification Dashboard.
            </p>

            <button
              type="submit"
              className="mt-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-purple-950 font-extrabold text-sm px-8 py-4 rounded-2xl shadow-xl shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-2 transform hover:scale-105"
            >
              <Sparkles className="w-5 h-5 text-purple-900" />
              Submit for Admin Authentication
            </button>
          </div>
        </form>
      )}

      {/* Hospital Location Verification Modal */}
      <HospitalLocationVerificationModal
        isOpen={locVerificationModalOpen}
        onClose={() => setLocVerificationModalOpen(false)}
        initialLat={hospLat || undefined}
        initialLng={hospLng || undefined}
        initialAddress={address}
        initialCity={city}
        initialState={stateName}
        initialPinCode={pinCode}
        onVerifyLocation={(loc) => {
          setHospLat(loc.lat);
          setHospLng(loc.lng);
          setAccuracy(loc.accuracy);
          setIsLocVerified(loc.isVerified);
          if (loc.address) setAddress(loc.address);
          if (loc.city) setCity(loc.city);
          if (loc.state) setStateName(loc.state);
          if (loc.pinCode) setPinCode(loc.pinCode);
          setGoogleMapsUrl(`https://www.google.com/maps?q=${loc.lat},${loc.lng}`);
        }}
      />

      {/* Location Map Picker Modal for Hospital Location */}
      <LocationMapPickerModal
        isOpen={mapPickerOpen}
        onClose={() => setMapPickerOpen(false)}
        initialLat={hospLat || undefined}
        initialLng={hospLng || undefined}
        initialAddress={address || `${city}, ${stateName}`}
        title="Pin Hospital GPS Location on Map"
        onConfirmLocation={(loc) => {
          setHospLat(loc.lat);
          setHospLng(loc.lng);
          setIsLocVerified(true);
          if (loc.address) setAddress(loc.address);
          if (loc.googleMapsUrl) setGoogleMapsUrl(loc.googleMapsUrl);
        }}
      />
    </div>
  );
};
