import React from "react";
import { DiagnosticReport, HospitalProfile, Doctor, Appointment } from "../../types";
import { useApp } from "../../context/AppContext";
import {
  Printer,
  X,
  Building2,
  Stethoscope,
  User,
  Calendar,
  Phone,
  ShieldCheck,
  FileText,
  Pill,
  Download,
  Activity,
  CheckCircle2,
} from "lucide-react";

interface DigitalCasePaperModalProps {
  report: DiagnosticReport;
  onClose: () => void;
}

export const DigitalCasePaperModal: React.FC<DigitalCasePaperModalProps> = ({
  report,
  onClose,
}) => {
  const { hospitals, doctors, appointments } = useApp();

  // Find linked hospital, doctor, and appointment for rich metadata
  const linkedHosp = hospitals.find(
    (h) =>
      (report.hospitalId && (h.id === report.hospitalId || h.hospitalId === report.hospitalId)) ||
      h.name.toLowerCase() === report.hospitalName.toLowerCase()
  );

  const linkedDoc = doctors.find(
    (d) =>
      d.id === report.doctorId ||
      d.doctorId === report.doctorId ||
      d.name.toLowerCase() === report.doctorName.toLowerCase()
  );

  const linkedApt = appointments.find((a) => a.id === report.appointmentId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-purple-100 shadow-2xl my-6 overflow-hidden flex flex-col max-h-[92vh] animate-scaleIn">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-extrabold text-xs uppercase tracking-wider text-purple-200">
              Verified Digital Case Paper & Medical Record
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print Case Paper
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Case Paper Body */}
        <div className="p-6 md:p-10 overflow-y-auto space-y-6 print:p-0 print:overflow-visible bg-white font-sans">
          
          {/* 1. HOSPITAL HEADER */}
          <div className="border-b-2 border-purple-900 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {linkedHosp?.logoUrl ? (
                <img
                  src={linkedHosp.logoUrl}
                  alt={report.hospitalName}
                  className="w-16 h-16 rounded-2xl object-cover border border-purple-200 shrink-0 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold text-2xl border border-purple-200 shrink-0">
                  <Building2 className="w-8 h-8 text-purple-800" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-black font-serif text-slate-900 tracking-tight">
                    {linkedHosp?.name || report.hospitalName}
                  </h1>
                  <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Hospital
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {linkedHosp?.address || "Akole Road, Sangamner, Ahilya Nagar"}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-3">
                  <span>Reg No: <strong>{linkedHosp?.registrationNumber || "MH-AHD-2022-04812"}</strong></span>
                  <span>Contact: <strong>{linkedHosp?.contactNumber || "9822022222"}</strong></span>
                  <span>Emergency: <strong className="text-red-700">{linkedHosp?.emergencyContact || "108"}</strong></span>
                </p>
              </div>
            </div>

            <div className="text-right sm:text-right shrink-0 bg-purple-50/80 p-3 rounded-2xl border border-purple-100 font-mono text-xs">
              <span className="block text-[10px] text-purple-700 uppercase font-bold">Case Paper ID</span>
              <strong className="text-slate-900 text-sm block font-bold">{report.id}</strong>
              <span className="block text-[10px] text-slate-500 mt-1">Date: {report.date}</span>
            </div>
          </div>

          {/* 2. DOCTOR & PATIENT DETAILS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Consulting Doctor Box */}
            <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100 space-y-2">
              <span className="text-[10px] uppercase font-bold text-purple-800 tracking-wider flex items-center gap-1">
                <Stethoscope className="w-3.5 h-3.5" /> Consulting Specialist
              </span>
              <div className="flex items-center gap-3">
                {linkedDoc?.profileImageUrl ? (
                  <img
                    src={linkedDoc.profileImageUrl}
                    alt={report.doctorName}
                    className="w-12 h-12 rounded-xl object-cover border border-purple-200 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-purple-200 text-purple-900 font-bold flex items-center justify-center shrink-0">
                    {report.doctorName.charAt(4) || "D"}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{report.doctorName}</h3>
                  <p className="text-xs text-purple-900 font-semibold">
                    {linkedDoc?.specialty || "Specialist"} ({linkedDoc?.qualification || "MBBS, MD"})
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Doctor ID: {linkedDoc?.doctorId || report.doctorId}
                  </p>
                </div>
              </div>
            </div>

            {/* Patient Information Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-600" /> Patient Details
              </span>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">{report.patientName}</h3>
                  <span className="text-xs font-semibold text-slate-600">
                    {report.patientAge || linkedApt?.patientAge || 35} Yrs • {report.patientGender || linkedApt?.patientGender || "Male"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Contact Mobile: <strong>{report.patientMobile}</strong>
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Appointment Reference: {report.appointmentId}
                </p>
              </div>
            </div>

          </div>

          {/* 3. CLINICAL SYMPTOMS & DIAGNOSIS SUMMARY */}
          <div className="space-y-4">
            
            {/* Symptoms */}
            {report.symptoms || linkedApt?.symptoms ? (
              <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-2xl text-xs space-y-1">
                <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider block">
                  Chief Symptoms / Patient Complaint
                </span>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {report.symptoms || linkedApt?.symptoms}
                </p>
              </div>
            ) : null}

            {/* Diagnosis */}
            <div className="bg-white border-2 border-purple-100 p-4 rounded-2xl text-xs space-y-1 shadow-2xs">
              <span className="font-extrabold text-purple-900 uppercase text-[10px] tracking-wider block">
                Doctor's Clinical Observations & Diagnosis
              </span>
              <p className="text-slate-900 font-bold text-sm leading-relaxed">
                {report.diagnosis}
              </p>
            </div>

            {/* Vitals Recorded */}
            {report.vitals && (
              <div className="bg-slate-900 text-white p-4 rounded-2xl text-xs space-y-2">
                <span className="font-bold uppercase text-[10px] tracking-wider text-purple-300 block flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-purple-400" /> Vitals Recorded During Consultation
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Blood Pressure</span>
                    <strong className="text-amber-300 text-sm">{report.vitals.bp || "120/80 mmHg"}</strong>
                  </div>
                  <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Pulse Rate</span>
                    <strong className="text-emerald-300 text-sm">{report.vitals.pulse || "72 bpm"}</strong>
                  </div>
                  <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Temperature</span>
                    <strong className="text-purple-300 text-sm">{report.vitals.temp || "98.6 °F"}</strong>
                  </div>
                  <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Body Weight</span>
                    <strong className="text-cyan-300 text-sm">{report.vitals.weight || "68 kg"}</strong>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* 4. DIGITAL PRESCRIPTION TABLE */}
          {report.prescriptions && report.prescriptions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-purple-700" /> Prescribed Medicines & Dosage Instructions
              </h3>
              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-purple-950 text-white font-bold text-[11px]">
                    <tr>
                      <th className="p-3 border-b border-purple-800">#</th>
                      <th className="p-3 border-b border-purple-800">Medicine Name</th>
                      <th className="p-3 border-b border-purple-800">Dosage</th>
                      <th className="p-3 border-b border-purple-800">Frequency / Timing</th>
                      <th className="p-3 border-b border-purple-800">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800 bg-white">
                    {report.prescriptions.map((p, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-purple-50/20"}>
                        <td className="p-3 font-mono font-bold text-purple-900">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900">{p.medicineName}</td>
                        <td className="p-3 font-semibold text-slate-700">{p.dosage}</td>
                        <td className="p-3 font-bold text-purple-800">{p.timing}</td>
                        <td className="p-3 text-slate-600">{p.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. ATTACHED DIAGNOSTIC REPORT FILE */}
          {(report.fileName || report.labReportName || report.labReportUrl) && (
            <div className="bg-purple-50/80 p-4 rounded-2xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-purple-800 font-bold uppercase tracking-wider block">
                    Attached Diagnostic File / Scan
                  </span>
                  <strong className="font-bold text-slate-900 text-sm block">
                    {report.fileName || report.labReportName || "Medical_Report.pdf"}
                  </strong>
                  <span className="text-[10px] text-slate-500">
                    Category: {report.reportType || "Diagnostic File"} {report.fileSize && `• ${report.fileSize}`}
                  </span>
                </div>
              </div>

              {report.labReportUrl && (
                <a
                  href={report.labReportUrl}
                  download={report.fileName || report.labReportName || "Medical_Report"}
                  className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-center shrink-0 print:hidden"
                >
                  <Download className="w-3.5 h-3.5" /> Download File
                </a>
              )}
            </div>
          )}

          {/* 6. SIGNATURE & STAMP FOOTER */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
            <div>
              <p className="font-serif italic font-bold text-slate-800 text-sm">
                Digitally Authenticated Document
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Issued via Jeevan Setu Healthcare Management System • {report.uploadedAt || report.date}
              </p>
            </div>

            <div className="text-center sm:text-right">
              <div className="w-36 h-12 border-b-2 border-slate-900 mx-auto sm:ml-auto mb-1 flex items-end justify-center sm:justify-end pb-1 font-serif text-purple-900 font-bold italic">
                Dr. {report.doctorName.replace("Dr. ", "")}
              </div>
              <span className="font-bold text-slate-900 block">{report.doctorName}</span>
              <span className="text-[10px] text-slate-500 block">{linkedHosp?.name || report.hospitalName}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
