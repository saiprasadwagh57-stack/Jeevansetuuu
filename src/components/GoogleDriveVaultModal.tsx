import React, { useState, useEffect } from "react";
import {
  signInWithGoogleDrive,
  signOutGoogle,
  getCachedAccessToken,
  listDriveHealthReports,
  initializeDriveMedicalFolders,
  uploadMedicalReportToDrive,
  DriveFile,
} from "../services/googleDrive";
import { useApp } from "../context/AppContext";
import {
  X,
  HardDrive,
  UploadCloud,
  ExternalLink,
  CheckCircle2,
  Trash2,
  RefreshCw,
  FolderHeart,
  ShieldCheck,
  FileText,
  LogOut,
  Sparkles,
  FolderTree,
} from "lucide-react";

interface GoogleDriveVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDriveVaultModal: React.FC<GoogleDriveVaultModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { reports, updateReport, loggedInPatient, t, language } = useApp();
  const [accessToken, setAccessToken] = useState<string | null>(getCachedAccessToken());
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [deleteConfirmFile, setDeleteConfirmFile] = useState<DriveFile | null>(null);

  useEffect(() => {
    if (accessToken) {
      fetchDriveFiles(accessToken);
    }
  }, [accessToken]);

  const fetchDriveFiles = async (token: string) => {
    setLoading(true);
    try {
      await initializeDriveMedicalFolders(token);
      const files = await listDriveHealthReports(token);
      setDriveFiles(files);
    } catch (err) {
      console.error("Folder init error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setUploadStatus(null);
    try {
      const res = await signInWithGoogleDrive();
      if (res) {
        setAccessToken(res.accessToken);
        setUserEmail(res.user.email);
        await initializeDriveMedicalFolders(res.accessToken);
        await fetchDriveFiles(res.accessToken);
      }
    } catch (err: any) {
      if (
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/cancelled-popup-request" ||
        err?.message?.includes("popup-closed-by-user")
      ) {
        setUploadStatus(
          language === "hi"
            ? "साइन-इन विंडो बंद कर दी गई थी। पुनः प्रयास करने के लिए बटन पर क्लिक करें।"
            : language === "mr"
            ? "साइन-इन विंडो बंद केली होती. पुन्हा प्रयत्न करण्यासाठी बटणावर क्लिक करा."
            : "Sign-in popup was closed. Click the button when ready to connect."
        );
      } else {
        alert("Google Drive authentication failed: " + (err.message || err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOutGoogle();
    setAccessToken(null);
    setUserEmail(null);
    setDriveFiles([]);
  };

  const handleBackupAllReports = async () => {
    if (!accessToken) return;
    if (reports.length === 0) {
      alert(
        language === "hi"
          ? "गूगल ड्राइव में बैकअप लेने के लिए कोई रिपोर्ट नहीं है।"
          : language === "mr"
          ? "गूगल ड्राईव्हवर बॅकअप घेण्यासाठी कोणतेही अहवाल नाहीत."
          : "No medical reports available to backup to Google Drive."
      );
      return;
    }

    setLoading(true);
    setUploadStatus(
      language === "hi"
        ? "गूगल ड्राइव में ऑटो-बैकअप जारी है..."
        : language === "mr"
        ? "गूगल ड्राईव्हवर ऑटो-बॅकअप सुरू आहे..."
        : "Syncing records to Jeevan Setu Medical Records folder..."
    );

    try {
      for (const rep of reports) {
        const driveFile = await uploadMedicalReportToDrive(accessToken, rep);
        updateReport(rep.id, {
          driveBackupStatus: "backed_up",
          driveFileUrl: driveFile.webViewLink,
          driveFileId: driveFile.id,
        });
      }

      setUploadStatus(
        language === "hi"
          ? "सभी रिपोर्ट सुरक्षित रूप से गूगल ड्राइव (Jeevan Setu Medical Records) में बैकअप हो गए हैं!"
          : language === "mr"
          ? "सर्व अहवाल यशस्वीरित्या गूगल ड्राईव्हवर बॅकअप झाले आहेत!"
          : "All medical records backed up to Jeevan Setu Medical Records folder!"
      );

      await fetchDriveFiles(accessToken);
    } catch (err: any) {
      setUploadStatus("Backup failed: " + err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setUploadStatus(null), 5000);
    }
  };

  const executeDeleteFile = async () => {
    if (!deleteConfirmFile || !accessToken) return;

    setLoading(true);
    try {
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${deleteConfirmFile.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (res.ok) {
        setDriveFiles((prev) => prev.filter((f) => f.id !== deleteConfirmFile.id));
      } else {
        alert("Failed to delete file from Google Drive.");
      }
    } catch (err: any) {
      alert("Error deleting file: " + err.message);
    } finally {
      setDeleteConfirmFile(null);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white border border-[#E2D9FF] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#21005D] via-[#381E72] to-[#6750A4] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
              <HardDrive className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold font-serif text-white flex items-center gap-2">
                <span>Google Drive Health Vault</span>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300/30">
                  Cloud Sync
                </span>
              </h2>
              <p className="text-xs text-[#EADDFF]">
                {language === "hi"
                  ? "अपने गूगल ड्राइव में मेडिकल रिकॉर्ड सुरक्षित रूप से स्टोर करें"
                  : language === "mr"
                  ? "तुमचे वैद्यकीय अहवाल गूगल ड्राईव्हवर सुरक्षित साठवा"
                  : "Backup and access verified medical records in your Google Drive"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer border border-white/20"
            title="Close Vault"
          >
            <span>
              {language === "hi" ? "बंद करें" : language === "mr" ? "बंद करा" : "Close"}
            </span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {!accessToken ? (
            /* Unauthenticated View */
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-[#F4F0FF] border border-[#E2D9FF] text-[#6750A4] flex items-center justify-center mx-auto shadow-inner">
                <FolderHeart className="w-8 h-8" />
              </div>

              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-3">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>🔴 Google Drive Not Connected</span>
                </div>

                <h3 className="text-xl font-extrabold text-[#23125E] font-serif">
                  {language === "hi"
                    ? "गूगल ड्राइव स्वास्थ्य वॉल्ट कनेक्ट करें"
                    : language === "mr"
                    ? "गूगल ड्राईव्ह हेल्थ वॉल्ट कनेक्ट करा"
                    : "Connect Google Drive Health Vault"}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                  {language === "hi"
                    ? "अपने गूगल खाते से जुड़कर अपनी सभी मेडिकल रिपोर्ट, पर्चे और लैब परिणाम गूगल ड्राइव में 'Jeevan Setu Medical Records' फोल्डर में बैकअप लें।"
                    : language === "mr"
                    ? "तुमच्या गूगल खात्याशी कनेक्ट करून तुमचे सर्व अहवाल आणि प्रिस्क्रिप्शन गूगल ड्राईव्हवरील 'Jeevan Setu Medical Records' फोल्डरमध्ये सेव्ह करा."
                    : "Sign in with your Google Account to automatically store and backup all diagnostic files and digital prescriptions into a dedicated 'Jeevan Setu Medical Records' folder in Google Drive."}
                </p>
              </div>

              {/* Official Material Google Sign-In Button */}
              <div className="pt-2 flex flex-col items-center gap-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="group relative flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-300 rounded-2xl px-6 py-3.5 shadow-md hover:shadow-lg transition-all cursor-pointer text-sm"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    ></path>
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    ></path>
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    ></path>
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    ></path>
                  </svg>
                  <span>
                    {loading
                      ? "Connecting..."
                      : language === "hi"
                      ? "गूगल ड्राइव के साथ साइन इन करें"
                      : language === "mr"
                      ? "गूगल ड्राईव्ह सह साइन इन करा"
                      : "Sign in with Google Drive"}
                  </span>
                </button>

                {uploadStatus && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl text-center max-w-sm">
                    {uploadStatus}
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Authenticated View */
            <div className="space-y-6">
              {/* Account Bar */}
              <div className="bg-[#FEF7FF] border border-[#E2D9FF] p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#6750A4] text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6750A4] tracking-wider block">
                      Connected Google Account
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#23125E]">
                        {userEmail || "Google Drive Active"}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        🟢 Google Drive Connected
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchDriveFiles(accessToken)}
                    className="p-2 rounded-xl text-[#6750A4] hover:bg-[#F4F0FF] border border-[#E2D9FF] transition-all cursor-pointer"
                    title="Refresh Files"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>

              {/* Backup Action Bar */}
              <div className="bg-gradient-to-r from-[#F4F0FF] to-[#FEF7FF] border border-[#E2D9FF] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-[#23125E]">
                      {language === "hi"
                        ? "गूगल ड्राइव में बैकअप लें"
                        : language === "mr"
                        ? "गूगल ड्राईव्हवर बॅकअप घ्या"
                        : "Sync Reports to Google Drive"}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {reports.length} report(s) ready to upload to Jeevan Setu folder
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleBackupAllReports}
                  disabled={loading || reports.length === 0}
                  className="w-full sm:w-auto bg-[#6750A4] hover:bg-[#523e85] disabled:opacity-50 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>
                    {language === "hi"
                      ? "अभी बैकअप लें"
                      : language === "mr"
                      ? "आत्ताच बॅकअप घ्या"
                      : "Backup All Records"}
                  </span>
                </button>
              </div>

              {/* Status Alert */}
              {uploadStatus && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{uploadStatus}</span>
                </div>
              )}

              {/* Drive File List */}
              <div>
                <h4 className="text-xs font-extrabold text-[#23125E] font-serif uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FolderHeart className="w-4 h-4 text-[#6750A4]" />
                  <span>Files in "Jeevan Setu Health Vault"</span>
                  <span className="bg-[#F4F0FF] text-[#6750A4] text-[10px] px-2 py-0.5 rounded-full font-sans">
                    {driveFiles.length}
                  </span>
                </h4>

                {driveFiles.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-medium">No Google Drive backups found yet.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Click 'Backup All Records' to create your first cloud copy.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {driveFiles.map((f) => (
                      <div
                        key={f.id}
                        className="bg-white border border-slate-200 hover:border-[#6750A4] p-3 rounded-xl flex items-center justify-between gap-3 text-xs transition-all shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#F4F0FF] text-[#6750A4] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-[#23125E] truncate">{f.name}</p>
                            <p className="text-[10px] text-slate-400">
                              {f.createdTime
                                ? new Date(f.createdTime).toLocaleDateString()
                                : "Google Drive"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {f.webViewLink && (
                            <a
                              href={f.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-[#6750A4] hover:bg-[#F4F0FF] rounded-lg transition-colors flex items-center gap-1 font-bold text-[11px]"
                              title="Open in Google Drive"
                            >
                              <span>View</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => setDeleteConfirmFile(f)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete File from Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="px-6 py-3.5 bg-[#FEF7FF] border-t border-[#E2D9FF] flex items-center justify-between">
          <p className="text-[11px] text-slate-400 font-medium">
            Jeevan Setu • Cloud Sync
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <X className="w-4 h-4" />
            <span>
              {language === "hi" ? "बंद करें" : language === "mr" ? "बंद करा" : "Close Vault"}
            </span>
          </button>
        </div>
      </div>

      {/* Mandatory Explicit Confirmation Dialog for File Deletion */}
      {deleteConfirmFile && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-rose-100 shadow-2xl space-y-4 text-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-extrabold text-base text-[#23125E]">
                Delete File from Google Drive?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <span className="font-bold text-slate-800">"{deleteConfirmFile.name}"</span> from
                your Google Drive Health Vault? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmFile(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeDeleteFile}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
