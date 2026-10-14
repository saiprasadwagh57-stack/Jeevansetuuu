import React, { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { Doctor, Appointment, PrescriptionItem, DiagnosticReport } from "../../types";
import { getCachedAccessToken, uploadMedicalReportToDrive } from "../../services/googleDrive";
import { DigitalCasePaperModal } from "../common/DigitalCasePaperModal";
import {
  Stethoscope,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  FileText,
  Pill,
  Plus,
  Trash2,
  Send,
  Building2,
  Activity,
  Award,
  Check,
  X,
  PlusCircle,
  Upload,
  FileUp,
  AlertCircle,
  Eye,
  Download,
  RefreshCw,
  FileCheck,
  Star,
  ShieldAlert,
} from "lucide-react";

interface AttachedFileInfo {
  dataUrl: string;
  name: string;
  size: string;
  type: string;
}

export const DoctorPortal: React.FC = () => {
  const {
    doctors,
    loggedInDoctor,
    loggedInHospital,
    setLoggedInDoctor,
    appointments,
    updateAppointmentStatus,
    createReport,
    reports,
    deleteReport,
    updateReport,
    reviews,
    getDoctorRatingStats,
  } = useApp();

  // Selected active doctor - strictly scoped to logged in doctor or logged in hospital doctor
  const currentDoc =
    loggedInDoctor ||
    (loggedInHospital
      ? doctors.find(
          (d) =>
            d.hospitalId === loggedInHospital.id ||
            (loggedInHospital.hospitalId && d.hospitalId === loggedInHospital.hospitalId)
        ) || null
      : null);

  // If no doctor is authenticated, render session guard
  if (!currentDoc) {
    return (
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-purple-100 shadow-xl text-center space-y-4 my-6">
        <div className="w-14 h-14 bg-purple-100 text-purple-900 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <Stethoscope className="w-7 h-7 text-purple-800" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 text-xl font-serif">Doctor Session Required</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Please log into an active doctor account using unique Doctor ID and password to access the clinical workspace, review patient appointments, and issue diagnostic reports.
          </p>
        </div>
      </div>
    );
  }

  // Filter appointments strictly for this doctor and hospital
  const docAppointments = appointments.filter(
    (a) =>
      (a.doctorId === currentDoc.id || a.doctorId === currentDoc.doctorId) &&
      a.hospitalId === currentDoc.hospitalId
  );

  // Filter reports uploaded by this doctor
  const docReports = reports.filter(
    (r) =>
      r.doctorId === currentDoc.id || r.doctorId === currentDoc.doctorId
  );

  // Filter reviews for this doctor
  const myReviews = reviews.filter(
    (r) =>
      (r.doctorId === currentDoc.id || r.doctorId === currentDoc.doctorId) &&
      r.status === "approved"
  );
  const myRatingStats = getDoctorRatingStats(currentDoc.id || currentDoc.doctorId || "");

  // Active view tab inside Doctor Workbench: "appointments" | "upload_history" | "my_reviews"
  const [docTab, setDocTab] = useState<"appointments" | "upload_history" | "my_reviews">("appointments");

  // Diagnosis Modal State
  const [diagModalOpen, setDiagModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [diagnosisText, setDiagnosisText] = useState("");
  const [reportType, setReportType] = useState("Blood Test Report");
  const [bpVal, setBpVal] = useState("120/80 mmHg");
  const [pulseVal, setPulseVal] = useState("72 bpm");

  // Prescriptions list state
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    { medicineName: "Paracetamol 650mg", dosage: "1 Tab", timing: "1-0-1 (After Food)", duration: "5 Days" },
  ]);

  // File Upload State
  const [attachedFile, setAttachedFile] = useState<AttachedFileInfo | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "failed">("idle");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // View / Preview Report Modal State
  const [viewingReport, setViewingReport] = useState<DiagnosticReport | null>(null);
  const [casePaperReport, setCasePaperReport] = useState<DiagnosticReport | null>(null);

  // Replace File State
  const [replacingReportId, setReplacingReportId] = useState<string | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);

  const addPrescriptionRow = () => {
    setPrescriptions((prev) => [
      ...prev,
      { medicineName: "", dosage: "1 Tab", timing: "1-0-1 (After Food)", duration: "5 Days" },
    ]);
  };

  const removePrescriptionRow = (idx: number) => {
    setPrescriptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updatePrescriptionRow = (idx: number, field: keyof PrescriptionItem, val: string) => {
    setPrescriptions((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  // Process File Selection
  const processSelectedFile = (file: File) => {
    if (!file) return;

    // Check size limit (20MB)
    const MAX_BYTES = 20 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setUploadStatus("failed");
      setUploadError("File size exceeds 20 MB limit. Please select a smaller document.");
      return;
    }

    // Check file extension / format
    const validExts = [".pdf", ".jpg", ".jpeg", ".png"];
    const extMatch = validExts.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!extMatch && !file.type.match(/(pdf|jpeg|png|jpg)/i)) {
      setUploadStatus("failed");
      setUploadError("Unsupported format. Please upload PDF, JPG, JPEG, or PNG files only.");
      return;
    }

    setUploadError("");
    setUploadStatus("uploading");
    setUploadProgress(25);

    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(pct);
      }
    };

    reader.onload = () => {
      setUploadProgress(100);
      setUploadStatus("success");
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2) + " MB";
      setAttachedFile({
        dataUrl: reader.result as string,
        name: file.name,
        size: sizeMb,
        type: file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
      });
    };

    reader.onerror = () => {
      setUploadStatus("failed");
      setUploadError("Failed to read file from computer. Please retry.");
    };

    reader.readAsDataURL(file);
  };

  const handleOpenDiagnosis = (apt: Appointment) => {
    setSelectedApt(apt);
    setDiagnosisText(`Clinical examination for ${apt.symptoms}. Patient in stable condition.`);
    setAttachedFile(null);
    setUploadStatus("idle");
    setUploadProgress(0);
    setUploadError("");
    setDiagModalOpen(true);
  };

  const handleSaveDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApt || !currentDoc) return;

    const driveToken = getCachedAccessToken();

    const newReport = createReport({
      appointmentId: selectedApt.id,
      patientName: selectedApt.patientName,
      patientMobile: selectedApt.patientMobile,
      patientAge: selectedApt.patientAge || 35,
      patientGender: selectedApt.patientGender || "Male",
      patientId: selectedApt.patientMobile,
      doctorId: currentDoc.id || currentDoc.doctorId,
      doctorName: currentDoc.name,
      hospitalId: currentDoc.hospitalId || selectedApt.hospitalId,
      hospitalName: currentDoc.hospitalName || selectedApt.hospitalName,
      symptoms: selectedApt.symptoms,
      diagnosis: diagnosisText,
      prescriptions: prescriptions.filter((p) => p.medicineName.trim() !== ""),
      reportType,
      fileName: attachedFile?.name,
      fileSize: attachedFile?.size,
      fileType: attachedFile?.type,
      labReportName: attachedFile?.name || `${reportType.replace(/\s+/g, "_")}.pdf`,
      labReportUrl: attachedFile?.dataUrl,
      date: new Date().toISOString().split("T")[0],
      uploadedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      vitals: {
        bp: bpVal,
        pulse: pulseVal,
        temp: "98.6 °F",
        weight: "68 kg",
      },
      driveBackupStatus: driveToken ? "pending" : "not_connected",
    });

    setDiagModalOpen(false);
    setSelectedApt(null);

    // Automatic non-blocking background upload to Google Drive if token available
    if (driveToken) {
      try {
        const driveFile = await uploadMedicalReportToDrive(driveToken, newReport);
        updateReport(newReport.id, {
          driveBackupStatus: "backed_up",
          driveFileUrl: driveFile.webViewLink,
          driveFileId: driveFile.id,
        });
      } catch (err) {
        console.error("Auto Google Drive backup error:", err);
        updateReport(newReport.id, {
          driveBackupStatus: "failed",
        });
      }
    }
  };

  // Replace report file handler
  const handleReplaceFileSelect = (e: React.ChangeEvent<HTMLInputElement>, reportId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert("File size exceeds 20 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2) + " MB";
      updateReport(reportId, {
        fileName: file.name,
        fileSize: sizeMb,
        fileType: file.type,
        labReportName: file.name,
        labReportUrl: reader.result as string,
        date: new Date().toISOString().split("T")[0],
      });
      alert("Medical report file replaced successfully!");
      setReplacingReportId(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-purple-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20 font-serif font-bold text-2xl">
            {currentDoc?.name.charAt(4) || "D"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-400 text-purple-950 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Doctor Consultation Portal
              </span>
              <span className="text-xs text-purple-200">
                {currentDoc?.qualification}
              </span>
            </div>
            <h1 className="text-2xl font-bold font-serif text-white mt-0.5">
              {currentDoc?.name}
            </h1>
            <p className="text-xs text-purple-200/90 flex items-center gap-2 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-purple-300" />
              {currentDoc?.hospitalName} • <strong className="text-amber-300">{currentDoc?.specialty}</strong>
            </p>
          </div>
        </div>

        {/* Doctor Roster Switcher Dropdown */}
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-xs text-purple-100 space-y-1">
          <span className="block text-[10px] uppercase font-bold text-purple-300">Switch Doctor Profile:</span>
          <select
            value={currentDoc?.id}
            onChange={(e) => {
              const found = doctors.find((d) => d.id === e.target.value);
              if (found) setLoggedInDoctor(found);
            }}
            className="bg-purple-950 border border-purple-400/30 text-amber-300 rounded-xl px-3 py-1.5 font-bold focus:ring-2 focus:ring-purple-400 cursor-pointer"
          >
            {doctors
              .filter((d) => d.hospitalId === currentDoc?.hospitalId)
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialty} - ID: {d.doctorId || d.id})
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-slate-200">
        <button
          onClick={() => setDocTab("appointments")}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap shrink-0 ${
            docTab === "appointments"
              ? "bg-[#7C5CFC] text-white shadow-md shadow-[#7C5CFC]/20"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Calendar className="w-4 h-4" /> Live Bookings ({docAppointments.length})
        </button>

        <button
          onClick={() => setDocTab("upload_history")}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap shrink-0 ${
            docTab === "upload_history"
              ? "bg-[#7C5CFC] text-white shadow-md shadow-[#7C5CFC]/20"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <FileUp className="w-4 h-4" /> Uploaded Reports History ({docReports.length})
        </button>

        <button
          onClick={() => setDocTab("my_reviews")}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap shrink-0 ${
            docTab === "my_reviews"
              ? "bg-[#7C5CFC] text-white shadow-md shadow-[#7C5CFC]/20"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Star className="w-4 h-4 text-amber-500 fill-amber-400" /> My Patient Reviews ({myReviews.length})
        </button>
      </div>

      {/* TAB 1: LIVE APPOINTMENT & DIAGNOSIS WORKBENCH */}
      {docTab === "appointments" && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold font-serif text-slate-900">
                Live Incoming Patient Bookings & Diagnosis
              </h2>
              <p className="text-xs text-slate-500">
                Review live appointment requests, confirm visit timing, diagnose symptoms, attach real files, and issue digital prescriptions.
              </p>
            </div>
            <span className="bg-purple-100 text-purple-800 font-bold text-xs px-3 py-1.5 rounded-full">
              {docAppointments.length} Active Bookings
            </span>
          </div>

          {docAppointments.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <div className="w-14 h-14 rounded-2xl bg-[#F4F0FF] text-[#7C5CFC] border border-[#E2D9FF] flex items-center justify-center mx-auto mb-3">
                <Stethoscope className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-base font-serif">No patient bookings assigned yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                When patients book appointments through the Patient Portal, requests will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {docAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    apt.status === "pending"
                      ? "bg-amber-50/50 border-amber-200 ring-1 ring-amber-300/30"
                      : apt.status === "completed"
                      ? "bg-slate-50 border-slate-200"
                      : "bg-purple-50/40 border-purple-200"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">{apt.patientName}</span>
                        <span className="text-xs text-slate-500">
                          ({apt.patientAge || 35} Yrs • {apt.patientGender || "Male"})
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                            apt.status === "accepted"
                              ? "bg-emerald-100 text-emerald-800"
                              : apt.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 flex items-center gap-3">
                        <span><strong>Date:</strong> {apt.date} at {apt.timeSlot}</span>
                        <span><strong>Mobile:</strong> {apt.patientMobile}</span>
                      </p>

                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 mt-2">
                        <strong className="text-purple-900">Patient Symptoms:</strong> {apt.symptoms}
                      </div>

                      {apt.confirmationNote && (
                        <p className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200 font-medium mt-1">
                          <strong>Response Note:</strong> {apt.confirmationNote}
                        </p>
                      )}
                    </div>

                    {/* Doctor Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {apt.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              updateAppointmentStatus(apt.id, "accepted", "Confirmed. Please arrive 10 mins prior.")
                            }
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Accept
                          </button>
                          <button
                            onClick={() =>
                              updateAppointmentStatus(apt.id, "rejected", "Doctor unavailable at this slot.")
                            }
                            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm cursor-pointer"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {(apt.status === "accepted" || apt.status === "pending") && (
                        <button
                          onClick={() => handleOpenDiagnosis(apt)}
                          className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                        >
                          <Stethoscope className="w-4 h-4" /> Diagnose & Upload Report
                        </button>
                      )}

                      {apt.status === "completed" && (
                        <span className="text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Prescribed & Filed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DOCTOR UPLOADED REPORTS HISTORY */}
      {docTab === "upload_history" && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold font-serif text-slate-900">
                Uploaded Medical Reports History
              </h2>
              <p className="text-xs text-slate-500">
                Manage, view, replace, or update medical files uploaded by Dr. {currentDoc?.name}.
              </p>
            </div>
            <span className="bg-purple-100 text-purple-800 font-bold text-xs px-3 py-1.5 rounded-full">
              {docReports.length} Reports
            </span>
          </div>

          {docReports.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <div className="w-14 h-14 rounded-2xl bg-[#F4F0FF] text-[#7C5CFC] border border-[#E2D9FF] flex items-center justify-center mx-auto mb-3">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-[#23125E] text-base font-serif">
                No medical reports uploaded yet
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Reports uploaded during patient diagnosis will automatically be cataloged here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {docReports.map((rep) => (
                <div key={rep.id} className="p-4 rounded-2xl border border-purple-100 bg-purple-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{rep.patientName}</span>
                      <span className="bg-purple-100 text-purple-800 font-bold text-[10px] px-2.5 py-0.5 rounded-md">
                        {rep.reportType || "Diagnostic Report"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Date: {rep.date} • Mobile: {rep.patientMobile} • File: <strong className="text-slate-800">{rep.fileName || rep.labReportName || "Report.pdf"}</strong> {rep.fileSize && `(${rep.fileSize})`}
                    </p>
                    <p className="text-xs text-slate-700 bg-white p-2 rounded-xl border border-slate-200">
                      <strong>Diagnosis:</strong> {rep.diagnosis}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setCasePaperReport(rep)}
                      className="px-3 py-1.5 bg-purple-900 hover:bg-purple-950 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" /> Case Paper
                    </button>

                    {rep.labReportUrl && (
                      <button
                        onClick={() => setViewingReport(rep)}
                        className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> File
                      </button>
                    )}

                    {/* Replace File Button */}
                    <label className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer">
                      <RefreshCw className="w-3.5 h-3.5" /> Replace File
                      <input
                        type="file"
                        accept=".pdf, .jpg, .jpeg, .png, image/png, image/jpeg, application/pdf"
                        className="hidden"
                        onChange={(e) => handleReplaceFileSelect(e, rep.id)}
                      />
                    </label>

                    <button
                      onClick={() => {
                        if (confirm(`Delete report for ${rep.patientName}?`)) {
                          deleteReport(rep.id);
                        }
                      }}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl cursor-pointer"
                      title="Delete report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY PATIENT REVIEWS & RATING METRICS */}
      {docTab === "my_reviews" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold font-serif text-slate-900">Patient Feedback & Consultation Ratings</h2>
              <p className="text-xs text-slate-500">
                Verified ratings and written feedback submitted by patients after completed consultations.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              <div>
                <span className="text-sm font-extrabold text-amber-900 font-serif block leading-none">
                  {myRatingStats.avgRating} / 5.0
                </span>
                <span className="text-[10px] text-amber-700 font-medium">
                  {myRatingStats.totalReviews} Patient Reviews
                </span>
              </div>
            </div>
          </div>

          {/* Immutable Transparency Notice */}
          <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-2xl text-xs text-purple-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <p>
              <strong>Notice:</strong> Patient ratings and reviews are moderated automatically. Doctors cannot edit or delete patient feedback to maintain authenticity and patient trust.
            </p>
          </div>

          {/* Reviews List */}
          {myReviews.length === 0 ? (
            <div className="p-10 text-center bg-slate-50 border border-slate-200 rounded-3xl text-slate-500 text-xs">
              <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No patient reviews received yet.</p>
              <p className="text-slate-500 mt-1">Feedback will appear here once patients complete their post-consultation ratings.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white border border-slate-200 hover:border-purple-200 rounded-2xl p-5 shadow-xs space-y-3 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-900 font-bold text-xs flex items-center justify-center">
                        {rev.isAnonymous ? "A" : rev.patientName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">
                          {rev.isAnonymous ? "Anonymous Patient" : rev.patientName}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Hospital: <strong>{rev.hospitalName}</strong>
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 font-medium">{rev.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-slate-600 font-medium">Doctor Rating:</span>
                    <span className="font-extrabold text-amber-600 flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" /> {rev.doctorRating} / 5 Stars
                    </span>
                  </div>

                  {rev.feedback && (
                    <p className="text-xs text-slate-700 bg-purple-50/50 p-3 rounded-xl border border-purple-100 italic">
                      "{rev.feedback}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DIAGNOSE PATIENT & REAL FILE UPLOAD MODAL */}
      {diagModalOpen && selectedApt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 border border-purple-100 shadow-2xl my-8 space-y-6 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs text-purple-700 font-bold uppercase tracking-wider">
                  Digital Medical Workbench
                </span>
                <h3 className="font-bold text-slate-900 text-lg font-serif">
                  Diagnose & Issue Report: {selectedApt.patientName}
                </h3>
              </div>
              <button
                onClick={() => setDiagModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDiagnosis} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
              {/* Patient Previous Medical History Summary */}
              {(() => {
                const prevReports = reports.filter(
                  (r) =>
                    r.patientMobile === selectedApt.patientMobile ||
                    r.patientName.toLowerCase() === selectedApt.patientName.toLowerCase()
                );
                if (prevReports.length === 0) return null;
                return (
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs space-y-2">
                    <span className="font-extrabold text-purple-900 uppercase text-[10px] tracking-wider block flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-purple-700" /> Authorized Patient Medical History ({prevReports.length} Previous Records)
                    </span>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {prevReports.map((pRep) => (
                        <div key={pRep.id} className="bg-white p-2 rounded-xl border border-slate-200 text-[11px] flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-900">{pRep.date}</span> • <span className="text-purple-700 font-semibold">{pRep.doctorName}</span> ({pRep.hospitalName})
                            <p className="text-slate-600 truncate max-w-md"><strong>Diagnosis:</strong> {pRep.diagnosis}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCasePaperReport(pRep)}
                            className="text-purple-700 font-bold hover:underline shrink-0 text-[10px] bg-purple-50 px-2 py-1 rounded-lg border border-purple-200"
                          >
                            View Case Paper
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Report Category */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Report Category / Type *
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                >
                  <option value="Blood Test Report">Blood Test Report</option>
                  <option value="X-Ray Scan">X-Ray Scan</option>
                  <option value="MRI Scan">MRI Scan</option>
                  <option value="CT Scan">CT Scan</option>
                  <option value="Ultrasound Scan">Ultrasound Scan</option>
                  <option value="Digital Prescription">Digital Prescription</option>
                  <option value="General Diagnostic Report">General Diagnostic Report</option>
                </select>
              </div>

              {/* Vitals Input */}
              <div className="grid grid-cols-2 gap-3 bg-purple-50 p-3.5 rounded-2xl border border-purple-100 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    value={bpVal}
                    onChange={(e) => setBpVal(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pulse Rate</label>
                  <input
                    type="text"
                    value={pulseVal}
                    onChange={(e) => setPulseVal(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs"
                  />
                </div>
              </div>

              {/* Diagnosis Field */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Clinical Diagnosis *</label>
                <textarea
                  rows={2}
                  required
                  value={diagnosisText}
                  onChange={(e) => setDiagnosisText(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-purple-500 font-sans"
                />
              </div>

              {/* Prescriptions Table Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5 text-purple-600" /> Prescribed Medicines & Dosage
                  </label>
                  <button
                    type="button"
                    onClick={addPrescriptionRow}
                    className="text-xs text-purple-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Add Medicine
                  </button>
                </div>

                <div className="space-y-2">
                  {prescriptions.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        placeholder="Medicine name (e.g. Paracetamol 650mg)"
                        value={p.medicineName}
                        onChange={(e) => updatePrescriptionRow(idx, "medicineName", e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Dosage"
                        value={p.dosage}
                        onChange={(e) => updatePrescriptionRow(idx, "dosage", e.target.value)}
                        className="w-20 bg-white border border-slate-200 rounded-lg p-1.5 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Timing"
                        value={p.timing}
                        onChange={(e) => updatePrescriptionRow(idx, "timing", e.target.value)}
                        className="w-28 bg-white border border-slate-200 rounded-lg p-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removePrescriptionRow(idx)}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* REAL FILE UPLOAD ZONE */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-extrabold text-[#23125E]">
                  Attach Patient Medical Report File (PDF / JPG / PNG • Max 20 MB)
                </label>

                {/* Drag & Drop Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) processSelectedFile(file);
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    isDragOver
                      ? "border-[#7C5CFC] bg-[#F4F0FF]"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100/80"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf, .jpg, .jpeg, .png, image/png, image/jpeg, application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) processSelectedFile(file);
                    }}
                  />

                  <div className="w-12 h-12 rounded-2xl bg-[#EADDFF] text-[#6750A4] flex items-center justify-center mx-auto mb-2">
                    <Upload className="w-6 h-6" />
                  </div>

                  <p className="text-xs font-bold text-slate-800">
                    Drag &amp; drop file from computer, or{" "}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[#7C5CFC] underline font-extrabold cursor-pointer hover:text-[#6542F0]"
                    >
                      Browse Files
                    </button>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Supports PDF, JPG, JPEG, and PNG files up to 20 MB.
                  </p>
                </div>

                {/* Upload Status & File Details */}
                {uploadStatus === "uploading" && (
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs space-y-2">
                    <div className="flex justify-between font-bold text-purple-900">
                      <span>Uploading document...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-purple-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#7C5CFC] transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {attachedFile && uploadStatus === "success" && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-slate-900 block truncate">{attachedFile.name}</span>
                        <span className="text-[10px] text-emerald-800 font-semibold">
                          Size: {attachedFile.size} • Format: {attachedFile.type || "Document"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachedFile(null);
                        setUploadStatus("idle");
                      }}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDiagModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Save & Issue Report to Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-BROWSER FILE VIEWER MODAL */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full h-[85vh] p-6 border border-slate-200 shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div>
                <span className="bg-purple-100 text-purple-800 font-bold text-[10px] px-2.5 py-0.5 rounded-md">
                  {viewingReport.reportType || "Medical Document"}
                </span>
                <h3 className="font-bold text-slate-900 text-lg font-serif mt-0.5">
                  {viewingReport.fileName || viewingReport.labReportName || "Medical_Report"}
                </h3>
                <p className="text-xs text-slate-500">
                  Patient: <strong>{viewingReport.patientName}</strong> • Dr. {viewingReport.doctorName} ({viewingReport.hospitalName})
                </p>
              </div>

              <div className="flex items-center gap-2">
                {viewingReport.labReportUrl && (
                  <a
                    href={viewingReport.labReportUrl}
                    download={viewingReport.fileName || viewingReport.labReportName || "Medical_Report"}
                    className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                )}
                <button
                  onClick={() => setViewingReport(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Render Canvas / Iframe */}
            <div className="flex-1 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center relative">
              {viewingReport.labReportUrl ? (
                viewingReport.labReportUrl.startsWith("data:image/") ||
                viewingReport.fileName?.match(/\.(jpg|jpeg|png)$/i) ? (
                  <img
                    src={viewingReport.labReportUrl}
                    alt={viewingReport.fileName || "Medical Report"}
                    className="max-h-full max-w-full object-contain p-2"
                  />
                ) : (
                  <iframe
                    src={viewingReport.labReportUrl}
                    title="Medical Report Document"
                    className="w-full h-full border-none"
                  />
                )
              ) : (
                <div className="text-center p-8 text-slate-500">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold">No file stream attached</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* DIGITAL CASE PAPER MODAL */}
      {casePaperReport && (
        <DigitalCasePaperModal
          report={casePaperReport}
          onClose={() => setCasePaperReport(null)}
        />
      )}
    </div>
  );
};
