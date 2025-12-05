"use client";

import { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY!;

export default function PassengerRequest() {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);

  // Init map
  useEffect(() => {
    const m = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-6.2603, 53.3498],
      zoom: 12,
    });

    setMap(m);
  }, []);

  const refreshLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lng = pos.coords.longitude;
        const lat = pos.coords.latitude;

        if (map) {
          map.flyTo({ center: [lng, lat], zoom: 15 });

          if (marker) {
            marker.setLngLat([lng, lat]);
          } else {
            const mk = new mapboxgl.Marker({ color: "#1E90FF" })
              .setLngLat([lng, lat])
              .addTo(map);
            setMarker(mk);
          }
        }

        setLocationConfirmed(true);
      },
      () => alert("Could not get location"),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="w-full h-screen relative">
      {/* MAP */}
      <div id="map" className="w-full h-full" />

      {/* TOP BAR */}
      <div className="absolute top-0 w-full p-4 bg-white/80 backdrop-blur shadow">
        <h1 className="text-xl font-bold">Heiyu Taxi</h1>
      </div>

      {/* REFRESH LOCATION */}
      <button
        onClick={refreshLocation}
        className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-4 rounded-full shadow-xl text-lg"
      >
        Refresh Location
      </button>

      {/* REQUEST TAXI — only after location confirmed */}
      {locationConfirmed && (
        <button
          className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-lg px-8 py-4 rounded-full shadow-xl"
        >
          Request Taxi
        </button>
      )}
    </div>
  );
}

