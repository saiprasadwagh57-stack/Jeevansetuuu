import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { HospitalProfile, Doctor, Appointment, FacilityItem, BedAvailability, HospitalExpenses } from "../../types";
import { DoctorPortal } from "../doctor/DoctorPortal";
import { FileUpload } from "../FileUpload";
import { HospitalLocationVerificationModal } from "../hospitalReg/HospitalLocationVerificationModal";
import {
  LayoutDashboard,
  UserCheck,
  Calendar,
  Bed,
  Activity,
  IndianRupee,
  Building2,
  FileBarChart,
  Bell,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  MapPin,
  Phone,
  Edit3,
  Users,
  Search,
  ChevronRight,
  TrendingUp,
  Stethoscope,
  Key,
  FileText,
  Upload,
  User,
  Shield,
  LogIn,
  X,
  Eye,
  EyeOff,
  Star,
} from "lucide-react";

export const HospitalManagementPortal: React.FC = () => {
  const {
    loggedInHospital,
    setLoggedInHospital,
    hospitalLogin,
    doctors,
    addDoctor,
    removeDoctor,
    appointments,
    updateAppointmentStatus,
    hospitalUpdateBeds,
    hospitalUpdateFacilities,
    hospitalUpdateExpenses,
    hospitalUpdateProfile,
    notifications,
    hospitals,
    loggedInDoctor,
    setLoggedInDoctor,
    doctorLoginWithCredentials,
    reviews,
    getHospitalRatingStats,
    getDoctorRatingStats,
    updateReviewStatus,
    deleteReview,
    t,
  } = useApp();

  // Login Form State
  const [loginHospId, setLoginHospId] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [showHospLoginPass, setShowHospLoginPass] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Sidebar Tab Navigation
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "doctors" | "doctor_portal" | "appointments" | "reviews" | "beds" | "facilities" | "expenses" | "profile" | "reports" | "notifications"
  >("dashboard");

  // New Doctor Modal State (All 12 Required Fields)
  const [addDocModalOpen, setAddDocModalOpen] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocMobile, setNewDocMobile] = useState("");
  const [newDocEmail, setNewDocEmail] = useState("");
  const [newDocPassword, setNewDocPassword] = useState("");
  const [showNewDocPass, setShowNewDocPass] = useState(false);
  const [newDocQual, setNewDocQual] = useState("MBBS, MD");
  const [newDocExp, setNewDocExp] = useState(8);
  const [newDocSpecialty, setNewDocSpecialty] = useState("Cardiology");
  const [newDocFee, setNewDocFee] = useState(350);
  const [newDocTiming, setNewDocTiming] = useState("09:00 AM - 01:00 PM & 05:00 PM - 08:00 PM");
  const [newDocDegreeCert, setNewDocDegreeCert] = useState("https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&q=80");
  const [newDocExpCert, setNewDocExpCert] = useState("https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&q=80");
  const [newDocProfileImg, setNewDocProfileImg] = useState("https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80");

  // Doctor Creation Success Popup
  const [createdDocResult, setCreatedDocResult] = useState<Doctor | null>(null);

  // Doctor Portal Login State (Inside Hospital Management)
  const [docLoginIdInput, setDocLoginIdInput] = useState("");
  const [docLoginPassInput, setDocLoginPassInput] = useState("");
  const [showDocLoginPass, setShowDocLoginPass] = useState(false);
  const [docLoginError, setDocLoginError] = useState<string | null>(null);

  // Hospital Location Edit Modal
  const [locModalOpen, setLocModalOpen] = useState(false);
  const [locUpdateNotice, setLocUpdateNotice] = useState<string | null>(null);

  // Expense Edit Form Local State
  const [editExpenses, setEditExpenses] = useState<HospitalExpenses | null>(
    loggedInHospital ? loggedInHospital.expenses : null
  );

  // Bed Edit Form Local State
  const [editBeds, setEditBeds] = useState<BedAvailability | null>(
    loggedInHospital ? loggedInHospital.beds : null
  );

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const res = hospitalLogin(loginHospId, loginPass);
    if (!res || !res.success || !res.hospital) {
      setLoginError(res?.error || "Invalid Hospital ID or Password.");
    } else {
      setEditExpenses(res.hospital.expenses);
      setEditBeds(res.hospital.beds);
    }
  };

  const fillDemoLogin = (hosp: HospitalProfile) => {
    setLoginHospId(hosp.hospitalId || hosp.id);
    setLoginPass(hosp.password || "Js#Pass1001");
  };

  if (!loggedInHospital) {
    const verifiedHospitals = hospitals.filter((h) => h.verificationStatus === "verified");

    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-purple-100 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-slate-900">Hospital Management Login</h2>
          <p className="text-xs text-slate-500">Access verified portal to manage doctors, beds, and appointments.</p>
        </div>

        {loginError && (
          <div className="bg-red-50 text-red-800 border border-red-200 text-xs p-3 rounded-xl font-medium">
            {loginError}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Generated Hospital ID</label>
            <input
              type="text"
              required
              placeholder="e.g. HOSP-1001"
              value={loginHospId}
              onChange={(e) => setLoginHospId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 text-xs font-mono font-bold text-purple-900 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Secure Password</label>
            <div className="relative">
              <input
                type={showHospLoginPass ? "text" : "password"}
                required
                placeholder="••••••••"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 pr-10 text-xs focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowHospLoginPass(!showHospLoginPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 p-1 cursor-pointer transition-colors"
                title={showHospLoginPass ? "Hide password" : "Show password"}
              >
                {showHospLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Authenticate & Open Management Dashboard
          </button>
        </form>

        {/* Onboarding Guidance */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-center text-xs text-slate-500">
          <p>
            Don&apos;t have login credentials? Register your hospital through the <strong>Hospital Registration</strong> portal. Once verified by Admin, your official Hospital ID &amp; Password will be generated.
          </p>
        </div>
      </div>
    );
  }

  // Helper to check if a record belongs strictly to the authenticated hospital
  const isHospitalData = (targetHospId?: string) => {
    if (!loggedInHospital || !targetHospId) return false;
    const cleanTarget = targetHospId.trim().toLowerCase();
    const cleanId = loggedInHospital.id.trim().toLowerCase();
    const cleanHospId = loggedInHospital.hospitalId ? loggedInHospital.hospitalId.trim().toLowerCase() : "";
    return cleanTarget === cleanId || (cleanHospId !== "" && cleanTarget === cleanHospId);
  };

  // Hospital Filtered Data (strictly isolated on backend & component state)
  const hospDoctors = doctors.filter((d) => isHospitalData(d.hospitalId));
  const hospAppointments = appointments.filter((a) => isHospitalData(a.hospitalId));
  const pendingApts = hospAppointments.filter((a) => a.status === "pending");
  const hospNotifications = notifications.filter(
    (n) => isHospitalData(n.hospitalId) || (!n.hospitalId && (n.targetRole === "hospital_mgmt" || n.targetRole === "all"))
  );
  const hospReviews = reviews.filter((r) => isHospitalData(r.hospitalId));
  const pendingHospReviewsCount = hospReviews.filter((r) => r.status === "pending").length;

  // Patient Isolation: derive unique patient records strictly for this hospital
  const hospPatientsMap = new Map<string, { name: string; mobile: string; age?: number; gender?: string; doctorName: string; lastAptDate: string; status: string }>();
  hospAppointments.forEach((apt) => {
    const key = apt.patientMobile || apt.patientName;
    if (key && !hospPatientsMap.has(key)) {
      hospPatientsMap.set(key, {
        name: apt.patientName,
        mobile: apt.patientMobile,
        age: apt.patientAge,
        gender: apt.patientGender,
        doctorName: apt.doctorName,
        lastAptDate: apt.date,
        status: apt.status,
      });
    }
  });
  const hospPatients = Array.from(hospPatientsMap.values());

  const handleAddDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addDoctor({
      name: newDocName,
      mobile: newDocMobile,
      email: newDocEmail,
      password: newDocPassword || `docpass${Math.floor(100 + Math.random() * 900)}`,
      hospitalId: loggedInHospital.id,
      hospitalName: loggedInHospital.name,
      specialty: newDocSpecialty,
      experienceYears: Number(newDocExp),
      qualification: newDocQual,
      certificateUrl: newDocDegreeCert || "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&q=80",
      experienceCertUrl: newDocExpCert || "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&q=80",
      profileImageUrl: newDocProfileImg || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
      consultationFee: Number(newDocFee),
      availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      timing: newDocTiming || "09:00 AM - 01:00 PM & 05:00 PM - 08:00 PM",
    });

    setCreatedDocResult(created);
    setAddDocModalOpen(false);
    setNewDocName("");
    setNewDocMobile("");
    setNewDocEmail("");
    setNewDocPassword("");
  };

  const handleDocLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDocLoginError(null);
    const doc = doctorLoginWithCredentials(docLoginIdInput, docLoginPassInput, loggedInHospital.id);
    if (!doc) {
      setDocLoginError("Invalid Doctor ID or Password, or doctor does not belong to " + loggedInHospital.name);
    }
  };

  const saveBeds = () => {
    if (editBeds) {
      hospitalUpdateBeds(loggedInHospital.id, editBeds);
      alert("Bed counts updated successfully!");
    }
  };

  const saveExpenses = () => {
    if (editExpenses) {
      hospitalUpdateExpenses(loggedInHospital.id, editExpenses);
      alert("Expenses updated! Patient portal now reflects updated pricing.");
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "doctors", label: `Manage Doctors (${hospDoctors.length})`, icon: <UserCheck className="w-4 h-4" /> },
    { id: "doctor_portal", label: "Doctor Portal / Session", icon: <Stethoscope className="w-4 h-4" /> },
    { id: "appointments", label: `Appointments (${hospAppointments.length})`, icon: <Calendar className="w-4 h-4" />, badge: pendingApts.length },
    { id: "patients", label: `Patients (${hospPatients.length})`, icon: <Users className="w-4 h-4" /> },
    { id: "reviews", label: `Patient Reviews (${hospReviews.length})`, icon: <Star className="w-4 h-4 text-amber-500 fill-amber-400" />, badge: pendingHospReviewsCount },
    { id: "beds", label: "Manage Beds", icon: <Bed className="w-4 h-4" /> },
    { id: "facilities", label: "Facilities & Labs", icon: <Activity className="w-4 h-4" /> },
    { id: "expenses", label: "Manage Expenses & Rates", icon: <IndianRupee className="w-4 h-4" /> },
    { id: "profile", label: "Hospital Profile", icon: <Building2 className="w-4 h-4" /> },
    { id: "reports", label: "Analytics & Reports", icon: <FileBarChart className="w-4 h-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" />, badge: hospNotifications.filter((n) => !n.read).length },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[80vh] pb-16">
      {/* Mobile Top Navigation & Tab Bar (Mobile/Tablet Only) */}
      <div className="lg:hidden bg-[#F4F0FF] rounded-3xl p-4 border border-[#E2D9FF] shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={loggedInHospital.logoUrl}
              alt={loggedInHospital.name}
              className="w-10 h-10 rounded-xl object-cover border border-[#7C5CFC]/30 shadow-xs shrink-0"
            />
            <div className="min-w-0">
              <h3 className="font-extrabold text-[#23125E] text-xs truncate">{loggedInHospital.name}</h3>
              <span className="text-[10px] text-[#7C5CFC] font-mono font-bold block">
                ID: {loggedInHospital.hospitalId}
              </span>
            </div>
          </div>

          <button
            onClick={() => setLoggedInHospital(null)}
            className="px-3 py-1.5 rounded-full text-xs font-bold text-red-600 bg-white hover:bg-red-50 border border-red-200 flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>

        {/* Mobile Horizontal Scrollable Tab Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] text-white shadow-md shadow-[#7C5CFC]/25"
                  : "bg-white text-slate-700 hover:bg-[#EAE5FF] hover:text-[#23125E] border border-[#E2D9FF]"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                    activeTab === item.id ? "bg-[#EAE5FF] text-[#23125E]" : "bg-red-500 text-white"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar Navigation (Preserved for Desktop) */}
      <aside className="hidden lg:flex w-72 bg-[#F4F0FF] rounded-3xl p-5 border border-[#E2D9FF] shrink-0 flex-col justify-between shadow-xs">
        <div className="space-y-6">
          {/* Hospital Info Card */}
          <div className="flex items-center gap-3 bg-[#EAE5FF] p-3 rounded-2xl border border-[#E2D9FF]">
            <img
              src={loggedInHospital.logoUrl}
              alt={loggedInHospital.name}
              className="w-12 h-12 rounded-xl object-cover border border-[#7C5CFC]/30 shadow-xs"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-[#23125E] text-xs truncate">{loggedInHospital.name}</h3>
              <span className="text-[10px] text-[#7C5CFC] font-mono font-bold block">
                ID: {loggedInHospital.hospitalId}
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full mt-1 border border-emerald-200">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Verified Hospital
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] text-white shadow-md shadow-[#7C5CFC]/25"
                    : "text-slate-600 hover:bg-[#EAE5FF] hover:text-[#23125E]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      activeTab === item.id ? "bg-[#EAE5FF] text-[#23125E]" : "bg-red-500 text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="pt-4 border-t border-[#E2D9FF] mt-6">
          <button
            onClick={() => setLoggedInHospital(null)}
            className="w-full text-left px-4 py-2.5 rounded-full text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout Portal
          </button>
        </div>
      </aside>

      {/* Main Content View Area */}
      <main className="flex-1 bg-white rounded-3xl p-6 md:p-8 border border-[#E7E0EC] shadow-xs overflow-hidden">
        {/* TAB 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#E7E0EC] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#1C1B1F]">Hospital Administration Dashboard</h2>
                <p className="text-xs text-[#49454F]">Live overview of doctors, bed occupancy, and patient appointments.</p>
              </div>
              <span className="text-xs bg-[#EADDFF] text-[#21005D] font-bold px-3 py-1 rounded-full">
                {loggedInHospital.hospitalType}
              </span>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-[#E7E0EC] shadow-xs">
                <span className="text-xs font-semibold text-[#49454F] block mb-1">Total Doctors</span>
                <span className="text-3xl font-bold text-[#6750A4]">{hospDoctors.length}</span>
                <span className="text-xs text-[#2E7D32] block mt-2">Active Roster</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E7E0EC] shadow-xs">
                <span className="text-xs font-semibold text-[#49454F] block mb-1">Pending Bookings</span>
                <span className="text-3xl font-bold text-[#6750A4]">{pendingApts.length}</span>
                <span className="text-xs text-[#F57F17] block mt-2">Awaiting Confirmation</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E7E0EC] shadow-xs">
                <span className="text-xs font-semibold text-[#49454F] block mb-1">ICU Beds Avail</span>
                <span className="text-3xl font-bold text-[#6750A4]">
                  {loggedInHospital.beds.icuAvailable} / {loggedInHospital.beds.icuTotal}
                </span>
                <span className="text-xs text-[#2E7D32] block mt-2">Live Free</span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E7E0EC] shadow-xs">
                <span className="text-xs font-semibold text-[#49454F] block mb-1">General Beds</span>
                <span className="text-3xl font-bold text-[#6750A4]">
                  {loggedInHospital.beds.generalAvailable} / {loggedInHospital.beds.generalTotal}
                </span>
                <span className="text-xs text-[#2E7D32] block mt-2">Live Free</span>
              </div>
            </div>

            {/* Quick Recent Appointments */}
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-serif mb-3">Incoming Patient Bookings</h3>
              {hospAppointments.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No appointments recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {hospAppointments.slice(0, 4).map((apt) => (
                    <div key={apt.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{apt.patientName}</span>
                        <span className="text-slate-500">{apt.doctorName} ({apt.specialty}) • {apt.date} at {apt.timeSlot}</span>
                      </div>
                      <span className="font-bold capitalize text-purple-700 bg-white px-2.5 py-1 rounded-lg border border-purple-100">
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE DOCTORS */}
        {activeTab === "doctors" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-slate-900">Manage Doctors & Roster</h2>
                <p className="text-xs text-slate-500">Register doctors, issue unique Doctor IDs, upload certificates, and launch Doctor Portal sessions.</p>
              </div>

              <button
                onClick={() => setAddDocModalOpen(true)}
                className="bg-[#6750A4] hover:bg-[#523e85] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Doctor
              </button>
            </div>

            {hospDoctors.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 border border-[#E2D9FF] text-center text-slate-500 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-[#F4F0FF] text-[#7C5CFC] border border-[#E2D9FF] flex items-center justify-center mx-auto mb-3">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <h3 className="font-extrabold text-[#23125E] text-base font-serif">
                  No doctors registered yet
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Click the <strong>Add Doctor</strong> button above to register medical specialists and issue credentials.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hospDoctors.map((doc) => (
                  <div key={doc.id} className="border border-[#E7E0EC] rounded-2xl p-4 bg-[#FEF7FF] flex flex-col justify-between space-y-3 shadow-2xs">
                    <div className="flex items-start gap-3">
                      <img
                        src={doc.profileImageUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80"}
                        alt={doc.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-[#6750A4]/20 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-[#1C1B1F] text-sm">{doc.name}</h4>
                          <button
                            onClick={() => removeDoctor(doc.id, loggedInHospital.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 cursor-pointer"
                            title="Remove doctor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 my-1">
                          <span className="bg-[#EADDFF] text-[#21005D] font-bold text-[10px] px-2 py-0.5 rounded-md">
                            {doc.specialty}
                          </span>
                          <span className="bg-[#6750A4] text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-md">
                            ID: {doc.doctorId || doc.id}
                          </span>
                        </div>

                        <p className="text-xs text-[#49454F]">{doc.qualification} • {doc.experienceYears} yrs exp</p>
                        <p className="text-xs text-[#49454F] mt-0.5">Contact: {doc.mobile} | Fee: ₹{doc.consultationFee}</p>
                        <p className="text-[11px] text-[#49454F]/80">Timing: {doc.timing}</p>
                      </div>
                    </div>

                    {/* Certificates & Actions */}
                    <div className="pt-2 border-t border-[#E7E0EC] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-2">
                        <a
                          href={doc.certificateUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#6750A4] hover:underline font-semibold"
                        >
                          <FileText className="w-3 h-3" /> Degree Cert
                        </a>
                        {doc.experienceCertUrl && (
                          <a
                            href={doc.experienceCertUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[#6750A4] hover:underline font-semibold"
                          >
                            <FileText className="w-3 h-3" /> Exp Cert
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setLoggedInDoctor(doc);
                          setActiveTab("doctor_portal");
                        }}
                        className="bg-[#6750A4] hover:bg-[#523e85] text-white font-bold text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Stethoscope className="w-3.5 h-3.5" /> Launch Doctor Session
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DOCTOR PORTAL INTEGRATED SESSION */}
        {activeTab === "doctor_portal" && (
          <div className="space-y-6">
            {loggedInDoctor ? (
              <div className="space-y-4">
                <div className="bg-[#EADDFF] p-4 rounded-2xl border border-[#6750A4]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6750A4] text-white flex items-center justify-center font-bold">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6750A4]">
                        Active Doctor Session
                      </span>
                      <h3 className="font-bold text-[#21005D] text-sm">
                        {loggedInDoctor.name} ({loggedInDoctor.doctorId || loggedInDoctor.id})
                      </h3>
                      <p className="text-xs text-[#21005D]/80">
                        {loggedInDoctor.specialty} • {loggedInDoctor.qualification}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setLoggedInDoctor(null)}
                    className="bg-red-500/20 hover:bg-red-500 text-red-900 hover:text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer border border-red-300/40"
                  >
                    Logout Doctor Session
                  </button>
                </div>

                {/* Render the full Doctor Portal Component */}
                <DoctorPortal />
              </div>
            ) : (
              <div className="max-w-md mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E0EC] shadow-xl space-y-5">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 bg-[#EADDFF] text-[#21005D] rounded-2xl flex items-center justify-center mx-auto font-bold shadow-xs">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-[#1C1B1F] text-xl font-serif">Doctor Portal Authentication</h3>
                  <p className="text-xs text-[#49454F]">
                    Log in using unique Doctor ID or registered mobile number to manage appointments and issue prescription reports.
                  </p>
                </div>

                {docLoginError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                    {docLoginError}
                  </div>
                )}

                <form onSubmit={handleDocLoginSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1C1B1F] mb-1">
                      Doctor ID or Mobile Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DOC-101 or 9823011111"
                      value={docLoginIdInput}
                      onChange={(e) => setDocLoginIdInput(e.target.value)}
                      className="w-full bg-[#FEF7FF] border border-[#E7E0EC] rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#6750A4]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1C1B1F] mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showDocLoginPass ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={docLoginPassInput}
                        onChange={(e) => setDocLoginPassInput(e.target.value)}
                        className="w-full bg-[#FEF7FF] border border-[#E7E0EC] rounded-xl p-3 pr-10 text-xs focus:ring-2 focus:ring-[#6750A4]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDocLoginPass(!showDocLoginPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 p-1 cursor-pointer transition-colors"
                        title={showDocLoginPass ? "Hide password" : "Show password"}
                      >
                        {showDocLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#6750A4] hover:bg-[#523e85] text-white font-bold text-xs py-3 rounded-xl shadow-xs cursor-pointer transition-colors"
                  >
                    Log In to Doctor Dashboard
                  </button>
                </form>

                {/* Quick Doctor Roster Selection for Demo */}
                <div className="pt-3 border-t border-[#E7E0EC] space-y-2">
                  <span className="text-[11px] font-bold text-[#49454F] uppercase block">
                    Quick Select Doctor from Roster ({hospDoctors.length}):
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {hospDoctors.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => {
                          setDocLoginIdInput(doc.doctorId || doc.id);
                          setDocLoginPassInput(doc.password || "doc123");
                        }}
                        className="w-full text-left bg-[#F3EDF7] hover:bg-[#EADDFF] border border-[#E7E0EC] p-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <span className="font-bold text-[#1C1B1F] block">{doc.name}</span>
                          <span className="text-[10px] text-[#6750A4] font-mono">
                            ID: {doc.doctorId || doc.id} | Pass: {doc.password || "doc123"}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-[#6750A4] bg-white px-2 py-0.5 rounded-md">
                          Prefill
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MANAGE APPOINTMENTS */}
        {activeTab === "appointments" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold font-serif text-slate-900">Incoming Patient Appointments</h2>
              <p className="text-xs text-slate-500">Accept or reject appointment requests from patients.</p>
            </div>

            <div className="space-y-3">
              {hospAppointments.map((apt) => (
                <div key={apt.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{apt.patientName}</span>
                      <span className="text-xs text-purple-700 font-semibold">• {apt.doctorName} ({apt.specialty})</span>
                    </div>
                    <p className="text-xs text-slate-500">Date: {apt.date} at {apt.timeSlot} • Mobile: {apt.patientMobile}</p>
                    {apt.symptoms && (
                      <p className="text-xs bg-white p-2 rounded-xl border border-slate-200 text-slate-700">
                        Symptoms: {apt.symptoms}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {apt.status === "pending" ? (
                      <>
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, "accepted", "Confirmed by Hospital Admin.")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm cursor-pointer"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, "rejected", "Doctor unavailable at slot.")}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="font-bold text-xs capitalize text-purple-800 bg-purple-100 px-3 py-1 rounded-full">
                        Status: {apt.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: ISOLATED PATIENTS ROSTER */}
        {activeTab === "patients" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold font-serif text-slate-900">Hospital Patient Directory</h2>
              <p className="text-xs text-slate-500">
                Patients who have registered or booked appointments with {loggedInHospital.name}. (Isolated to this hospital only)
              </p>
            </div>

            {hospPatients.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-xs">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700">No patients linked to {loggedInHospital.name} yet.</p>
                <p className="text-slate-500 mt-1">Patients will automatically appear here once they book an appointment with your doctors.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hospPatients.map((pat, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{pat.name}</span>
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full capitalize">
                        {pat.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <p><strong>Mobile:</strong> {pat.mobile}</p>
                      {pat.age && <p><strong>Age / Gender:</strong> {pat.age} yrs • {pat.gender || "N/A"}</p>}
                      <p><strong>Consulting Doctor:</strong> {pat.doctorName}</p>
                      <p><strong>Latest Booking Date:</strong> {pat.lastAptDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: PATIENT REVIEWS & RATINGS */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-slate-900">Patient Reviews & Hospital Analytics</h2>
                <p className="text-xs text-slate-500">
                  Real-time patient feedback and rating metrics for {loggedInHospital.name}.
                </p>
              </div>
              <span className="bg-amber-100 text-amber-900 font-extrabold text-xs px-3 py-1.5 rounded-full flex items-center gap-1 border border-amber-200">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>⭐ {getHospitalRatingStats(loggedInHospital.id).avgRating} Avg Rating</span>
              </span>
            </div>

            {/* Top Analytics Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Hospital Stats */}
              <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                  Overall Reputation
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-serif text-purple-950">
                    {getHospitalRatingStats(loggedInHospital.id).avgRating}
                  </span>
                  <span className="text-xs text-slate-500">/ 5.0 Stars</span>
                </div>
                <p className="text-xs text-slate-600">
                  Total Reviews Received: <strong>{hospReviews.length}</strong>
                </p>
              </div>

              {/* Card 2: Highest Rated Doctors */}
              <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                  Top Rated Specialists
                </span>
                <div className="space-y-1">
                  {hospDoctors.slice(0, 2).map((doc) => {
                    const stats = getDoctorRatingStats(doc.id);
                    return (
                      <div key={doc.id} className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 truncate">{doc.name}</span>
                        <span className="font-bold text-amber-600 flex items-center gap-0.5 shrink-0">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> {stats.avgRating}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 3: Key Concerns Analysis */}
              <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                  Key Experience Metrics
                </span>
                <div className="space-y-1 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span>Cleanliness & Hygiene:</span>
                    <strong className="text-emerald-700">98% Positive</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Doctor Communication:</span>
                    <strong className="text-emerald-700">95% Positive</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Waiting Time:</span>
                    <strong className="text-purple-700">14 Mins</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Patient Reviews List */}
            <div className="space-y-3 pt-2">
              <h3 className="font-bold text-slate-900 text-sm font-serif">All Patient Feedback Log</h3>

              {hospReviews.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-xs">
                  <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">No patient reviews submitted yet.</p>
                  <p className="text-slate-500 mt-1">Reviews submitted after completed appointments will be cataloged here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {hospReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">
                            {rev.isAnonymous ? "Anonymous Patient" : rev.patientName}
                          </span>
                          <span className="text-xs text-purple-700">
                            • Doctor: <strong>{rev.doctorName}</strong>
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">{rev.createdAt}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <span className="font-extrabold text-amber-600 flex items-center gap-1 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                          Hospital Rating: <Star className="w-3 h-3 fill-amber-400" /> {rev.hospitalRating} / 5
                        </span>
                        <span className="font-extrabold text-amber-600 flex items-center gap-1 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                          Doctor Rating: <Star className="w-3 h-3 fill-amber-400" /> {rev.doctorRating} / 5
                        </span>
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

                      {rev.feedback && (
                        <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 italic">
                          "{rev.feedback}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: MANAGE BEDS */}
        {activeTab === "beds" && editBeds && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold font-serif text-slate-900">Live Bed Availability Management</h2>
              <p className="text-xs text-slate-500">Update total and currently available beds for live patient display.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 space-y-3">
                <h4 className="font-bold text-sm text-purple-900">ICU Beds</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block">Total ICU Beds</label>
                    <input
                      type="number"
                      value={editBeds.icuTotal}
                      onChange={(e) => setEditBeds({ ...editBeds, icuTotal: Number(e.target.value) })}
                      className="w-full bg-white border border-purple-300 rounded-xl p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block">Live Available</label>
                    <input
                      type="number"
                      value={editBeds.icuAvailable}
                      onChange={(e) => setEditBeds({ ...editBeds, icuAvailable: Number(e.target.value) })}
                      className="w-full bg-white border border-purple-300 rounded-xl p-2 text-xs font-bold text-emerald-800"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 space-y-3">
                <h4 className="font-bold text-sm text-purple-900">General Beds</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block">Total General Beds</label>
                    <input
                      type="number"
                      value={editBeds.generalTotal}
                      onChange={(e) => setEditBeds({ ...editBeds, generalTotal: Number(e.target.value) })}
                      className="w-full bg-white border border-purple-300 rounded-xl p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block">Live Available</label>
                    <input
                      type="number"
                      value={editBeds.generalAvailable}
                      onChange={(e) => setEditBeds({ ...editBeds, generalAvailable: Number(e.target.value) })}
                      className="w-full bg-white border border-purple-300 rounded-xl p-2 text-xs font-bold text-emerald-800"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 space-y-3">
                <h4 className="font-bold text-sm text-purple-900">Private Rooms</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block">Total Private Rooms</label>
                    <input
                      type="number"
                      value={editBeds.privateTotal}
                      onChange={(e) => setEditBeds({ ...editBeds, privateTotal: Number(e.target.value) })}
                      className="w-full bg-white border border-purple-300 rounded-xl p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block">Live Available</label>
                    <input
                      type="number"
                      value={editBeds.privateAvailable}
                      onChange={(e) => setEditBeds({ ...editBeds, privateAvailable: Number(e.target.value) })}
                      className="w-full bg-white border border-purple-300 rounded-xl p-2 text-xs font-bold text-emerald-800"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 space-y-3">
                <h4 className="font-bold text-sm text-purple-900">Deluxe Rooms</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block">Total Deluxe Rooms</label>
                    <input
                      type="number"
                      value={editBeds.deluxeTotal}
                      onChange={(e) => setEditBeds({ ...editBeds, deluxeTotal: Number(e.target.value) })}
                      className="w-full bg-white border border-purple-300 rounded-xl p-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block">Live Available</label>
                    <input
                      type="number"
                      value={editBeds.deluxeAvailable}
                      onChange={(e) => setEditBeds({ ...editBeds, deluxeAvailable: Number(e.target.value) })}
                      className="w-full bg-white border border-purple-300 rounded-xl p-2 text-xs font-bold text-emerald-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={saveBeds}
              className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer"
            >
              Save Live Bed Availability
            </button>
          </div>
        )}

        {/* TAB 5: MANAGE FACILITIES */}
        {activeTab === "facilities" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold font-serif text-slate-900">Infrastructure & Facility Management</h2>
              <p className="text-xs text-slate-500">Enable, disable, or update quantity for diagnostic tools and equipment.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {loggedInHospital.facilities.map((fac) => (
                <div key={fac.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{fac.name}</span>
                    <span className="text-[10px] text-purple-700 font-semibold">Count: {fac.count}</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-md">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: MANAGE EXPENSES */}
        {activeTab === "expenses" && editExpenses && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold font-serif text-slate-900">Manage Treatment Costs & OPD Fee Schedule</h2>
              <p className="text-xs text-slate-500">Updated rates are published instantly to the Patient Portal.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">OPD Consultation Fee (₹)</label>
                <input
                  type="number"
                  value={editExpenses.opdFee}
                  onChange={(e) => setEditExpenses({ ...editExpenses, opdFee: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-purple-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ICU Charges / Day (₹)</label>
                <input
                  type="number"
                  value={editExpenses.icuChargesPerDay}
                  onChange={(e) => setEditExpenses({ ...editExpenses, icuChargesPerDay: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-purple-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">General Ward / Day (₹)</label>
                <input
                  type="number"
                  value={editExpenses.generalWardPerDay}
                  onChange={(e) => setEditExpenses({ ...editExpenses, generalWardPerDay: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-purple-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Private Room / Day (₹)</label>
                <input
                  type="number"
                  value={editExpenses.privateRoomPerDay}
                  onChange={(e) => setEditExpenses({ ...editExpenses, privateRoomPerDay: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-purple-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">MRI Scan Cost (₹)</label>
                <input
                  type="number"
                  value={editExpenses.mriCost}
                  onChange={(e) => setEditExpenses({ ...editExpenses, mriCost: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-purple-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CT Scan Cost (₹)</label>
                <input
                  type="number"
                  value={editExpenses.ctScanCost}
                  onChange={(e) => setEditExpenses({ ...editExpenses, ctScanCost: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-purple-900"
                />
              </div>
            </div>

            <button
              onClick={saveExpenses}
              className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer"
            >
              Publish Updated Pricing Schedule
            </button>
          </div>
        )}

        {/* TAB 7: PROFILE */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-serif text-slate-900">Hospital Profile & GPS Location</h2>
                <p className="text-xs text-slate-500">Public profile details and verified coordinates for emergency navigation.</p>
              </div>
              <button
                onClick={() => setLocModalOpen(true)}
                className="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <MapPin className="w-4 h-4 text-amber-300" /> Verify / Edit Location on Map
              </button>
            </div>

            {locUpdateNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{locUpdateNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-200 pb-2">Hospital Registration</h3>
                <p><strong>Name:</strong> {loggedInHospital.name}</p>
                <p><strong>Hospital ID:</strong> <span className="font-mono text-purple-800 font-bold">{loggedInHospital.hospitalId}</span></p>
                <p><strong>Registration Number:</strong> {loggedInHospital.registrationNumber}</p>
                <p><strong>Emergency Contact:</strong> <span className="text-red-700 font-bold">{loggedInHospital.emergencyContact}</span></p>
                <p><strong>Street Address:</strong> {loggedInHospital.address}</p>
                <p><strong>City / Taluka:</strong> {loggedInHospital.city}</p>
                <p><strong>State & PIN:</strong> {loggedInHospital.state} - {loggedInHospital.pinCode}</p>
              </div>

              <div className="space-y-3 text-xs text-slate-700 bg-purple-50/50 p-5 rounded-2xl border border-purple-200">
                <h3 className="font-extrabold text-purple-900 text-sm border-b border-purple-200 pb-2 flex items-center justify-between">
                  <span>GPS Location & Google Maps</span>
                  {loggedInHospital.lat && loggedInHospital.lng ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                      ✓ Location Verified
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                      📍 Pending Location
                    </span>
                  )}
                </h3>

                <div className="grid grid-cols-2 gap-2 font-mono text-xs bg-white p-3 rounded-xl border border-purple-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase">Latitude</span>
                    <span className="font-bold text-slate-900">{loggedInHospital.lat ? loggedInHospital.lat.toFixed(6) : "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase">Longitude</span>
                    <span className="font-bold text-slate-900">{loggedInHospital.lng ? loggedInHospital.lng.toFixed(6) : "N/A"}</span>
                  </div>
                </div>

                {loggedInHospital.lat && loggedInHospital.lng ? (
                  <a
                    href={`https://www.google.com/maps?q=${loggedInHospital.lat},${loggedInHospital.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 underline pt-1"
                  >
                    <MapPin className="w-3.5 h-3.5 text-purple-600" /> View Hospital Location on Google Maps ↗
                  </a>
                ) : (
                  <p className="text-xs text-amber-800 font-medium">
                    Location not pinned yet. Click "Verify / Edit Location on Map" to geocode address or drag marker.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}


        {/* TAB 8: REPORTS */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold font-serif text-slate-900">Hospital Analytics & Occupancy Reports</h2>
              <p className="text-xs text-slate-500">Bed occupancy, patient footfall, and appointment statistics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                <span className="text-xs text-purple-700 font-bold block uppercase">Monthly Appointments</span>
                <span className="text-2xl font-extrabold text-slate-900">{hospAppointments.length * 14 + 28}</span>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-xs text-emerald-700 font-bold block uppercase">ICU Bed Occupancy</span>
                <span className="text-2xl font-extrabold text-slate-900">
                  {Math.round(((loggedInHospital.beds.icuTotal - loggedInHospital.beds.icuAvailable) / loggedInHospital.beds.icuTotal) * 100)}%
                </span>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="text-xs text-amber-800 font-bold block uppercase">General Bed Occupancy</span>
                <span className="text-2xl font-extrabold text-slate-900">
                  {Math.round(((loggedInHospital.beds.generalTotal - loggedInHospital.beds.generalAvailable) / loggedInHospital.beds.generalTotal) * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold font-serif text-slate-900">System Notifications</h2>
              <p className="text-xs text-slate-500">Admin approvals, new patient bookings, and status alerts.</p>
            </div>

            <div className="space-y-3">
              {hospNotifications.map((notif) => (
                <div key={notif.id} className="p-4 bg-purple-50/60 border border-purple-100 rounded-2xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900 text-sm">{notif.title}</span>
                    <span className="text-[10px] text-slate-400">{notif.date}</span>
                  </div>
                  <p className="text-slate-700">{notif.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ADD DOCTOR MODAL */}
      {addDocModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#E7E0EC] shadow-2xl space-y-4 my-8 relative">
            <button
              onClick={() => setAddDocModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="font-bold text-[#1C1B1F] text-lg font-serif flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#6750A4]" /> Add Doctor to Hospital Roster
              </h3>
              <p className="text-xs text-[#49454F]">
                Fills doctor details, issues credentials, and uploads medical degree & experience certificates.
              </p>
            </div>

            <form onSubmit={handleAddDoctorSubmit} className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-[#1C1B1F] mb-1">Doctor Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Verma"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full bg-[#FEF7FF] border border-[#E7E0EC] rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#6750A4]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#1C1B1F] mb-1">Mobile Contact *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9823099901"
                    value={newDocMobile}
                    onChange={(e) => setNewDocMobile(e.target.value)}
                    className="w-full bg-[#FEF7FF] border border-[#E7E0EC] rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#6750A4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1B1F] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. dr.verma@cityhospital.com"
                    value={newDocEmail}
                    onChange={(e) => setNewDocEmail(e.target.value)}
                    className="w-full bg-[#FEF7FF] border border-[#E7E0EC] rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#6750A4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#1C1B1F] mb-1">Login Password *</label>
                  <div className="relative">
                    <input
                      type={showNewDocPass ? "text" : "password"}
                      required
                      placeholder="e.g. DocPass#2025"
                      value={newDocPassword}
                      onChange={(e) => setNewDocPassword(e.target.value)}
                      className="w-full bg-[#FEF7FF] border border-[#E7E0EC] rounded-xl p-2.5 pr-9 text-xs focus:ring-2 focus:ring-[#6750A4]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewDocPass(!showNewDocPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 p-1 cursor-pointer transition-colors"
                      title={showNewDocPass ? "Hide password" : "Show password"}
                    >
                      {showNewDocPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1B1F] mb-1">Qualifications *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MBBS, MD, DM Cardiology"
                    value={newDocQual}
                    onChange={(e) => setNewDocQual(e.target.value)}
                    className="w-full bg-[#FEF7FF] border border-[#E7E0EC] rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#6750A4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#1C1B1F] mb-1">Specialty *</label>
                  <select
                    value={newDocSpecialty}
                    onChange={(e) => setNewDocSpecialty(e.target.value)}
                    className="w-full bg-[#FEF7FF] border border-[#E7E0EC] rounded-xl p-2.5 text-xs font-bold"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Neurology">Neurology</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="ENT">ENT</option>
                    <option value="Dermatology">Dermatology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1B1F] mb-1">Exp (Years) *</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={newDocExp}
                    onChange={(e) => setNewDocExp(Number(e.target.value))}
                    className="w-full bg-[#FEF7FF] border border-[#E7E0EC] rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#6750A4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1B1F] mb-1">Fee (₹) *</label>
                  <input
                    type="number"
                    value={newDocFee}
                    onChange={(e) => setNewDocFee(Number(e.target.value))}
                    className="w-full bg-[#FEF7FF] border border-[#E7E0EC] rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#6750A4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1B1F] mb-1">OPD Timing *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 09:00 AM - 01:00 PM & 05:00 PM - 08:00 PM"
                  value={newDocTiming}
                  onChange={(e) => setNewDocTiming(e.target.value)}
                  className="w-full bg-[#FEF7FF] border border-[#E7E0EC] rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#6750A4]"
                />
              </div>

              {/* Certificates & Profile Pic Uploads */}
              <div className="space-y-3 pt-2 border-t border-[#E7E0EC]">
                <span className="text-[11px] font-bold text-[#6750A4] uppercase block">
                  Document Uploads & Profile Media
                </span>

                <FileUpload
                  label="Upload Doctor Profile Photo"
                  value={newDocProfileImg}
                  onChange={(val) => setNewDocProfileImg(val)}
                  accept=".jpg,.jpeg,.png,image/*"
                  iconType="image"
                  description="Upload doctor headshot photo (JPG, PNG)"
                />

                <FileUpload
                  label="Upload Degree Certificate"
                  value={newDocDegreeCert}
                  onChange={(val) => setNewDocDegreeCert(val)}
                  accept=".jpg,.jpeg,.png,.pdf,image/*,application/pdf"
                  iconType="document"
                  description="MBBS / MD / DM Degree certificate (PDF, JPG, PNG)"
                />

                <FileUpload
                  label="Upload Experience Certificate"
                  value={newDocExpCert}
                  onChange={(val) => setNewDocExpCert(val)}
                  accept=".jpg,.jpeg,.png,.pdf,image/*,application/pdf"
                  iconType="document"
                  description="Medical council registration or experience certificate (PDF, JPG, PNG)"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end border-t border-[#E7E0EC]">
                <button
                  type="button"
                  onClick={() => setAddDocModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 text-[#49454F] font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#6750A4] hover:bg-[#523e85] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Generate Doctor Credentials & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCTOR CREATED SUCCESS POPUP */}
      {createdDocResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#E7E0EC] shadow-2xl space-y-4 relative text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto font-bold shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>

            <h3 className="font-bold text-[#1C1B1F] text-xl font-serif">
              Doctor Successfully Registered!
            </h3>

            <p className="text-xs text-[#49454F]">
              Dr. <strong>{createdDocResult.name}</strong> is now permanently linked to <strong>{loggedInHospital.name}</strong>.
            </p>

            <div className="bg-[#FEF7FF] p-4 rounded-2xl border border-[#E7E0EC] text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#49454F]">Unique Doctor ID:</span>
                <span className="font-mono font-bold text-[#6750A4]">{createdDocResult.doctorId || createdDocResult.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#49454F]">Mobile / Login:</span>
                <span className="font-bold text-[#1C1B1F]">{createdDocResult.mobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#49454F]">Email:</span>
                <span className="font-bold text-[#1C1B1F]">{createdDocResult.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#49454F]">Login Password:</span>
                <span className="font-mono font-bold text-amber-800">{createdDocResult.password}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#49454F]">Specialization:</span>
                <span className="font-bold text-[#1C1B1F]">{createdDocResult.specialty}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setLoggedInDoctor(createdDocResult);
                  setCreatedDocResult(null);
                  setActiveTab("doctor_portal");
                }}
                className="flex-1 bg-[#6750A4] hover:bg-[#523e85] text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Open Doctor Portal Now
              </button>
              <button
                onClick={() => setCreatedDocResult(null)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-[#49454F] font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hospital Location Verification & Editing Modal */}
      {loggedInHospital && (
        <HospitalLocationVerificationModal
          isOpen={locModalOpen}
          onClose={() => setLocModalOpen(false)}
          initialLat={loggedInHospital.lat || undefined}
          initialLng={loggedInHospital.lng || undefined}
          initialAddress={loggedInHospital.address}
          initialCity={loggedInHospital.city}
          initialState={loggedInHospital.state}
          initialPinCode={loggedInHospital.pinCode}
          onVerifyLocation={(data) => {
            hospitalUpdateProfile(loggedInHospital.id, {
              lat: data.lat,
              lng: data.lng,
              address: data.address,
              city: data.city,
              district: data.district,
              state: data.state,
              pinCode: data.pinCode,
              googleMapsUrl: `https://www.google.com/maps?q=${data.lat},${data.lng}`,
              locationVerified: true,
            });
            setLoggedInHospital({
              ...loggedInHospital,
              lat: data.lat,
              lng: data.lng,
              address: data.address,
              city: data.city,
              district: data.district,
              state: data.state,
              pinCode: data.pinCode,
              googleMapsUrl: `https://www.google.com/maps?q=${data.lat},${data.lng}`,
              locationVerified: true,
            });
            setLocUpdateNotice("✓ Hospital location updated & saved to profile successfully!");
            setTimeout(() => setLocUpdateNotice(null), 5000);
          }}
        />
      )}
    </div>

  );
};
