import React, { useState } from "react";
import { HospitalProfile, Doctor, Appointment } from "../../types";
import { useApp } from "../../context/AppContext";
import { useLocation } from "../../context/LocationContext";
import { calculateRoadDistanceAndEta } from "../../utils/location";
import {
  X,
  MapPin,
  Phone,
  CheckCircle2,
  Calendar,
  Clock,
  IndianRupee,
  Activity,
  Bed,
  Building2,
  Stethoscope,
  ExternalLink,
  ShieldCheck,
  Star,
  FileText,
  AlertCircle,
  PlusCircle,
  Navigation,
} from "lucide-react";

interface HospitalDetailModalProps {
  hospital: HospitalProfile;
  onClose: () => void;
}

export const HospitalDetailModal: React.FC<HospitalDetailModalProps> = ({
  hospital,
  onClose,
}) => {
  const { doctors, selectedSpecialtyFilter, bookAppointment, patientIdentifier, reviews, getHospitalRatingStats, getDoctorRatingStats, loggedInPatient } = useApp();
  const [activeTab, setActiveTab] = useState<"overview" | "facilities" | "expenses" | "doctors" | "reviews">("doctors");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const { location: activeUserLoc } = useLocation();

  // Compute distance from active patient location
  const patLat = activeUserLoc?.lat || loggedInPatient?.lat || 19.8451;
  const patLng = activeUserLoc?.lng || loggedInPatient?.lng || 73.9961;
  const hLat = hospital.lat || 19.5761;
  const hLng = hospital.lng || 74.2072;

  const distResult = calculateRoadDistanceAndEta(
    { lat: patLat, lng: patLng },
    { lat: hLat, lng: hLng }
  );

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${patLat},${patLng}&destination=${hLat},${hLng}&travelmode=driving`;

  const hospitalRatingStats = getHospitalRatingStats(hospital.id);
  const hospitalApprovedReviews = reviews.filter((r) => r.hospitalId === hospital.id && r.status === "approved");

  // Booking Form State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDoc, setBookingDoc] = useState<Doctor | null>(null);
  const [patientName, setPatientName] = useState(patientIdentifier || "Ramesh Patil");
  const [patientMobile, setPatientMobile] = useState("9876543210");
  const [patientAge, setPatientAge] = useState<number>(42);
  const [patientGender, setPatientGender] = useState<string>("Male");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [timeSlot, setTimeSlot] = useState<string>("10:30 AM");
  const [symptomsInput, setSymptomsInput] = useState<string>("");
  const [bookingSuccess, setBookingSuccess] = useState<Appointment | null>(null);

  // Get doctors belonging strictly to this hospital
  const hospitalDoctors = doctors.filter(
    (d) => d.hospitalId === hospital.id || (hospital.hospitalId && d.hospitalId === hospital.hospitalId)
  );

  // Sort doctors so those matching the selected specialty filter appear first
  const sortedDoctors = [...hospitalDoctors].sort((a, b) => {
    if (selectedSpecialtyFilter && selectedSpecialtyFilter !== "All") {
      const aMatch = a.specialty.toLowerCase().includes(selectedSpecialtyFilter.toLowerCase());
      const bMatch = b.specialty.toLowerCase().includes(selectedSpecialtyFilter.toLowerCase());
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
    }
    return 0;
  });

  const handleOpenBooking = (doc: Doctor) => {
    setBookingDoc(doc);
    setBookingModalOpen(true);
    setBookingSuccess(null);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDoc) return;

    const newApt = bookAppointment({
      patientName,
      patientMobile,
      patientAge,
      patientGender,
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      doctorId: bookingDoc.id,
      doctorName: bookingDoc.name,
      specialty: bookingDoc.specialty,
      date,
      timeSlot,
      symptoms: symptomsInput || "General consultation request",
    });

    setBookingSuccess(newApt);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-purple-100 my-2 sm:my-8 max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header Hero Banner */}
        <div className="relative bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-4 sm:p-6 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={hospital.logoUrl || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&q=80"}
              alt={hospital.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-md bg-white shrink-0"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-purple-950 shadow-sm flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin Verified Hospital
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-purple-200 border border-white/10">
                  {hospital.hospitalType}
                </span>
                <span className="text-xs text-purple-200">
                  Reg #: {hospital.registrationNumber}
                </span>
              </div>

              <h2 className="text-2xl font-bold font-serif text-white">{hospital.name}</h2>
              <p className="text-xs text-purple-200/90 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                {hospital.address || `${hospital.city}, ${hospital.state}`} - {hospital.pinCode}
              </p>
              <p className="text-xs font-bold text-amber-300 flex items-center gap-2 mt-1">
                <span>📍 {distResult.distanceKm} km away</span>
                <span>•</span>
                <span>⏱️ ~{distResult.etaMins} mins driving</span>
              </p>
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="mt-4 pt-4 border-t border-purple-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-amber-300 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-300" /> {hospital.rating} / 5.0
              </span>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-amber-300 hover:text-white underline font-bold transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-300" /> Get Google Maps Directions <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${hospital.emergencyContact}`}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> Emergency: {hospital.emergencyContact}
              </a>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-purple-100 bg-purple-50/50 px-6 shrink-0 overflow-x-auto">
          {[
            { id: "doctors", label: `Doctors (${sortedDoctors.length})`, icon: <Stethoscope className="w-4 h-4" /> },
            { id: "reviews", label: `Reviews & Ratings (${hospitalApprovedReviews.length})`, icon: <Star className="w-4 h-4 text-amber-500 fill-amber-400" /> },
            { id: "facilities", label: "Facilities & Beds", icon: <Bed className="w-4 h-4" /> },
            { id: "expenses", label: "Treatment Costs & Pricing", icon: <IndianRupee className="w-4 h-4" /> },
            { id: "overview", label: "Overview & Services", icon: <Building2 className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-purple-700 text-purple-700 bg-white"
                  : "border-transparent text-slate-500 hover:text-purple-600"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: DOCTORS */}
          {activeTab === "doctors" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-serif">
                    Doctors at {hospital.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Book an instant appointment with a verified specialist.
                  </p>
                </div>
                {selectedSpecialtyFilter && selectedSpecialtyFilter !== "All" && (
                  <span className="text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-medium border border-amber-200">
                    Surfacing <strong className="font-bold">{selectedSpecialtyFilter}</strong> doctors first
                  </span>
                )}
              </div>

              {sortedDoctors.length === 0 ? (
                <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-8 text-center text-slate-600">
                  <Stethoscope className="w-10 h-10 text-purple-300 mx-auto mb-2" />
                  <p className="font-semibold text-sm">No doctors currently registered for this hospital.</p>
                  <p className="text-xs text-slate-500 mt-1">Please check back or contact emergency line.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedDoctors.map((doc) => {
                    const isFilteredMatch =
                      selectedSpecialtyFilter &&
                      selectedSpecialtyFilter !== "All" &&
                      doc.specialty.toLowerCase().includes(selectedSpecialtyFilter.toLowerCase());

                    const docStats = getDoctorRatingStats(doc.id);
                    const docDisplayRating = docStats.totalReviews > 0 ? docStats.avgRating : (doc.rating || 4.8);

                    return (
                      <div
                        key={doc.id}
                        className={`rounded-2xl p-4 transition-all border ${
                          isFilteredMatch
                            ? "bg-purple-50/80 border-purple-300 shadow-sm ring-1 ring-purple-200"
                            : "bg-white border-slate-200 hover:border-purple-200 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-lg shrink-0">
                            {doc.name.charAt(4) || "D"}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="font-bold text-slate-900 text-sm">{doc.name}</h4>
                              <span className="text-[11px] font-extrabold text-amber-600 flex items-center gap-0.5">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> {docDisplayRating}
                                {docStats.totalReviews > 0 && (
                                  <span className="text-[10px] text-slate-500 font-normal">({docStats.totalReviews})</span>
                                )}
                              </span>
                            </div>
                            <span className="inline-block bg-purple-100 text-purple-800 font-bold text-[11px] px-2 py-0.5 rounded-md mt-1">
                              {doc.specialty}
                            </span>
                            <p className="text-xs text-slate-500 mt-1">{doc.qualification}</p>
                            <p className="text-xs text-slate-600 mt-0.5">
                              Exp: <strong>{doc.experienceYears} Years</strong> • Fee:{" "}
                              <strong className="text-purple-700">₹{doc.consultationFee}</strong>
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-purple-500" /> {doc.timing}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Medical Cert Verified
                          </span>
                          <button
                            onClick={() => handleOpenBooking(doc)}
                            className="bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Calendar className="w-3.5 h-3.5" /> Book Appointment
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: PATIENT REVIEWS & RATINGS */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {/* Summary Header */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
                  <div className="text-center md:text-left space-y-1">
                    <div className="flex items-baseline gap-2 justify-center md:justify-start">
                      <span className="text-4xl font-black font-serif text-[#23125E]">
                        {hospitalRatingStats.avgRating}
                      </span>
                      <span className="text-slate-400 font-bold text-sm">/ 5.0</span>
                    </div>
                    <div className="flex items-center gap-1 justify-center md:justify-start text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(hospitalRatingStats.avgRating)
                              ? "fill-amber-400 text-amber-500"
                              : "text-slate-200 fill-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 font-bold">
                      Based on {hospitalRatingStats.totalReviews} verified patient reviews
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 mt-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Reviews from Completed Appointments
                    </span>
                  </div>

                  {/* Rating Breakdown Bars */}
                  <div className="w-full md:w-64 space-y-1.5 text-xs">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = hospitalRatingStats.breakdown[star] || 0;
                      const pct = hospitalRatingStats.totalReviews > 0 ? (count / hospitalRatingStats.totalReviews) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="w-6 font-bold text-slate-700 text-right">{star}★</span>
                          <div className="flex-1 bg-slate-200/80 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-amber-400 h-full rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-[11px] text-slate-500 text-right font-medium">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm font-serif flex items-center gap-2">
                  <span>Patient Experiences & Feedback</span>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {hospitalApprovedReviews.length}
                  </span>
                </h4>

                {hospitalApprovedReviews.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-10 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-purple-100 text-[#7C5CFC] flex items-center justify-center mx-auto">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-sm font-serif">No patient reviews yet.</h5>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Reviews will appear here after completed appointments are verified by the hospital and doctor.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hospitalApprovedReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="bg-white border border-slate-200 hover:border-purple-200 rounded-2xl p-4 transition-all shadow-xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-900 font-bold text-xs flex items-center justify-center">
                              {rev.isAnonymous ? "A" : rev.patientName.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 text-xs block">
                                {rev.isAnonymous ? "Anonymous Patient" : rev.patientName}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                Doctor: <strong>{rev.doctorName}</strong>
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">{rev.createdAt}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-2 rounded-xl">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500 font-medium">Hospital Rating:</span>
                            <span className="font-bold text-amber-600 flex items-center">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> {rev.hospitalRating}/5
                            </span>
                          </div>
                          <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                            <span className="text-slate-500 font-medium">Doctor Rating:</span>
                            <span className="font-bold text-amber-600 flex items-center">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> {rev.doctorRating}/5
                            </span>
                          </div>
                        </div>

                        {rev.feedback && (
                          <p className="text-xs text-slate-700 leading-relaxed italic bg-purple-50/50 p-2.5 rounded-xl border border-purple-100/60">
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

          {/* TAB 2: FACILITIES & BEDS */}
          {activeTab === "facilities" && (
            <div>
              {/* Bed Availability Grid */}
              <h3 className="font-bold text-slate-900 text-sm font-serif mb-3 flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-purple-600" /> Real-time Live Bed Availability
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 text-center">
                  <span className="text-[11px] font-semibold text-purple-700 uppercase block">ICU Beds</span>
                  <span className="text-xl font-extrabold text-slate-900">
                    {hospital.beds.icuAvailable} <span className="text-xs font-normal text-slate-500">/ {hospital.beds.icuTotal}</span>
                  </span>
                  <span className="text-[10px] text-purple-600 block mt-0.5">Live Available</span>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 text-center">
                  <span className="text-[11px] font-semibold text-purple-700 uppercase block">General Beds</span>
                  <span className="text-xl font-extrabold text-slate-900">
                    {hospital.beds.generalAvailable} <span className="text-xs font-normal text-slate-500">/ {hospital.beds.generalTotal}</span>
                  </span>
                  <span className="text-[10px] text-purple-600 block mt-0.5">Live Available</span>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 text-center">
                  <span className="text-[11px] font-semibold text-purple-700 uppercase block">Private Rooms</span>
                  <span className="text-xl font-extrabold text-slate-900">
                    {hospital.beds.privateAvailable} <span className="text-xs font-normal text-slate-500">/ {hospital.beds.privateTotal}</span>
                  </span>
                  <span className="text-[10px] text-purple-600 block mt-0.5">Live Available</span>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 text-center">
                  <span className="text-[11px] font-semibold text-purple-700 uppercase block">Deluxe Rooms</span>
                  <span className="text-xl font-extrabold text-slate-900">
                    {hospital.beds.deluxeAvailable} <span className="text-xs font-normal text-slate-500">/ {hospital.beds.deluxeTotal}</span>
                  </span>
                  <span className="text-[10px] text-purple-600 block mt-0.5">Live Available</span>
                </div>
              </div>

              {/* Infrastructure & Diagnostic Facilities */}
              <h3 className="font-bold text-slate-900 text-sm font-serif mb-3 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-purple-600" /> Infrastructure & Equipment List
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {hospital.facilities.map((fac) => (
                  <div
                    key={fac.id}
                    className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">{fac.name}</span>
                      <span className="text-[10px] text-slate-500">{fac.category || "Facility"}</span>
                    </div>
                    <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-lg">
                      {fac.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ESTIMATED EXPENSES */}
          {activeTab === "expenses" && (
            <div>
              <div className="mb-4">
                <h3 className="font-bold text-slate-900 text-base font-serif">
                  Estimated Treatment Costs & Expense Schedule
                </h3>
                <p className="text-xs text-slate-500">
                  Transparent pricing maintained directly by hospital administration for patient comparison.
                </p>
              </div>

              <div className="bg-white border border-purple-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-purple-900 text-white font-semibold">
                    <tr>
                      <th className="p-3">Service / Procedure</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Estimated Charges</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    <tr className="hover:bg-purple-50/50">
                      <td className="p-3 font-semibold text-slate-900">OPD Consultation Fee</td>
                      <td className="p-3 text-slate-500">Outpatient</td>
                      <td className="p-3 text-right text-purple-800 font-bold">₹{hospital.expenses.opdFee}</td>
                    </tr>
                    <tr className="hover:bg-purple-50/50">
                      <td className="p-3 font-semibold text-slate-900">ICU Charges (per day)</td>
                      <td className="p-3 text-slate-500">Critical Care</td>
                      <td className="p-3 text-right text-purple-800 font-bold">₹{hospital.expenses.icuChargesPerDay}</td>
                    </tr>
                    <tr className="hover:bg-purple-50/50">
                      <td className="p-3 font-semibold text-slate-900">General Ward Charges (per day)</td>
                      <td className="p-3 text-slate-500">Inpatient</td>
                      <td className="p-3 text-right text-purple-800 font-bold">₹{hospital.expenses.generalWardPerDay}</td>
                    </tr>
                    <tr className="hover:bg-purple-50/50">
                      <td className="p-3 font-semibold text-slate-900">Private Room Charges (per day)</td>
                      <td className="p-3 text-slate-500">Inpatient</td>
                      <td className="p-3 text-right text-purple-800 font-bold">₹{hospital.expenses.privateRoomPerDay}</td>
                    </tr>
                    <tr className="hover:bg-purple-50/50">
                      <td className="p-3 font-semibold text-slate-900">MRI Scan Cost</td>
                      <td className="p-3 text-slate-500">Imaging</td>
                      <td className="p-3 text-right text-purple-800 font-bold">₹{hospital.expenses.mriCost}</td>
                    </tr>
                    <tr className="hover:bg-purple-50/50">
                      <td className="p-3 font-semibold text-slate-900">CT Scan Cost</td>
                      <td className="p-3 text-slate-500">Imaging</td>
                      <td className="p-3 text-right text-purple-800 font-bold">₹{hospital.expenses.ctScanCost}</td>
                    </tr>
                    <tr className="hover:bg-purple-50/50">
                      <td className="p-3 font-semibold text-slate-900">Blood Test Suite Cost</td>
                      <td className="p-3 text-slate-500">Laboratory</td>
                      <td className="p-3 text-right text-purple-800 font-bold">₹{hospital.expenses.bloodTestCost}</td>
                    </tr>
                    <tr className="hover:bg-purple-50/50">
                      <td className="p-3 font-semibold text-slate-900">X-Ray Cost</td>
                      <td className="p-3 text-slate-500">Diagnostics</td>
                      <td className="p-3 text-right text-purple-800 font-bold">₹{hospital.expenses.xrayCost}</td>
                    </tr>
                    <tr className="hover:bg-purple-50/50">
                      <td className="p-3 font-semibold text-slate-900">Ambulance Transport Charges</td>
                      <td className="p-3 text-slate-500">Emergency Services</td>
                      <td className="p-3 text-right text-purple-800 font-bold">₹{hospital.expenses.ambulanceCharges}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: OVERVIEW & SERVICES */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-serif mb-2">Medical Departments</h3>
                <div className="flex flex-wrap gap-2">
                  {hospital.departments.map((dept) => (
                    <span
                      key={dept}
                      className="bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1 rounded-xl text-xs font-medium"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm font-serif mb-2">Available Healthcare Services & Schemes</h3>
                <div className="flex flex-wrap gap-2">
                  {hospital.services.map((srv) => (
                    <span
                      key={srv}
                      className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {srv}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm font-serif mb-2">Hospital Contact & Address</h3>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
                  <p>
                    <strong>Full Address:</strong> {hospital.address}, {hospital.city}, {hospital.state} - {hospital.pinCode}
                  </p>
                  <p>
                    <strong>Contact Phone:</strong> {hospital.contactNumber}
                  </p>
                  <p>
                    <strong>Email Address:</strong> {hospital.email}
                  </p>
                  {hospital.website && (
                    <p>
                      <strong>Official Website:</strong>{" "}
                      <a href={hospital.website} target="_blank" rel="noreferrer" className="text-purple-700 underline">
                        {hospital.website}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>

      {/* INNER MODAL: APPOINTMENT BOOKING */}
      {bookingModalOpen && bookingDoc && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-6 border border-purple-100 relative animate-scaleIn">
            <button
              onClick={() => setBookingModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-serif">Appointment Booked!</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Your appointment request has been sent live to {bookingDoc.name} at {hospital.name}.
                </p>

                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 my-4 text-left text-xs space-y-1">
                  <p><strong>Appointment ID:</strong> {bookingSuccess.id}</p>
                  <p><strong>Doctor:</strong> {bookingSuccess.doctorName} ({bookingSuccess.specialty})</p>
                  <p><strong>Date & Time:</strong> {bookingSuccess.date} at {bookingSuccess.timeSlot}</p>
                  <p><strong>Status:</strong> <span className="text-amber-700 font-bold capitalize">{bookingSuccess.status}</span></p>
                </div>

                <p className="text-[11px] text-slate-500">
                  Switch to the <strong className="text-purple-700">Doctor Portal</strong> or check <strong className="text-purple-700">My Appointments</strong> to view live updates!
                </p>

                <button
                  onClick={() => {
                    setBookingModalOpen(false);
                    onClose();
                  }}
                  className="mt-5 w-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-3 rounded-xl shadow-md cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base font-serif">
                      Book Appointment
                    </h3>
                    <p className="text-xs text-purple-700 font-semibold">
                      {bookingDoc.name} • {bookingDoc.specialty}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Full Name</label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        value={patientMobile}
                        onChange={(e) => setPatientMobile(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Age & Gender</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={patientAge}
                          onChange={(e) => setPatientAge(Number(e.target.value))}
                          className="w-1/2 border border-slate-200 rounded-xl p-2.5 text-xs"
                          placeholder="Age"
                        />
                        <select
                          value={patientGender}
                          onChange={(e) => setPatientGender(e.target.value)}
                          className="w-1/2 border border-slate-200 rounded-xl p-2.5 text-xs"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Date</label>
                      <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
                      <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs"
                      >
                        <option value="09:30 AM">09:30 AM</option>
                        <option value="10:30 AM">10:30 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="02:30 PM">02:30 PM</option>
                        <option value="05:30 PM">05:30 PM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Symptoms / Health Concern</label>
                    <textarea
                      rows={2}
                      placeholder="Describe symptoms briefly for the doctor..."
                      value={symptomsInput}
                      onChange={(e) => setSymptomsInput(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Consultation Fee: <span className="text-purple-700">₹{bookingDoc.consultationFee}</span>
                  </span>

                  <button
                    type="submit"
                    className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
                  >
                    Confirm Booking Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
