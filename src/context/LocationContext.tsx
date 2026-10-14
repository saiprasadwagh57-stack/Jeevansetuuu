import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { reverseGeocodeAddress } from "../utils/location";

export interface UserLocation {
  houseNo: string;
  street: string;
  area: string;
  villageCity: string;
  taluka: string;
  district: string;
  state: string;
  country: string;
  pinCode: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  lastUpdated: string;
  isGps: boolean;
}

export type PermissionStatus = "prompt" | "granted" | "denied";

interface LocationContextType {
  location: UserLocation;
  permissionStatus: PermissionStatus;
  isGpsActive: boolean;
  isLocating: boolean;
  locationError: string | null;
  
  // Modal visibility states
  permissionModalOpen: boolean;
  manualModalOpen: boolean;
  changeLocationModalOpen: boolean;
  
  // Actions
  requestGpsLocation: () => Promise<boolean>;
  setManualAddress: (addressData: Partial<UserLocation>) => Promise<void>;
  lookupPinCode: (pinCode: string) => Promise<{
    success: boolean;
    villageCity?: string;
    district?: string;
    state?: string;
    country?: string;
    lat?: number;
    lng?: number;
    areaOptions?: string[];
    error?: string;
  }>;
  
  // Modal toggles
  openPermissionModal: () => void;
  closePermissionModal: () => void;
  openManualModal: () => void;
  closeManualModal: () => void;
  openChangeLocationModal: () => void;
  closeChangeLocationModal: () => void;
}

// Default fallback location (Sinnar, Nashik, Maharashtra 422103)
const DEFAULT_LOCATION: UserLocation = {
  houseNo: "Plot 12",
  street: "Station Road",
  area: "Central Market",
  villageCity: "Sinnar",
  taluka: "Sinnar",
  district: "Nashik",
  state: "Maharashtra",
  country: "India",
  pinCode: "422103",
  formattedAddress: "Sinnar, Nashik, Maharashtra - 422103",
  lat: 19.8451,
  lng: 73.9961,
  lastUpdated: "Just Now",
  isGps: false,
};

