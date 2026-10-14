import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { HospitalProfile } from "../../types";
import { calculateRoadDistanceAndEta, getGoogleMapsDirectionsUrl } from "../../utils/location";
import { MapPin, Navigation, Calendar, Bed, Star, Layers, RefreshCw, Sparkles, Phone, ExternalLink } from "lucide-react";

interface LiveHospitalMapProps {
  userLat: number;
  userLng: number;
  userAddress: string;
  hospitals: HospitalProfile[];
  onSelectHospital?: (hospital: HospitalProfile) => void;
  onBookAppointment?: (hospital: HospitalProfile) => void;
}

export const LiveHospitalMap: React.FC<LiveHospitalMapProps> = ({
  userLat,
  userLng,
  userAddress,
  hospitals,
  onSelectHospital,
  onBookAppointment,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [selectedHosp, setSelectedHosp] = useState<HospitalProfile | null>(null);

  // Initialize or update Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create map
      const map = L.map(mapContainerRef.current, {
        center: [userLat, userLng],
        zoom: 13,
        zoomControl: false,
      });

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Add Zoom Control at bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;

    if (!map || !markersGroup) return;

    // Clear previous markers
    markersGroup.clearLayers();

    // 1. Add User Location Pulse Marker (Blue)
    const userDivIcon = L.divIcon({
      className: "custom-user-marker",
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
          <div class="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-extrabold">
            📍
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const userMarker = L.marker([userLat, userLng], { icon: userDivIcon }).addTo(markersGroup);
    userMarker.bindPopup(`
      <div class="p-1 font-sans">
        <span class="text-[10px] font-black uppercase text-blue-600 tracking-wider">You Are Here</span>
        <h5 class="text-xs font-bold text-slate-900 mt-0.5">${userAddress}</h5>
        <p class="text-[10px] text-slate-500 font-mono mt-0.5">${userLat.toFixed(4)}, ${userLng.toFixed(4)}</p>
      </div>
    `);

    // 2. Add Red Markers for Verified Hospitals
    const bounds = L.latLngBounds([[userLat, userLng]]);

    hospitals.forEach((hosp) => {
      const hLat = typeof hosp.lat === "number" && !isNaN(hosp.lat) && hosp.lat !== 0 ? hosp.lat : 19.5761;
      const hLng = typeof hosp.lng === "number" && !isNaN(hosp.lng) && hosp.lng !== 0 ? hosp.lng : 74.2072;

      const calc = calculateRoadDistanceAndEta({ lat: userLat, lng: userLng }, { lat: hLat, lng: hLng });

      bounds.extend([hLat, hLng]);

      const hospDivIcon = L.divIcon({
        className: "custom-hosp-marker",
        html: `
          <div class="relative group cursor-pointer">
            <div class="w-9 h-9 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg border-2 border-white flex items-center justify-center font-extrabold text-sm transition-transform group-hover:scale-110">
              🏥
            </div>
            <div class="absolute -top-2 -right-2 bg-[#23125E] text-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-amber-300/40 shadow-xs whitespace-nowrap">
              ${calc.distanceKm} km
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([hLat, hLng], { icon: hospDivIcon }).addTo(markersGroup);

      marker.on("click", () => {
        setSelectedHosp(hosp);
        if (onSelectHospital) onSelectHospital(hosp);
      });
    });

    // Set map view bounds to encompass user & nearby hospitals
    if (hospitals.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else {
      map.setView([userLat, userLng], 13);
    }
  }, [userLat, userLng, hospitals, userAddress]);

  const recenterMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLat, userLng], 14, { animate: true });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-purple-100 shadow-lg overflow-hidden relative space-y-0">
      {/* Map Bar Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-[#23125E] text-white p-3.5 px-5 flex items-center justify-between gap-3 border-b border-purple-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20">
            <Navigation className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs sm:text-sm text-white font-serif">
              Live Interactive Healthcare Map
            </h4>
            <p className="text-[10px] text-purple-200">
              Showing {hospitals.length} verified hospitals relative to your location
            </p>
          </div>
        </div>

        <button
          onClick={recenterMap}
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
          Recenter On Me
        </button>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="relative w-full h-[360px] sm:h-[420px] bg-slate-100 z-10">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Selected Hospital Info Floating Card Overlay */}
        {selectedHosp && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[400] bg-white/95 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-purple-200 space-y-3 animate-fade-in">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <img
                  src={selectedHosp.logoUrl || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=100&q=80"}
                  alt={selectedHosp.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-purple-200 shrink-0"
                />
                <div>
                  <h5 className="font-extrabold text-sm text-slate-900 font-serif leading-tight">
                    {selectedHosp.name}
                  </h5>
                  <p className="text-[11px] text-slate-500">{selectedHosp.city}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-amber-500 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{selectedHosp.rating || 4.8} / 5.0</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedHosp(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Distance & Driving Time */}
            {(() => {
              const hLat = selectedHosp.lat || userLat + 0.02;
              const hLng = selectedHosp.lng || userLng + 0.02;
              const res = calculateRoadDistanceAndEta({ lat: userLat, lng: userLng }, { lat: hLat, lng: hLng });
              const dirUrl = getGoogleMapsDirectionsUrl(userLat, userLng, hLat, hLng, selectedHosp.address);

              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-extrabold">
                    <div className="p-2 bg-purple-50 text-[#7C5CFC] rounded-xl border border-purple-100">
                      📍 {res.distanceKm} km away
                    </div>
                    <div className="p-2 bg-amber-50 text-amber-900 rounded-xl border border-amber-200">
                      🚗 ~{res.etaMins} mins drive
                    </div>
                  </div>

                  {/* Bed status */}
                  <div className="flex items-center justify-between text-[11px] p-2 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-slate-600 font-bold flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-purple-600" /> Available Beds:
                    </span>
                    <span className="font-black text-emerald-700">
                      ICU: {selectedHosp.beds.icuAvailable} | General: {selectedHosp.beds.generalAvailable}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={dirUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                      Get Directions
                    </a>

                    <button
                      onClick={() => {
                        if (onBookAppointment) onBookAppointment(selectedHosp);
                        if (onSelectHospital) onSelectHospital(selectedHosp);
                      }}
                      className="py-2 px-3 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6848F0] hover:from-[#6949F2] hover:to-[#5635E0] text-white text-xs font-extrabold text-center flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Book Now
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
