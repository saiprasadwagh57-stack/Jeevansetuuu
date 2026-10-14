import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Appointment } from "../../types";
import { PatientReviewModal } from "./PatientReviewModal";
import {
  Calendar,
  Clock,
  User,
  Building2,
  Stethoscope,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
} from "lucide-react";

export const PatientAppointments: React.FC = () => {
  const { appointments, t } = useApp();
  const [reviewingApt, setReviewingApt] = useState<Appointment | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Confirmed / Accepted
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Diagnosis Completed
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" /> Cancelled / Declined
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Awaiting Doctor Approval
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg font-serif">
            {t("myScheduledAppointments", "My Scheduled Appointments")}
          </h3>
          <p className="text-xs text-slate-500">
            Live real-time appointment status updates from hospitals & doctors.
          </p>
        </div>
        <span className="bg-purple-100 text-purple-800 font-bold text-xs px-3 py-1 rounded-full">
          {appointments.length} Total Bookings
        </span>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#F4F0FF] text-[#7C5CFC] border border-[#E2D9FF] flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-7 h-7" />
          </div>
          <p className="font-extrabold text-[#23125E] text-base font-serif">{t("noAppointmentsYet", "No appointments scheduled yet.")}</p>
          <p className="mt-1 text-slate-500 max-w-sm mx-auto">{t("noAppointmentsDesc", "Browse verified hospitals above to select a doctor and request a consultation slot.")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="border border-slate-200 hover:border-purple-200 rounded-2xl p-4 bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{apt.doctorName}</h4>
                  <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {apt.specialty}
                  </span>
                  {getStatusBadge(apt.status)}
                </div>

                <p className="text-xs text-slate-600 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-purple-500" />
                  <strong>{apt.hospitalName}</strong>
                </p>

                <p className="text-xs text-slate-500 flex items-center gap-3 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-500" /> {apt.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-500" /> {apt.timeSlot}
                  </span>
                  <span>Patient: {apt.patientName}</span>
                </p>

                {apt.symptoms && (
                  <p className="text-xs bg-white p-2 rounded-xl border border-slate-200 text-slate-700 mt-2">
                    <strong>Symptoms logged:</strong> {apt.symptoms}
                  </p>
                )}

                {apt.confirmationNote && (
                  <p className="text-xs bg-emerald-50 text-emerald-900 border border-emerald-200 p-2 rounded-xl font-medium mt-2">
                    <strong>Doctor Note:</strong> {apt.confirmationNote}
                  </p>
                )}

                {/* Review trigger for completed appointments */}
                {apt.status === "completed" && (
                  <div className="pt-2">
                    {apt.reviewSubmitted ? (
                      <span className="inline-flex items-center gap-1.5 bg-purple-50 text-[#6750A4] text-xs font-extrabold px-3 py-1.5 rounded-xl border border-purple-200">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>Review Submitted</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setReviewingApt(apt)}
                        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                      >
                        <Star className="w-4 h-4 text-white fill-white" />
                        <span>⭐ Share Your Experience</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="text-right shrink-0 text-xs text-slate-400">
                Logged at: {apt.createdAt}
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewingApt && (
        <PatientReviewModal
          appointment={reviewingApt}
          isOpen={!!reviewingApt}
          onClose={() => setReviewingApt(null)}
        />
      )}
    </div>
  );
};
