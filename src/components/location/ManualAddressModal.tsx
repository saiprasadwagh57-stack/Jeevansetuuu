import React, { useState, useEffect } from "react";
import { useLocation } from "../../context/LocationContext";
import { MapPin, X, Check, Search, Sparkles, Building, Hash, Loader2, Compass } from "lucide-react";

export const ManualAddressModal: React.FC = () => {
  const {
    manualModalOpen,
    closeManualModal,
    setManualAddress,
    lookupPinCode,
    location,
  } = useLocation();

  const [formData, setFormData] = useState({
    houseNo: "",
    street: "",
    area: "",
    villageCity: "Sinnar",
    taluka: "Sinnar",
    district: "Nashik",
    state: "Maharashtra",
    country: "India",
    pinCode: "422103",
  });

  const [areaSuggestions, setAreaSuggestions] = useState<string[]>([]);
  const [isPinDetecting, setIsPinDetecting] = useState<boolean>(false);
  const [pinStatusMsg, setPinStatusMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize form with current location values when opened
  useEffect(() => {
    if (manualModalOpen && location) {
      setFormData({
        houseNo: location.houseNo || "",
        street: location.street || "",
        area: location.area || "",
        villageCity: location.villageCity || "Sinnar",
        taluka: location.taluka || "Sinnar",
        district: location.district || "Nashik",
        state: location.state || "Maharashtra",
        country: location.country || "India",
        pinCode: location.pinCode || "422103",
      });
      setPinStatusMsg(null);
    }
  }, [manualModalOpen, location]);

  // Automatic PIN Code Lookup as user types 6 digits
  useEffect(() => {
    const cleanPin = formData.pinCode.trim();
    if (cleanPin.length === 6 && /^\d{6}$/.test(cleanPin)) {
      const timer = setTimeout(async () => {
        setIsPinDetecting(true);
        setPinStatusMsg("Detecting location details from PIN Code...");
        
        const res = await lookupPinCode(cleanPin);
        setIsPinDetecting(false);

        if (res.success) {
          setFormData((prev) => ({
            ...prev,
            villageCity: res.villageCity || prev.villageCity,
            taluka: res.villageCity || prev.taluka,
            district: res.district || prev.district,
            state: res.state || prev.state,
            country: res.country || prev.country,
          }));

          if (res.areaOptions && res.areaOptions.length > 0) {
            setAreaSuggestions(res.areaOptions);
          }

          setPinStatusMsg(`✓ Auto-detected: ${res.villageCity}, ${res.district}, ${res.state}`);
        } else {
          setPinStatusMsg(res.error || "Unable to auto-detect PIN details. Please enter manually.");
        }
      }, 400);

      return () => clearTimeout(timer);
    } else {
      setPinStatusMsg(null);
      setAreaSuggestions([]);
    }
  }, [formData.pinCode]);

  if (!manualModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // If lat/lng not already geocoded, lookup pin code or city to get lat/lng
    let lat = location.lat;
    let lng = location.lng;

    if (formData.pinCode && formData.pinCode.length === 6) {
      const res = await lookupPinCode(formData.pinCode);
      if (res.success && res.lat && res.lng) {
        lat = res.lat;
        lng = res.lng;
      }
    }

    await setManualAddress({
      ...formData,
      lat,
      lng,
    });

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 my-8 shadow-2xl border border-purple-100 space-y-5 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#7C5CFC] flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5 text-[#7C5CFC]" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 font-serif">
                Enter Address Manually
              </h3>
              <p className="text-xs text-slate-500">
                Provide location details to calculate nearby hospitals and travel times.
              </p>
            </div>
          </div>

          <button
            onClick={closeManualModal}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PIN Code Auto-Detection Banner */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3.5 rounded-2xl border border-purple-100 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-[#7C5CFC]" />
              PIN Code (6 Digits)
            </label>
            {isPinDetecting && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-[#7C5CFC] animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" /> Detecting...
              </span>
            )}
          </div>

          <input
            type="text"
            maxLength={6}
            value={formData.pinCode}
            onChange={(e) => setFormData({ ...formData, pinCode: e.target.value.replace(/\D/g, "") })}
            placeholder="e.g. 422103"
            className="w-full bg-white border border-purple-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#7C5CFC] tracking-wider font-mono shadow-xs"
            required
          />

          {pinStatusMsg && (
            <p className={`text-xs font-semibold ${pinStatusMsg.startsWith("✓") ? "text-emerald-700" : "text-purple-700"}`}>
              {pinStatusMsg}
            </p>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* House No & Street */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">House / Flat / Plot No.</label>
              <input
                type="text"
                value={formData.houseNo}
                onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                placeholder="e.g. House No. 42"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Street / Road / Landmark</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="e.g. Station Road"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Area & Locality */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Area / Colony / Locality</label>
            <input
              type="text"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              placeholder="e.g. Central Market"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500"
            />
            {areaSuggestions.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                <span className="text-[10px] text-slate-500 font-semibold">Suggested Areas:</span>
                {areaSuggestions.slice(0, 4).map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setFormData({ ...formData, area })}
                    className="text-[10px] bg-purple-50 text-[#7C5CFC] hover:bg-purple-100 px-2 py-0.5 rounded-full font-bold cursor-pointer transition-colors"
                  >
                    + {area}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Village/City & Taluka */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Village / City *</label>
              <input
                type="text"
                value={formData.villageCity}
                onChange={(e) => setFormData({ ...formData, villageCity: e.target.value })}
                placeholder="e.g. Sinnar"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Taluka</label>
              <input
                type="text"
                value={formData.taluka}
                onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                placeholder="e.g. Sinnar"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* District & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">District *</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="e.g. Nashik"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">State *</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g. Maharashtra"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="India"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-600"
              readOnly
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] hover:from-[#6949F2] hover:to-[#5635E0] text-white font-black text-sm shadow-md shadow-[#7C5CFC]/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Updating Address...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Update Address</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
