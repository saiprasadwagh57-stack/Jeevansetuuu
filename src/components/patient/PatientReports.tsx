import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { DiagnosticReport } from "../../types";
import { GoogleDriveVaultModal } from "../GoogleDriveVaultModal";
import { DigitalCasePaperModal } from "../common/DigitalCasePaperModal";
import { getCachedAccessToken, uploadMedicalReportToDrive } from "../../services/googleDrive";
import {
  FileText,
  Stethoscope,
  Building2,
  Calendar,
  Pill,
  Download,
  Activity,
  CheckCircle2,
  Eye,
  X,
  ShieldCheck,
  FileCheck,
  HardDrive,
  ExternalLink,
  Cloud,
  CloudCheck,
  RefreshCw,
  AlertTriangle,
  Clock,
} from "lucide-react";

export const PatientReports: React.FC = () => {
  const { reports, updateReport, loggedInPatient, patientIdentifier, t } = useApp();
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [syncingReportId, setSyncingReportId] = useState<string | null>(null);
  const [casePaperReport, setCasePaperReport] = useState<DiagnosticReport | null>(null);

  const driveToken = getCachedAccessToken();

  // Filter reports specifically for the currently logged-in patient
  const patientReports = reports.filter((rep) => {
    if (loggedInPatient) {
      return (
        rep.patientMobile === loggedInPatient.mobile ||
        rep.patientName.toLowerCase() === loggedInPatient.fullName.toLowerCase()
      );
    }
    if (patientIdentifier) {
      return rep.patientName.toLowerCase().includes(patientIdentifier.toLowerCase());
    }
    return true;
  });

  // Manual single report sync to Drive
  const handleSyncSingleReport = async (rep: DiagnosticReport) => {
    if (!driveToken) {
      setIsDriveModalOpen(true);
      return;
    }

    setSyncingReportId(rep.id);
    try {
      const driveFile = await uploadMedicalReportToDrive(driveToken, rep);
      updateReport(rep.id, {
        driveBackupStatus: "backed_up",
        driveFileUrl: driveFile.webViewLink,
        driveFileId: driveFile.id,
      });
    } catch (err: any) {
      alert("Google Drive Backup Error: " + err.message);
      updateReport(rep.id, { driveBackupStatus: "failed" });
    } finally {
      setSyncingReportId(null);
    }
  };

  // Active Viewing Modal State
  const [viewingReport, setViewingReport] = useState<DiagnosticReport | null>(null);

  // Download File Handler
  const handleDownloadReport = (rep: DiagnosticReport) => {
    if (!rep.labReportUrl) {
      alert("No downloadable file attached to this report.");
      return;
    }

    const downloadLink = document.createElement("a");
    downloadLink.href = rep.labReportUrl;
    downloadLink.download = rep.fileName || rep.labReportName || `${rep.reportType || "Medical_Report"}.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-extrabold text-[#23125E] text-lg font-serif">
            {t("digitalReportsTitle", "Digital Diagnostic Reports & Prescriptions")}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("digitalReportsDesc", "Verified medical records and laboratory diagnostic files issued directly by attending doctors.")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDriveModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#FEF7FF] hover:bg-[#F4F0FF] text-[#6750A4] font-extrabold text-xs px-3.5 py-1.5 rounded-xl border border-[#D0BCFF] hover:border-[#6750A4] transition-all cursor-pointer shadow-2xs"
          >
            <HardDrive className="w-3.5 h-3.5 text-[#6750A4]" />
            <span>Google Drive Sync</span>
          </button>
          <span className="bg-[#F4F0FF] text-[#7C5CFC] font-extrabold text-xs px-3.5 py-1.5 rounded-xl border border-[#E2D9FF]">
            {patientReports.length} {patientReports.length === 1 ? "Record" : "Records"}
          </span>
        </div>
      </div>

      {patientReports.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[#F4F0FF] text-[#7C5CFC] border border-[#E2D9FF] flex items-center justify-center mx-auto shadow-sm">
            <FileText className="w-8 h-8" />
          </div>
          <h4 className="font-extrabold text-[#23125E] text-lg font-serif">
            {t("noReportsUploadedYet", "No medical reports have been uploaded yet.")}
          </h4>
          <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
            {t("noReportsDesc", "Laboratory diagnostic files, scan reports, and digital prescriptions issued by doctors following your consultation will be securely stored here.")}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {patientReports.map((rep) => (
            <div
              key={rep.id}
              className="border border-[#E2D9FF] rounded-3xl p-5 bg-gradient-to-br from-[#FDFBFF] to-white shadow-sm space-y-4"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0EAFF] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#23125E]">{rep.doctorName}</span>
                    <span className="text-xs text-[#7C5CFC] font-bold">• {rep.hospitalName}</span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-[#7C5CFC]" /> Upload Date: <strong>{rep.date}</strong> • Patient: <strong>{rep.patientName}</strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-[#EADDFF] text-[#21005D] font-extrabold text-xs px-3 py-1 rounded-xl">
                    {rep.reportType || "Diagnostic Report"}
                  </span>

                  {/* Google Drive Backup Status Badge */}
                  {rep.driveBackupStatus === "backed_up" || rep.driveFileUrl ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs px-2.5 py-1 rounded-xl border border-emerald-200">
                      <span>☁️</span>
                      <span>Backed Up to Google Drive</span>
                    </span>
                  ) : rep.driveBackupStatus === "pending" ? (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 font-extrabold text-xs px-2.5 py-1 rounded-xl border border-amber-200">
                      <span>⏳</span>
                      <span>Pending Backup</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-extrabold text-xs px-2.5 py-1 rounded-xl border border-slate-200">
                      <span>⚠️</span>
                      <span>Google Drive Not Connected</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Diagnosis & Vitals */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 bg-white border border-slate-200 p-3.5 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Clinical Diagnosis</span>
                  <p className="text-xs font-bold text-slate-800 mt-1 leading-relaxed">{rep.diagnosis}</p>
                </div>

                {rep.vitals && (
                  <div className="bg-[#23125E] text-white p-3.5 rounded-2xl text-xs space-y-1.5 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-purple-300 block tracking-wider">Vitals Recorded</span>
                    <p className="flex justify-between"><span>Blood Pressure:</span> <strong>{rep.vitals.bp || "N/A"}</strong></p>
                    <p className="flex justify-between"><span>Pulse Rate:</span> <strong>{rep.vitals.pulse || "N/A"}</strong></p>
                  </div>
                )}
              </div>

              {/* Digital Prescription Table */}
              {rep.prescriptions && rep.prescriptions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#23125E] mb-2 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-[#7C5CFC]" /> Digital Prescription
                  </h4>
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden text-xs shadow-2xs">
                    <table className="w-full text-left">
                      <thead className="bg-[#F4F0FF] text-[#23125E] font-extrabold text-[11px]">
                        <tr>
                          <th className="p-2.5">Medicine Name</th>
                          <th className="p-2.5">Dosage</th>
                          <th className="p-2.5">Timing</th>
                          <th className="p-2.5">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {rep.prescriptions.map((p, idx) => (
                          <tr key={idx}>
                            <td className="p-2.5 font-bold text-slate-900">{p.medicineName}</td>
                            <td className="p-2.5">{p.dosage}</td>
                            <td className="p-2.5 text-[#7C5CFC] font-semibold">{p.timing}</td>
                            <td className="p-2.5">{p.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Uploaded File Link & Actions */}
              {(rep.labReportUrl || rep.fileName || rep.labReportName) && (
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between bg-[#F8F6FF] p-3.5 rounded-2xl border border-[#E2D9FF] gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileCheck className="w-5 h-5 text-[#7C5CFC] shrink-0" />
                    <div className="truncate">
                      <span className="text-xs font-extrabold text-[#23125E] block truncate">
                        {rep.fileName || rep.labReportName || "Medical Report Document"}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Format: {rep.reportType || "Lab File"} {rep.fileSize && `• Size: ${rep.fileSize}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Google Drive Action Button */}
                    {rep.driveFileUrl ? (
                      <a
                        href={rep.driveFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Open in Google Drive</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => handleSyncSingleReport(rep)}
                        disabled={syncingReportId === rep.id}
                        className="bg-purple-50 hover:bg-purple-100 text-[#6750A4] border border-[#D0BCFF] font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        <HardDrive className={`w-3.5 h-3.5 ${syncingReportId === rep.id ? "animate-spin" : ""}`} />
                        <span>{syncingReportId === rep.id ? "Syncing..." : "Sync to Drive"}</span>
                      </button>
                    )}

                    <button
                      onClick={() => setCasePaperReport(rep)}
                      className="bg-purple-900 hover:bg-purple-950 text-amber-300 font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" /> Digital Case Paper
                    </button>

                    {rep.labReportUrl && (
                      <button
                        onClick={() => setViewingReport(rep)}
                        className="bg-white hover:bg-purple-50 text-[#7C5CFC] border border-[#E2D9FF] font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Report File
                      </button>
                    )}

                    <button
                      onClick={() => handleDownloadReport(rep)}
                      className="bg-[#7C5CFC] hover:bg-[#6848F0] text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* VIEW REPORT MODAL */}
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
                  Issued by Dr. {viewingReport.doctorName} ({viewingReport.hospitalName})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadReport(viewingReport)}
                  className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download Original File
                </button>
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
      {/* Digital Case Paper Modal */}
      {casePaperReport && (
        <DigitalCasePaperModal
          report={casePaperReport}
          onClose={() => setCasePaperReport(null)}
        />
      )}

      {/* Google Drive Vault Modal */}
      <GoogleDriveVaultModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
      />
    </div>
  );
};
