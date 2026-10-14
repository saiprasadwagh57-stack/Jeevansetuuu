import React, { useState } from "react";
import { Appointment } from "../../types";
import { useApp } from "../../context/AppContext";
import { Star, X, CheckCircle2, Shield, User, Building2, Stethoscope, Calendar } from "lucide-react";

interface PatientReviewModalProps {
  appointment: Appointment;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const PatientReviewModal: React.FC<PatientReviewModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onSubmitted,
}) => {
  const { addReview, loggedInPatient } = useApp();

  const [doctorRating, setDoctorRating] = useState<number>(5);
  const [hospitalRating, setHospitalRating] = useState<number>(5);
  const [hoverDocRating, setHoverDocRating] = useState<number>(0);
  const [hoverHospRating, setHoverHospRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    addReview({
      appointmentId: appointment.id,
      patientId: loggedInPatient?.id || "pat-guest",
      patientName: appointment.patientName || loggedInPatient?.fullName || "Patient",
      patientMobile: appointment.patientMobile,
      isAnonymous,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      hospitalId: appointment.hospitalId,
      hospitalName: appointment.hospitalName,
      doctorRating,
      hospitalRating,
      feedback: feedback.trim(),
    });

    setIsSubmitting(false);
    setSubmittedSuccess(true);

    setTimeout(() => {
      setSubmittedSuccess(false);
      if (onSubmitted) onSubmitted();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-purple-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#23125E] to-[#4323A0] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">⭐</span>
            <h2 className="text-xl font-extrabold font-serif">Share Your Experience</h2>
          </div>
          <p className="text-xs text-purple-200 leading-relaxed">
            Your appointment has been completed. Please rate your experience to help other patients and improve healthcare services.
          </p>
        </div>

        {submittedSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Thank You for Your Feedback!</h3>
            <p className="text-xs text-slate-500">
              Your review has been verified and saved. It will help other patients choose trusted doctors and hospitals.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
            {/* Appointment Details Summary */}
            <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Stethoscope className="w-4 h-4 text-[#6750A4]" />
                  <span>{appointment.doctorName}</span>
                </div>
                <span className="text-[10px] bg-purple-100 text-[#21005D] font-extrabold px-2 py-0.5 rounded-full">
                  {appointment.specialty}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium">{appointment.hospitalName}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date: {appointment.date}</span>
              </div>
            </div>

            {/* Doctor Rating */}
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#23125E] flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-[#6750A4]" />
                  <span>Doctor Rating</span>
                </label>
                <span className="text-xs font-bold text-amber-600">
                  {hoverDocRating || doctorRating} / 5 Stars
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                How would you rate the doctor's diagnosis, communication, and overall care?
              </p>
              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setDoctorRating(star)}
                    onMouseEnter={() => setHoverDocRating(star)}
                    onMouseLeave={() => setHoverDocRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (hoverDocRating || doctorRating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-200 fill-slate-100"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Hospital Rating */}
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#23125E] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#6750A4]" />
                  <span>Hospital Rating</span>
                </label>
                <span className="text-xs font-bold text-amber-600">
                  {hoverHospRating || hospitalRating} / 5 Stars
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                How would you rate the hospital's facilities, cleanliness, staff behaviour, and overall experience?
              </p>
              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setHospitalRating(star)}
                    onMouseEnter={() => setHoverHospRating(star)}
                    onMouseLeave={() => setHoverHospRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (hoverHospRating || hospitalRating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-200 fill-slate-100"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Written Feedback */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-[#23125E]">Written Feedback</label>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us about your experience, suggestions, doctor behaviour, waiting time, cleanliness, or anything that could be improved..."
                className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
              />
            </div>

            {/* Anonymous Checkbox */}
            <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="anonymous-check"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
              />
              <label htmlFor="anonymous-check" className="text-xs text-slate-700 font-medium cursor-pointer">
                <span className="font-bold block">Submit my review anonymously</span>
                <span className="text-[10px] text-slate-500 block">
                  Your identity will be hidden from the public and hospital staff, but administrators maintain verification internally.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#23125E] to-[#4323A0] text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
