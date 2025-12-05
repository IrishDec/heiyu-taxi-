"use client";

import { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY!;

export default function PassengerPage() {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // Init Map
  useEffect(() => {
    const m = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-6.2603, 53.3498],
      zoom: 12,
    });

    setMap(m);
  }, []);

  // Refresh Location (GPS)
  const refreshLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLng = pos.coords.longitude;
        const newLat = pos.coords.latitude;

        setLat(newLat);
        setLng(newLng);

        if (map) {
          map.flyTo({ center: [newLng, newLat], zoom: 15 });

          if (marker) {
            marker.setLngLat([newLng, newLat]);
          } else {
            const mk = new mapboxgl.Marker({ color: "#1E90FF" })
              .setLngLat([newLng, newLat])
              .addTo(map);
            setMarker(mk);
          }
        }

        setLocationConfirmed(true);
      },
      () => alert("Unable to get location"),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="w-full h-screen relative">
      {/* MAP */}
      <div id="map" className="w-full h-full" />

      {/* TOP BAR */}
      <div className="absolute top-0 w-full p-4 bg-white/80 backdrop-blur shadow z-10">
        <h1 className="text-xl font-bold">Heiyu Taxi</h1>
        <p className="text-sm text-gray-600">Find a driver near you</p>
      </div>

      {/* REFRESH BUTTON */}
      <button
        onClick={refreshLocation}
        className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-lg px-8 py-4 rounded-full shadow-xl z-10"
      >
        Refresh Location
      </button>

      {/* 🔥 SLIDE-UP BOTTOM SHEET */}
      <div
        className={`absolute bottom-0 left-0 w-full bg-white shadow-2xl rounded-t-2xl p-6 transition-transform duration-300 ${
          locationConfirmed ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ minHeight: "180px" }}
      >
        {/* Sheet Title */}
        <h2 className="text-xl font-semibold mb-2">Pickup Confirmed</h2>

        {/* Coordinates or short message */}
        <p className="text-gray-700 mb-4">
          Your location has been detected.
        </p>

        {/* Request Button */}
        <button className="w-full bg-black text-white py-4 rounded-xl text-lg shadow-md">
          Request Taxi
        </button>
      </div>
    </div>
  );
}