const STORAGE_KEY_LOC = "jeevan_setu_user_location_v3";
const STORAGE_KEY_PERM = "jeevan_setu_location_perm_choice";

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<UserLocation>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LOC);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved location", e);
      }
    }
    return DEFAULT_LOCATION;
  });

  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>("prompt");
  const [isGpsActive, setIsGpsActive] = useState<boolean>(() => location.isGps);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Modals
  const [permissionModalOpen, setPermissionModalOpen] = useState<boolean>(false);
  const [manualModalOpen, setManualModalOpen] = useState<boolean>(false);
  const [changeLocationModalOpen, setChangeLocationModalOpen] = useState<boolean>(false);

  const watchIdRef = useRef<number | null>(null);

  // Check initial permission choice on mount
  useEffect(() => {
    const permChoice = localStorage.getItem(STORAGE_KEY_PERM);
    if (!permChoice) {
      // First time visitor -> show Allow Location Permission popup after brief delay
      const timer = setTimeout(() => {
        setPermissionModalOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    } else if (permChoice === "granted") {
      setPermissionStatus("granted");
      // Auto reconnect watch position
      startGpsTracking();
    } else if (permChoice === "denied") {
      setPermissionStatus("denied");
    }
  }, []);

  // Save location to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOC, JSON.stringify(location));
  }, [location]);

  // Clean up geolocation watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Helper to format date string
  const getNowFormatted = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  // Process raw latitude & longitude into full address components
  const processCoordinatesToLocation = async (lat: number, lng: number, isWatch = false) => {
    try {
      // Reverse geocode via OpenStreetMap Nominatim
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "User-Agent": "JeevanSetuHealthcare/1.0" } }
      );

      let villageCity = "Sinnar";
      let district = "Nashik";
      let state = "Maharashtra";
      let country = "India";
      let pinCode = "422103";
      let area = "";
      let road = "";

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};

        villageCity = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || "Sinnar";
        district = addr.county || addr.state_district || addr.district || "Nashik";
        state = addr.state || "Maharashtra";
        country = addr.country || "India";
        pinCode = addr.postcode || "422103";
        area = addr.neighbourhood || addr.suburb || addr.residential || "";
        road = addr.road || addr.street || "";
      }

      const formatted = `${villageCity}${district ? `, ${district}` : ""}${state ? `, ${state}` : ""} - ${pinCode}`;

      setLocation((prev) => ({
        ...prev,
        villageCity,
        district,
        state,
        country,
        pinCode,
        area: area || prev.area || "",
        street: road || prev.street || "",
        formattedAddress: formatted,
        lat,
        lng,
        lastUpdated: getNowFormatted(),
        isGps: true,
      }));

      setIsGpsActive(true);
      setLocationError(null);
    } catch (err) {
      console.warn("Reverse geocode failed, using lat/lng", err);
      setLocation((prev) => ({
        ...prev,
        lat,
        lng,
        lastUpdated: getNowFormatted(),
        formattedAddress: prev.formattedAddress || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        isGps: true,
      }));
    }
  };

  // Start real-time GPS tracking with watchPosition
  const startGpsTracking = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setPermissionStatus("denied");
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        processCoordinatesToLocation(latitude, longitude, true);
        setIsGpsActive(true);
        setPermissionStatus("granted");
        setIsLocating(false);
      },
      (err) => {
        console.warn("watchPosition notice:", err?.message || err);
        setIsLocating(false);
        setIsGpsActive(false);
        if (err?.code === 1) { // PERMISSION_DENIED
          setPermissionStatus("denied");
          setLocationError("Location permission restricted in browser. Please enter your address or PIN code manually.");
          localStorage.setItem(STORAGE_KEY_PERM, "denied");
        } else {
          setLocationError("Unable to retrieve real-time GPS location. Using manual address.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  // Request GPS location on button click ("Allow Location")
  const requestGpsLocation = async (): Promise<boolean> => {
    setIsLocating(true);
    setLocationError(null);

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by your browser.");
        setIsLocating(false);
        setPermissionStatus("denied");
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          await processCoordinatesToLocation(latitude, longitude, false);
          setPermissionStatus("granted");
          setIsGpsActive(true);
          setIsLocating(false);
          setPermissionModalOpen(false);
          setChangeLocationModalOpen(false);
          localStorage.setItem(STORAGE_KEY_PERM, "granted");

          // Start continuous watch
          startGpsTracking();
          resolve(true);
        },
        (err) => {
          console.warn("getCurrentPosition notice:", err?.message || err);
          setIsLocating(false);
          setIsGpsActive(false);
          setPermissionStatus("denied");
          setPermissionModalOpen(false);
          localStorage.setItem(STORAGE_KEY_PERM, "denied");

          if (err?.code === 1) { // PERMISSION_DENIED
            setLocationError("Location permission restricted in browser. Please enter your address or PIN code manually.");
          } else {
            setLocationError("GPS signal unavailable or timed out. Switched to manual address entry.");
          }
          setManualModalOpen(true); // Automatically open manual entry modal for seamless fallback
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    });
  };

  // Lookup Indian Postal PIN Code automatically
  const lookupPinCode = async (pinCode: string) => {
    const cleanPin = pinCode.trim();
    if (cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
      return { success: false, error: "Please enter a valid 6-digit PIN code." };
    }

    try {
      // 1. Fetch Indian Postal PIN API
      const postalRes = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
      if (postalRes.ok) {
        const data = await postalRes.json();
        if (Array.isArray(data) && data[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
          const poList = data[0].PostOffice;
          const sample = poList[0];

          const villageCity = sample.Block !== "NA" ? sample.Block : sample.Division || sample.Name || "Sinnar";
          const district = sample.District || "Nashik";
          const state = sample.State || "Maharashtra";
          const country = sample.Country || "India";
          const areaOptions = poList.map((p: any) => p.Name).filter(Boolean);

          // 2. Geocode the PIN Code to get approximate Lat & Lng
          let lat = 19.8451;
          let lng = 73.9961;

          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&postalcode=${cleanPin}&country=India&limit=1`,
              { headers: { "User-Agent": "JeevanSetuHealthcare/1.0" } }
            );
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              if (geoData.length > 0) {
                lat = parseFloat(geoData[0].lat);
                lng = parseFloat(geoData[0].lon);
              }
            }
          } catch (e) {
            console.warn("Geocode for pincode failed, using district coordinates", e);
          }

          return {
            success: true,
            villageCity,
            district,
            state,
            country,
            lat,
            lng,
            areaOptions,
          };
        }
      }

      // Fallback: search via Nominatim
      const nominatimRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanPin + ", India")}&limit=1`,
        { headers: { "User-Agent": "JeevanSetuHealthcare/1.0" } }
      );
      if (nominatimRes.ok) {
        const nominData = await nominatimRes.json();
        if (nominData.length > 0) {
          return {
            success: true,
            villageCity: "Sinnar",
            district: "Nashik",
            state: "Maharashtra",
            country: "India",
            lat: parseFloat(nominData[0].lat),
            lng: parseFloat(nominData[0].lon),
          };
        }
      }

      return { success: false, error: "PIN code not found. Please verify digits." };
    } catch (err) {
      console.error("PIN lookup error:", err);
      return { success: false, error: "Network error during PIN validation." };
    }
  };

  // Set manual address
  const setManualAddress = async (addressData: Partial<UserLocation>) => {
    // Stop active watchPosition if any
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    let targetLat = addressData.lat;
    let targetLng = addressData.lng;

    // If explicit coordinates not provided or (0,0), geocode full address query
    if (!targetLat || !targetLng || (targetLat === 0 && targetLng === 0)) {
      const fullQuery = [
        addressData.area,
        addressData.villageCity,
        addressData.district,
        addressData.state,
        "India",
      ].filter(Boolean).join(", ");

      try {
        const geoResults = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&limit=1`,
          { headers: { "User-Agent": "JeevanSetuHealthcare/1.0" } }
        );
        if (geoResults.ok) {
          const data = await geoResults.json();
          if (data && data.length > 0) {
            targetLat = parseFloat(data[0].lat);
            targetLng = parseFloat(data[0].lon);
          }
        }
      } catch (e) {
        console.warn("Manual address geocoding failed", e);
      }
    }

    // Fallback if still missing or invalid
    if (!targetLat || isNaN(targetLat)) targetLat = location.lat || 19.8451;
    if (!targetLng || isNaN(targetLng)) targetLng = location.lng || 73.9961;

    // Build formatted string
    const parts = [
      addressData.houseNo,
      addressData.street,
      addressData.area,
      addressData.villageCity,
      addressData.district,
      addressData.state,
    ].filter(Boolean);

    const formatted = parts.length > 0
      ? `${parts.join(", ")} - ${addressData.pinCode || location.pinCode}`
      : `${addressData.villageCity || "Sinnar"}, ${addressData.district || "Nashik"}, ${addressData.state || "Maharashtra"} - ${addressData.pinCode || "422103"}`;

    const updatedLocation: UserLocation = {
      ...location,
      ...addressData,
      formattedAddress: formatted,
      lat: targetLat,
      lng: targetLng,
      lastUpdated: getNowFormatted(),
      isGps: false,
    };

    setLocation(updatedLocation);
    setIsGpsActive(false);
    setLocationError(null);
    setManualModalOpen(false);
    setChangeLocationModalOpen(false);
    localStorage.setItem(STORAGE_KEY_PERM, "manual");
  };

  const openPermissionModal = () => setPermissionModalOpen(true);
  const closePermissionModal = () => setPermissionModalOpen(false);

  const openManualModal = () => {
    setPermissionModalOpen(false);
    setChangeLocationModalOpen(false);
    setManualModalOpen(true);
  };
  const closeManualModal = () => setManualModalOpen(false);

  const openChangeLocationModal = () => setChangeLocationModalOpen(true);
  const closeChangeLocationModal = () => setChangeLocationModalOpen(false);

  return (
    <LocationContext.Provider
      value={{
        location,
        permissionStatus,
        isGpsActive,
        isLocating,
        locationError,
        permissionModalOpen,
        manualModalOpen,
        changeLocationModalOpen,
        requestGpsLocation,
        setManualAddress,
        lookupPinCode,
        openPermissionModal,
        closePermissionModal,
        openManualModal,
        closeManualModal,
        openChangeLocationModal,
        closeChangeLocationModal,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
