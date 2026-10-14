export type UserRole = "patient" | "hospital_reg" | "hospital_mgmt" | "admin";

export type HospitalType = "Government" | "Private" | "Multi-Specialty" | "Trust" | "Clinic" | "Super Specialty";

export type VerificationStatus = "pending" | "verified" | "rejected" | "changes_requested";

export const AUTHORIZED_ADMIN_EMAILS = [
  "saiprasadwagh57@gmail.com",
  "sakshi212007@gmail.com",
  "admin@jeevansetu.gov.in"
];

export const ALLOWED_ADMIN_EMAILS = AUTHORIZED_ADMIN_EMAILS;

export interface PatientUser {
  id: string;
  fullName: string;
  mobile: string;
  age: number;
  gender?: string;
  profilePhoto?: string;
  password?: string;
  address?: string;
  lat?: number;
  lng?: number;
  googleMapsUrl?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  password?: string;
  createdAt: string;
}

export interface FacilityItem {
  id: string;
  name: string;
  count: number;
  available: boolean;
  category?: string;
}

export interface HospitalExpenses {
  opdFee: number;
  icuChargesPerDay: number;
  generalWardPerDay: number;
  privateRoomPerDay: number;
  deluxeRoomPerDay: number;
  mriCost: number;
  ctScanCost: number;
  bloodTestCost: number;
  xrayCost: number;
  ambulanceCharges: number;
}

export interface BedAvailability {
  icuTotal: number;
  icuAvailable: number;
  generalTotal: number;
  generalAvailable: number;
  privateTotal: number;
  privateAvailable: number;
  deluxeTotal: number;
  deluxeAvailable: number;
}

export interface HospitalDocuments {
  hospitalLicenseUrl: string;
  govRegistrationCertUrl: string;
  nabhCertUrl?: string;
  hospitalImageUrl: string;
  ownershipProofUrl: string;
}

export interface HospitalProfile {
  id: string;
  hospitalId?: string; // Generated on approval (e.g., HOSP-4091)
  password?: string;   // Generated on approval
  name: string;
  registrationNumber: string;
  hospitalType: HospitalType;
  logoUrl: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  contactNumber: string;
  email: string;
  emergencyContact: string;
  googleMapsUrl: string;
  website?: string;
  lat?: number;
  lng?: number;
  locationVerified?: boolean;
  
  facilities: FacilityItem[];
  departments: string[];
  services: string[];
  expenses: HospitalExpenses;
  beds: BedAvailability;
  documents: HospitalDocuments;
  
  verificationStatus: VerificationStatus;
  adminNotes?: string;
  rejectionReason?: string;
  submittedAt: string;
  approvedAt?: string;
  
  rating: number;
  distanceKm: number;
  galleryImages: string[];
}

export interface Doctor {
  id: string;
  doctorId?: string;   // Unique Doctor ID (e.g., DOC-7012)
  password?: string;   // Password for doctor login inside hospital
  name: string;
  mobile: string;
  email?: string;
  hospitalId: string;
  hospitalName: string;
  specialty: string;
  experienceYears: number;
  qualification: string;
  certificateUrl: string;       // Degree certificate URL
  experienceCertUrl?: string;   // Experience certificate URL
  profileImageUrl?: string;     // Profile image URL
  consultationFee: number;
  availableDays: string[];
  timing: string;
  rating: number;
  verified: boolean;
}

export interface PatientReview {
  id: string;
  appointmentId: string;
  patientId?: string;
  patientName: string;
  patientMobile?: string;
  isAnonymous: boolean;
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  doctorRating: number; // 1 to 5
  hospitalRating: number; // 1 to 5
  feedback: string;
  createdAt: string;
  status: "approved" | "flagged" | "removed";
  moderationNotes?: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientMobile: string;
  patientAge?: number;
  patientGender?: string;
  hospitalId: string;
  hospitalName: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  timeSlot: string;
  symptoms: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  confirmationNote?: string;
  createdAt: string;
  reviewSubmitted?: boolean;
}

export interface PrescriptionItem {
  medicineName: string;
  dosage: string; // e.g. "500mg"
  timing: string; // e.g. "1-0-1 (After Meals)"
  duration: string; // e.g. "5 days"
  notes?: string;
}

export interface DiagnosticReport {
  id: string;
  reportId?: string;
  patientId?: string;
  patientUid?: string;
  appointmentId: string;
  patientName: string;
  patientMobile: string;
  patientAge?: number;
  patientGender?: string;
  doctorId: string;
  doctorUid?: string;
  doctorName: string;
  hospitalId?: string;
  hospitalUid?: string;
  hospitalName: string;
  diagnosis: string;
  symptoms?: string;
  prescriptions: PrescriptionItem[];
  labReportName?: string;
  labReportUrl?: string;
  reportType?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  storagePath?: string;
  date: string;
  uploadedAt?: string;
  vitals?: {
    bp?: string;
    pulse?: string;
    temp?: string;
    weight?: string;
  };
  driveBackupStatus?: "backed_up" | "pending" | "not_connected" | "failed";
  driveFileUrl?: string;
  driveFileId?: string;
  driveSubfolder?: string;
}

export interface SymptomAnalysisResult {
  likely_specialty: string;
  urgency: "low" | "medium" | "high";
  guidance_text: string;
  search_query: string;
  warning_signs?: string[];
}

export interface NotificationItem {
  id: string;
  targetRole: UserRole | "all";
  hospitalId?: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "info" | "success" | "warning" | "alert";
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  timestamp: string;
  deviceInfo?: string;
  notes?: string;
}
