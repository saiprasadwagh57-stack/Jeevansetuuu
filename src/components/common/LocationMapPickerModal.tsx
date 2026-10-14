import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  X,
  MapPin,
  Search,
  Navigation,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Compass,
  Building2,
} from "lucide-react";
import {
  parseGoogleMapsUrl,
  reverseGeocodeAddress,
  searchAddressGeocode,
} from "../../utils/location";

// Fix default Leaflet icon paths in Vite bundlers
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationMapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLocation: (locationData: {
    address: string;
    lat: number;
    lng: number;
    googleMapsUrl?: string;
  }) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  title?: string;
}

export const LocationMapPickerModal: React.FC<LocationMapPickerModalProps> = ({
  isOpen,
  onClose,
  onConfirmLocation,
  initialLat,
  initialLng,
  initialAddress = "",
  title = "Select Location on Google Map",
}) => {
  const [selectedLat, setSelectedLat] = useState<number>(initialLat || 19.8451);
  const [selectedLng, setSelectedLng] = useState<number>(initialLng || 73.9961);
  const [formattedAddress, setFormattedAddress] = useState<string>(initialAddress);
  const [googleMapsUrlInput, setGoogleMapsUrlInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Array<{ lat: number; lng: number; displayName: string }>>([]);

  const [isGeolocating, setIsGeolocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize and mount Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const lat = selectedLat || 19.8451;
    const lng = selectedLng || 73.9961;

    const map = L.map(mapContainerRef.current).setView([lat, lng], 14);
    mapInstanceRef.current = map;

    // Add OpenStreetMap Tile Layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Add Draggable Marker
    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    markerRef.current = marker;

    // Handle marker drag end
    marker.on("dragend", async () => {
      const position = marker.getLatLng();
      updateSelectedLocation(position.lat, position.lng);
    });

    // Handle map click
    map.on("click", async (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      updateSelectedLocation(e.latlng.lat, e.latlng.lng);
    });

    // Timeout trigger for size recalculation in modal container
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Update position programmatically
  const updateSelectedLocation = async (lat: number, lng: number, customAddress?: string) => {
    setSelectedLat(lat);
    setSelectedLng(lng);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15);
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }

    if (customAddress) {
      setFormattedAddress(customAddress);
    } else {
      setIsGeocoding(true);
      const addr = await reverseGeocodeAddress(lat, lng);
      setFormattedAddress(addr);
      setIsGeocoding(false);
    }
  };

  // Option 1: Current GPS location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatusMessage("Geolocation is not supported by your browser.");
      return;
    }

    setIsGeolocating(true);
    setStatusMessage("Acquiring GPS location...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGeolocating(false);
        setStatusMessage("GPS location acquired successfully!");
        updateSelectedLocation(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setIsGeolocating(false);
        setStatusMessage("Could not retrieve GPS location. Please select manually on map.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Option 2: Parse Google Maps Share Link
  const handleParseGoogleMapsLink = () => {
    if (!googleMapsUrlInput.trim()) return;
    const parsed = parseGoogleMapsUrl(googleMapsUrlInput);
    if (parsed) {
      setStatusMessage("Extracted coordinates from Google Maps link!");
      updateSelectedLocation(parsed.lat, parsed.lng, parsed.address);
    } else {
      setStatusMessage("Could not parse coordinates from this link. Please check link format.");
    }
  };

  // Address Search Submit
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsGeocoding(true);
    setStatusMessage("Searching address...");
    const results = await searchAddressGeocode(searchQuery);
    setIsGeocoding(false);

    if (results.length > 0) {
      setSearchResults(results);
      const top = results[0];
      updateSelectedLocation(top.lat, top.lng, top.displayName);
      setStatusMessage(`Found ${results.length} location(s). Selected top match.`);
    } else {
      setStatusMessage("No matching address found. Try searching city or landmark.");
    }
  };

  const handleConfirm = () => {
    if (!formattedAddress.trim()) {
      setFormattedAddress(`Lat: ${selectedLat.toFixed(4)}, Lng: ${selectedLng.toFixed(4)}`);
    }

    const generatedMapsUrl =
      googleMapsUrlInput.trim() ||
      `https://www.google.com/maps?q=${selectedLat},${selectedLng}`;

    onConfirmLocation({
      address: formattedAddress || `Location (${selectedLat.toFixed(4)}, ${selectedLng.toFixed(4)})`,
      lat: selectedLat,
      lng: selectedLng,
      googleMapsUrl: generatedMapsUrl,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-purple-200 shadow-2xl rounded-3xl overflow-hidden my-4 space-y-0">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#23125E] to-[#3B1F8C] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#A892FF] border border-white/15">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-serif text-white">{title}</h3>
              <p className="text-[11px] text-purple-200">
                Pin your exact location on Google Maps for real-time distance calculations.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* SEARCH & GPS TOOLBAR */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="md:col-span-8 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search city, area, hospital name or landmark..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-9 text-xs focus:ring-2 focus:ring-[#7C5CFC] outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isGeocoding}
                className="bg-[#7C5CFC] hover:bg-[#6848F0] text-white text-xs font-bold px-3.5 py-2.5 rounded-xl cursor-pointer transition-all shrink-0"
              >
                Search
              </button>
            </form>

            {/* Current GPS Button */}
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isGeolocating}
              className="md:col-span-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Navigation className={`w-4 h-4 text-emerald-600 ${isGeolocating ? "animate-spin" : ""}`} />
              {isGeolocating ? "Locating..." : "Use Current GPS"}
            </button>
          </div>

          {/* FALLBACK: PASTE GOOGLE MAPS LINK */}
          <div className="bg-purple-50/70 border border-purple-100 p-3 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-purple-900">
              <span className="flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[#7C5CFC]" />
                Option 2: Paste Google Maps Share Link
              </span>
              <span className="text-[10px] text-purple-700 font-normal">e.g. maps.app.goo.gl/...</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={googleMapsUrlInput}
                onChange={(e) => setGoogleMapsUrlInput(e.target.value)}
                placeholder="Paste link e.g. https://maps.app.goo.gl/xyz or 18.5204, 73.8567"
                className="flex-1 bg-white border border-purple-200 rounded-xl p-2 text-xs focus:ring-2 focus:ring-[#7C5CFC] outline-none"
              />
              <button
                type="button"
                onClick={handleParseGoogleMapsLink}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3 py-2 rounded-xl cursor-pointer transition-all shrink-0"
              >
                Parse Link
              </button>
            </div>
          </div>

          {/* Status Alert Banner */}
          {statusMessage && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs p-2.5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{statusMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="text-blue-500 hover:text-blue-700 text-[10px] font-bold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* INTERACTIVE LEAFLET MAP CONTAINER */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
            <div ref={mapContainerRef} className="w-full h-[280px] z-10" />

            {/* Instruction Overlay Tag */}
            <div className="absolute top-3 right-3 z-20 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-md pointer-events-none">
              <Compass className="w-3.5 h-3.5 text-amber-400" /> Click or Drag Pin to Adjust Location
            </div>
          </div>

          {/* SELECTED LOCATION CONFIRMATION INFO */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#7C5CFC] shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Confirmed Location Address
                </span>
                <p className="text-xs font-bold text-slate-800 leading-relaxed">
                  {isGeocoding ? (
                    <span className="text-purple-600 italic">Fetching full address details...</span>
                  ) : (
                    formattedAddress || "Selected point on map"
                  )}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                  <span>Lat: {selectedLat.toFixed(5)}</span>
                  <span>Lng: {selectedLng.toFixed(5)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] hover:from-[#6949F2] hover:to-[#5635E0] text-white font-extrabold text-xs shadow-md shadow-[#7C5CFC]/25 cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" /> Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};
