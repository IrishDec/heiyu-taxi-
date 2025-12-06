"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY!;

export default function PassengerPage() {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // Init Map
  useEffect(() => {
    const m = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-6.2603, 53.3498],
      zoom: 13,
      attributionControl: false, // We add custom attribution below
    });

    // Add tiny attribution legally
    m.addControl(
      new mapboxgl.AttributionControl({
        compact: true,
        customAttribution:
          '<span style="font-size:10px; opacity:0.6;">© Mapbox © OpenStreetMap</span>',
      }),
      "bottom-left"
    );

    setMap(m);
  }, []);

  // Refresh location
  const refreshLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLng = pos.coords.longitude;
        const newLat = pos.coords.latitude;

        setLat(newLat);
        setLng(newLng);

        if (map) {
          map.flyTo({ center: [newLng, newLat], zoom: 15 });
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

      {/* MESSAGE CENTERED OVER MAP */}
      {!locationConfirmed && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl text-gray-900 text-center shadow-lg z-20">
          Refresh your location to request a taxi
        </div>
      )}

      {/* CENTER PIN */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10">
        <Image src="/pin.png" width={44} height={44} alt="pickup pin" />
      </div>

      {/* TOP BAR */}
      <div className="absolute top-0 w-full p-4 bg-white shadow-md z-20 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Heiyu Taxi</h1>
          <p className="text-sm text-gray-600">Find a driver near you</p>
        </div>

        {/* Refresh button */}
        <button
          onClick={refreshLocation}
          className="bg-blue-600 text-white px-4 py-2 rounded-full shadow"
        >
          Refresh
        </button>
      </div>

      {/* BOTTOM SHEET */}
      <div
        className={`absolute bottom-0 left-0 w-full bg-white shadow-xl rounded-t-2xl p-6 transition-transform duration-300 ${
          locationConfirmed ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ minHeight: "180px" }}
      >
        <h2 className="text-xl font-semibold mb-2">Pickup Confirmed</h2>
        <p className="text-gray-700 mb-4">Your location has been detected.</p>

        <button className="w-full bg-black text-white py-4 rounded-xl text-lg shadow-md">
          Request Taxi
        </button>
      </div>

      {/* FOOTER BRANDING */}
      <div className="absolute bottom-2 w-full text-center text-xs text-gray-500">
        <a
          href="https://www.heiyudigital.com"
          className="hover:text-gray-700 underline"
          target="_blank"
        >
          Built by HeiyuDigital
        </a>
      </div>
    </div>
  );
}
