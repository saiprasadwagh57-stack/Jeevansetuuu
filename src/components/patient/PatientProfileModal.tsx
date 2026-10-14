import React, { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { useLocation } from "../../context/LocationContext";
import { PatientUser } from "../../types";
import { LocationMapPickerModal } from "../common/LocationMapPickerModal";
import { parseGoogleMapsUrl } from "../../utils/location";
import {
  X,
  User,
  Phone,
  Camera,
  Upload,
  Trash2,
  CheckCircle,
  ShieldCheck,
  Calendar,
  Edit2,
  Save,
  MapPin,
  Compass,
  Link as LinkIcon,
} from "lucide-react";

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEditing?: boolean;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  isOpen,
  onClose,
  initialEditing = false,
}) => {
  const { loggedInPatient, updatePatientProfile } = useApp();
  const [isEditing, setIsEditing] = useState(initialEditing);

  const [fullName, setFullName] = useState(loggedInPatient?.fullName || "");
  const [age, setAge] = useState(loggedInPatient?.age || 30);
  const [gender, setGender] = useState(loggedInPatient?.gender || "Male");
  const [profilePhoto, setProfilePhoto] = useState(loggedInPatient?.profilePhoto || "");
  const { location: activeLoc } = useLocation();

  const [address, setAddress] = useState(loggedInPatient?.address || activeLoc?.formattedAddress || "Sinnar, Nashik, Maharashtra - 422103");
  const [lat, setLat] = useState<number>(loggedInPatient?.lat || activeLoc?.lat || 19.8451);
  const [lng, setLng] = useState<number>(loggedInPatient?.lng || activeLoc?.lng || 73.9961);
  const [mapsUrl, setMapsUrl] = useState<string>(loggedInPatient?.googleMapsUrl || `https://www.google.com/maps?q=${activeLoc?.lat || 19.8451},${activeLoc?.lng || 73.9961}`);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !loggedInPatient) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfilePhoto(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatientProfile({
      fullName: fullName.trim(),
      age: Number(age),
      gender,
      profilePhoto,
      address,
      lat,
      lng,
      googleMapsUrl: mapsUrl,
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditing(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-purple-200 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-purple-100 border-2 border-[#7C5CFC] shrink-0 shadow-md flex items-center justify-center">
            {profilePhoto || loggedInPatient.profilePhoto ? (
              <img
                src={profilePhoto || loggedInPatient.profilePhoto}
                alt={loggedInPatient.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#7C5CFC] text-white font-extrabold text-2xl flex items-center justify-center">
                {loggedInPatient.fullName.charAt(0)}
              </div>
            )}
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Active Account" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-serif text-slate-900">{loggedInPatient.fullName}</h2>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Mobile: <strong>{loggedInPatient.mobile}</strong>
            </p>
            <p className="text-xs text-purple-700 font-medium">
              Age: {loggedInPatient.age} Yrs • Gender: {loggedInPatient.gender || "Not specified"}
            </p>
          </div>
        </div>

        {/* Profile Card / Edit Form */}
        {!isEditing ? (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Full Name</span>
                <span className="font-extrabold text-slate-900 block">{loggedInPatient.fullName}</span>
              </div>
              <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Mobile Number</span>
                <span className="font-extrabold text-slate-900 block">{loggedInPatient.mobile}</span>
              </div>
              <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Age</span>
                <span className="font-extrabold text-slate-900 block">{loggedInPatient.age} Years</span>
              </div>
              <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Gender</span>
                <span className="font-extrabold text-slate-900 block">{loggedInPatient.gender || "Male"}</span>
              </div>
            </div>

            {/* Registered Google Maps Location Display */}
            <div className="bg-purple-50/80 p-3.5 rounded-2xl border border-purple-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#7C5CFC] font-extrabold text-xs flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> Registered Google Maps Location
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                  GPS Active
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 leading-snug">
                {loggedInPatient.address || "FC Road, Shivajinagar, Pune, Maharashtra 411005"}
              </p>
              {loggedInPatient.lat && loggedInPatient.lng && (
                <p className="text-[10px] text-slate-500 font-mono">
                  Coordinates: {loggedInPatient.lat.toFixed(4)}, {loggedInPatient.lng.toFixed(4)}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full bg-[#7C5CFC] hover:bg-[#6848F0] text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-[#7C5CFC]/20 cursor-pointer"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile Details
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 pt-2 border-t border-slate-100">
            <div className="space-y-3">
              {/* Photo Upload in Edit */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Change Profile Photo
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-[#7C5CFC] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Photo
                  </button>
                  {profilePhoto && (
                    <button
                      type="button"
                      onClick={() => setProfilePhoto("")}
                      className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove Photo
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/jpeg,image/jpg,image/png"
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#7C5CFC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age (Years)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#7C5CFC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-[#7C5CFC]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Location Editor in Profile */}
              <div className="space-y-2 bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#7C5CFC]" /> Google Maps Location
                  </label>
                  <button
                    type="button"
                    onClick={() => setLocationModalOpen(true)}
                    className="bg-[#7C5CFC] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Compass className="w-3 h-3" /> Change Pin
                  </button>
                </div>
                <p className="text-xs font-semibold text-slate-700 bg-white p-2 rounded-xl border border-slate-200">
                  {address}
                </p>
                <input
                  type="text"
                  value={mapsUrl}
                  onChange={(e) => {
                    setMapsUrl(e.target.value);
                    const p = parseGoogleMapsUrl(e.target.value);
                    if (p) {
                      setLat(p.lat);
                      setLng(p.lng);
                      if (p.address) setAddress(p.address);
                    }
                  }}
                  placeholder="Paste Google Maps link or coordinates..."
                  className="w-full border border-slate-200 rounded-xl p-2 text-xs"
                />
              </div>
            </div>

            {saveSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-2.5 rounded-xl flex items-center gap-1.5 font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Profile updated successfully!
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#7C5CFC] hover:bg-[#6848F0] text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#7C5CFC]/20"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      <LocationMapPickerModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        initialLat={lat}
        initialLng={lng}
        initialAddress={address}
        title="Update Patient Home Location on Google Map"
        onConfirmLocation={(loc) => {
          setAddress(loc.address);
          setLat(loc.lat);
          setLng(loc.lng);
          if (loc.googleMapsUrl) setMapsUrl(loc.googleMapsUrl);
        }}
      />
    </div>
  );
};
