import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "../firebase";

const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/drive.file");
provider.addScope("https://www.googleapis.com/auth/drive.readonly");

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuthListener = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token lost on refresh without popup, prompt login when needed
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleDrive = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to retrieve Google Drive access token.");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    if (
      error?.code === "auth/popup-closed-by-user" ||
      error?.code === "auth/cancelled-popup-request" ||
      error?.message?.includes("popup-closed-by-user")
    ) {
      console.warn("Google Drive Sign-in popup was closed or cancelled by the user.");
    } else {
      console.error("Google Drive Sign-in Error:", error);
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const signOutGoogle = async () => {
  await firebaseSignOut(auth);
  cachedAccessToken = null;
};

// Google Drive API Interfaces
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  createdTime?: string;
  iconLink?: string;
}

// Ensure "Jeevan Setu Medical Records" root folder exists in user's Drive
export const getOrCreateHealthVaultFolder = async (accessToken: string): Promise<string> => {
  const query = encodeURIComponent("(name = 'Jeevan Setu Medical Records' or name = 'Jeevan Setu Health Vault') and mimeType = 'application/vnd.google-apps.folder' and trashed = false");
  const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  // Create folder if not found
  const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Jeevan Setu Medical Records",
      mimeType: "application/vnd.google-apps.folder",
    }),
  });

  const folder = await createRes.json();
  return folder.id;
};

