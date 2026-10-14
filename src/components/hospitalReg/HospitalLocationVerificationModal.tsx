import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { geocodeHospitalAddress } from "../../utils/location";
import {
  MapPin,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Compass,
  RefreshCw,
  X,
  Building2,
  Check,
  Search,
} from "lucide-react";

interface HospitalLocationVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifyLocation: (data: {
    lat: number;
    lng: number;
    accuracy: number;
    address: string;
    city: string;
    district: string;
    state: string;
    pinCode: string;
    isVerified: boolean;
  }) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  initialCity?: string;
  initialState?: string;
  initialPinCode?: string;
}

export const HospitalLocationVerificationModal: React.FC<HospitalLocationVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerifyLocation,
  initialLat,
  initialLng,
  initialAddress = "",
  initialCity = "",
  initialState = "Maharashtra",
  initialPinCode = "",
}) => {
  const [lat, setLat] = useState<number>(initialLat || 0);
  const [lng, setLng] = useState<number>(initialLng || 0);
  const [accuracy, setAccuracy] = useState<number>(8); // in meters
  const [address, setAddress] = useState<string>(initialAddress);
  const [city, setCity] = useState<string>(initialCity);
  const [district, setDistrict] = useState<string>("");
  const [stateName, setStateName] = useState<string>(initialState);
  const [pinCode, setPinCode] = useState<string>(initialPinCode);

  const [mode, setMode] = useState<"initial" | "gps" | "manual" | "map">("initial");
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(Boolean(initialLat && initialLng));
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (isOpen && mode === "initial") {
      if (initialLat && initialLng) {
        setLat(initialLat);
        setLng(initialLng);
        setIsVerified(true);
      }
      setAddress(initialAddress);
      setCity(initialCity);
      setStateName(initialState);
      setPinCode(initialPinCode);
    }
  }, [isOpen, initialLat, initialLng]);

  // Leaflet map initialization
  useEffect(() => {
    if (!mapRef.current || (mode !== "gps" && mode !== "map")) return;

    const mapLat = lat && !isNaN(lat) && lat !== 0 ? lat : 19.8451;
    const mapLng = lng && !isNaN(lng) && lng !== 0 ? lng : 73.9961;

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [mapLat, mapLng],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const customIcon = L.divIcon({
        className: "custom-hosp-pin",
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] text-white shadow-xl border-2 border-white flex items-center justify-center font-extrabold text-lg animate-bounce">
              🏥
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([lat, lng], { draggable: true, icon: customIcon }).addTo(map);

      marker.on("dragend", async (e: any) => {
        const position = e.target.getLatLng();
        setLat(position.lat);
        setLng(position.lng);
        setIsVerified(true);
        reverseGeocode(position.lat, position.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      mapInstanceRef.current.setView([lat, lng], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
    }
  }, [mode, lat, lng]);

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const addr = data.display_name || "";
          const c = data.address.city || data.address.town || data.address.village || data.address.suburb || city;
          const dist = data.address.state_district || data.address.county || district;
          const st = data.address.state || stateName;
          const pc = data.address.postcode || pinCode;

          setAddress(addr);
          setCity(c);
          setDistrict(dist);
          setStateName(st);
          if (pc) setPinCode(pc);
        }
      }
    } catch (e) {
      console.warn("Reverse geocode warning:", e);
    }
  };

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setStatusMessage(null);

    if (!navigator.geolocation) {
      setStatusMessage("Geolocation is not supported by your browser. Please enter address manually.");
      setIsLocating(false);
      setMode("manual");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy || 10);

        setLat(latitude);
        setLng(longitude);
        setAccuracy(acc);
        setIsVerified(true);
        setIsLocating(false);
        setMode("gps");

        reverseGeocode(latitude, longitude);
      },
      (err) => {
        console.warn("GPS fetch error:", err);
        setIsLocating(false);
        setStatusMessage("Could not retrieve GPS location automatically. Please enter hospital address manually.");
        setMode("manual");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);

  const handleGeocodeAddress = async () => {
    if (!address && !city && !pinCode) {
      setStatusMessage("Please enter Street Address, PIN Code, or City first to verify on Google Maps.");
      return;
    }
    setIsGeocoding(true);
    setStatusMessage(null);

    try {
      const res = await geocodeHospitalAddress({
        address,
        city,
        district,
        state: stateName,
        pinCode,
      });

      setIsGeocoding(false);

      if (res && res.lat && res.lng && !isNaN(res.lat) && !isNaN(res.lng) && res.lat !== 0 && res.lng !== 0) {
        setLat(res.lat);
        setLng(res.lng);
        setIsVerified(true);
        setMode("map");
        setStatusMessage(`✓ Address verified on Google Maps: ${res.displayName}`);
      } else {
        setStatusMessage("⚠️ Could not find exact address on Google Maps. Please check the PIN code or select the location on the map.");
      }
    } catch (e) {
      setIsGeocoding(false);
      setStatusMessage("⚠️ Geocoding request failed. Please check internet connection or select location on map.");
    }
  };

  const handlePinCodeChange = async (val: string) => {
    setPinCode(val);
    if (val.length === 6 && /^\d+$/.test(val)) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data[0] && data[0].Status === "Success") {
            const details = data[0].PostOffice[0];
            if (details) {
              setCity(details.District || details.Name);
              setDistrict(details.District);
              setStateName(details.State);
            }
          }
        }
      } catch (err) {
        console.warn("Pincode lookup notice:", err);
      }
    }
  };

  const handleConfirm = () => {
    if (!lat || !lng || isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      alert("⚠️ Hospital location has not been verified yet. Please click 'Verify Address with Google Maps' or 'Use Current Hospital Location'.");
      return;
    }
    onVerifyLocation({
      lat,
      lng,
      accuracy,
      address: address || `${city}, ${stateName}`,
      city,
      district,
      state: stateName,
      pinCode,
      isVerified: true,
    });
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-purple-200 relative space-y-0 max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-[#23125E] p-5 text-white flex items-center justify-between border-b border-purple-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20">
              <MapPin className="w-5 h-5 text-amber-300 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                Hospital Verification Required
              </span>
              <h3 className="font-extrabold text-base font-serif text-white">
                📍 Verify Hospital Location
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
          <p className="text-xs text-slate-600 leading-relaxed font-medium bg-purple-50 p-3.5 rounded-2xl border border-purple-100">
            Jeevan Setu requires your hospital's exact location to provide accurate distance calculations, emergency navigation, and verified hospital listings for patients.
          </p>

          {/* Initial Mode Choice */}
          {mode === "initial" && (
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => setMode("manual")}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] hover:from-[#6949F2] hover:to-[#5635E0] text-white font-extrabold text-sm flex items-center justify-center gap-3 shadow-lg shadow-[#7C5CFC]/20 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <Search className="w-5 h-5 text-amber-300" />
                Verify Address with Google Maps
              </button>

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="w-full p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-2 border border-slate-200 transition-all cursor-pointer"
              >
                {isLocating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                    Fetching Device GPS Location...
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 text-purple-600" />
                    Use Device GPS Location
                  </>
                )}
              </button>
            </div>
          )}

          {/* Notice Status Banner if any */}
          {statusMessage && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-purple-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* GPS / Google Maps Verified Status Display */}
          {isVerified && lat !== 0 && lng !== 0 && !isNaN(lat) && !isNaN(lng) ? (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-emerald-800 font-extrabold text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>✓ Hospital Location Verified</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md font-mono font-bold">
                  Google Maps Match
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-emerald-100 text-center font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Latitude</span>
                  <span className="font-extrabold text-slate-900">{lat.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Longitude</span>
                  <span className="font-extrabold text-slate-900">{lng.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Match Quality</span>
                  <span className="font-extrabold text-emerald-700">Verified GPS</span>
                </div>
              </div>

              {address && (
                <p className="text-[11px] text-slate-600 font-medium">
                  <strong>Matched Address:</strong> {address}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-900 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>⚠️ Location pending. Enter hospital address below and click <strong>'Verify with Google Maps'</strong> to fetch exact GPS coordinates.</span>
            </div>
          )}

          {/* Interactive Map Picker Canvas */}
          {(mode === "gps" || mode === "map") && lat !== 0 && lng !== 0 && !isNaN(lat) && !isNaN(lng) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Interactive Map (Drag marker to adjust hospital gate)</span>
                <span className="text-[10px] text-purple-600 font-mono">
                  {lat.toFixed(4)}, {lng.toFixed(4)}
                </span>
              </div>

              <div ref={mapRef} className="w-full h-48 rounded-2xl border border-purple-200 overflow-hidden shadow-inner" />
            </div>
          )}

          {/* Manual Address Form Mode */}
          {mode === "manual" && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Street / Building Address *</label>
                <input
                  type="text"
                  placeholder="e.g. Plot No 12, FC Road, Shivajinagar"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="411001"
                    value={pinCode}
                    onChange={(e) => handlePinCodeChange(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">City / Taluka *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">District *</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleGeocodeAddress}
                disabled={isGeocoding}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all mt-2"
              >
                {isGeocoding ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    Finding Address on Google Maps...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-amber-300" />
                    📍 Verify Address with Google Maps
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setMode("map")}
                  className="text-xs font-extrabold text-[#7C5CFC] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" /> Refine Location on Interactive Map
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {mode !== "initial" && (
            <button
              type="button"
              onClick={() => setMode("initial")}
              className="text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              ← Back
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] hover:from-[#6949F2] text-white text-xs font-extrabold shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Verified Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