// Create or retrieve a subfolder inside Jeevan Setu Medical Records
export const getOrCreateSubfolder = async (
  accessToken: string,
  parentFolderId: string,
  subfolderName: string
): Promise<string> => {
  const query = encodeURIComponent(`'${parentFolderId}' in parents and name = '${subfolderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: subfolderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentFolderId],
    }),
  });

  const folder = await createRes.json();
  return folder.id;
};

// Initialize full folder hierarchy (Root + Standard Subfolders) upon connection
export const initializeDriveMedicalFolders = async (accessToken: string): Promise<string> => {
  const rootId = await getOrCreateHealthVaultFolder(accessToken);
  const subfolders = [
    "Reports",
    "Prescriptions",
    "Lab Reports",
    "X-Rays",
    "MRI",
    "CT Scan",
    "Blood Tests",
  ];

  for (const name of subfolders) {
    await getOrCreateSubfolder(accessToken, rootId, name);
  }

  return rootId;
};

// Helper to determine target subfolder based on report details
export const determineSubfolderName = (reportType?: string, labReportName?: string): string => {
  const typeStr = ((reportType || "") + " " + (labReportName || "")).toLowerCase();
  if (typeStr.includes("prescription")) return "Prescriptions";
  if (typeStr.includes("blood")) return "Blood Tests";
  if (typeStr.includes("x-ray") || typeStr.includes("xray")) return "X-Rays";
  if (typeStr.includes("mri")) return "MRI";
  if (typeStr.includes("ct")) return "CT Scan";
  if (typeStr.includes("lab") || typeStr.includes("test")) return "Lab Reports";
  return "Reports";
};

// Upload a single DiagnosticReport to Google Drive in structured subfolder
export const uploadMedicalReportToDrive = async (
  accessToken: string,
  rep: {
    id: string;
    patientName: string;
    patientMobile: string;
    doctorName: string;
    hospitalName: string;
    diagnosis: string;
    date: string;
    prescriptions?: any[];
    labReportName?: string;
    labReportUrl?: string;
    reportType?: string;
    vitals?: any;
  }
): Promise<DriveFile> => {
  const rootId = await getOrCreateHealthVaultFolder(accessToken);
  const cleanHospName = (rep.hospitalName || "Hospital Medical Records").trim();
  const cleanDocName = (rep.doctorName || "Consulting Doctor").trim();

  // Jeevan Setu Medical Records -> Hospital Name -> Doctor Name
  const hospitalFolderId = await getOrCreateSubfolder(accessToken, rootId, cleanHospName);
  const targetFolderId = await getOrCreateSubfolder(accessToken, hospitalFolderId, cleanDocName);

  // Format clean standardized filename: PatientName_ReportType_YYYY-MM-DD.pdf or .txt
  const cleanPatientName = (rep.patientName || "Patient").replace(/[^a-zA-Z0-9]/g, "");
  const cleanType = (rep.labReportName || rep.reportType || "MedicalReport").replace(/[^a-zA-Z0-9]/g, "");
  const cleanDate = rep.date ? rep.date.split(" ")[0] : new Date().toISOString().split("T")[0];

  const hasDataUrl = rep.labReportUrl && rep.labReportUrl.startsWith("data:");
  let fileBlob: Blob;
  let mimeType = "text/plain";
  let extension = "txt";

  if (hasDataUrl) {
    const parts = rep.labReportUrl!.split(",");
    const matches = parts[0].match(/:(.*?);/);
    mimeType = matches ? matches[1] : "application/pdf";
    extension = mimeType.includes("pdf") ? "pdf" : mimeType.includes("png") ? "png" : "jpg";
    
    // Convert base64 data URL to Blob
    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    fileBlob = new Blob([ab], { type: mimeType });
  } else {
    // Generate text summary document
    const presText = (rep.prescriptions || [])
      .map(
        (p, idx) =>
          `${idx + 1}. ${p.medicineName} (${p.dosage || ""}) - ${p.timing || ""} for ${p.duration || ""}`
      )
      .join("\n");

    const textContent = `================================================
JEEVAN SETU MEDICAL RECORD & PRESCRIPTION
================================================
Report ID: ${rep.id}
Date Issued: ${rep.date}
Patient Name: ${rep.patientName} (Mobile: ${rep.patientMobile})
Attending Doctor: ${rep.doctorName}
Hospital / Facility: ${rep.hospitalName}
------------------------------------------------
Diagnosis Summary: ${rep.diagnosis}
------------------------------------------------
Vitals:
- BP: ${rep.vitals?.bp || "N/A"}
- Pulse: ${rep.vitals?.pulse || "N/A"}
- Temp: ${rep.vitals?.temp || "N/A"}
- Weight: ${rep.vitals?.weight || "N/A"}
------------------------------------------------
Prescribed Medicines:
${presText || "None specified."}

Verified digital medical record generated by Jeevan Setu Platform.
================================================`;

    mimeType = "text/plain";
    extension = "txt";
    fileBlob = new Blob([textContent], { type: mimeType });
  }

  const fileName = `${cleanPatientName}_${cleanType}_${cleanDate}.${extension}`;

  const metadata = {
    name: fileName,
    mimeType: mimeType,
    parents: [targetFolderId],
  };

  const formData = new FormData();
  formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  formData.append("file", fileBlob);

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,createdTime",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Drive Upload Failed: ${errText}`);
  }

  return await res.json();
};

// Save a report text or file to Google Drive
export const uploadReportToDrive = async (
  accessToken: string,
  fileName: string,
  fileContentText: string,
  mimeType: string = "text/plain"
): Promise<DriveFile> => {
  const folderId = await getOrCreateHealthVaultFolder(accessToken);

  const metadata = {
    name: fileName,
    mimeType: mimeType,
    parents: [folderId],
  };

  const fileBlob = new Blob([fileContentText], { type: mimeType });
  const formData = new FormData();
  formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  formData.append("file", fileBlob);

  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,createdTime", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Drive Upload Failed: ${errText}`);
  }

  return await res.json();
};

// List files inside Jeevan Setu folder
export const listDriveHealthReports = async (accessToken: string): Promise<DriveFile[]> => {
  try {
    const folderId = await getOrCreateHealthVaultFolder(accessToken);
    const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&pageSize=30&fields=files(id,name,mimeType,webViewLink,webContentLink,createdTime,iconLink)&orderBy=createdTime%20desc`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch Google Drive files.");
    }

    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error("Error listing Drive files:", err);
    return [];
  }
};
