"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function PassengerPage() {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Get GPS location
  const updateLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLoading(false);
      },
      (err) => {
        console.error("GPS error:", err);
        alert("Unable to get location");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    updateLocation();
  }, []);

  // Send ride request to Supabase
  const requestTaxi = async () => {
    if (lat == null || lng == null) return;

    setMessage("Sending request...");

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Not logged in");
      return;
    }

    const { error } = await supabase.from("ride_requests").insert({
      passenger_email: user.email,
      pickup_lat: lat,
      pickup_lng: lng,
      status: "pending",
    });

    if (error) {
      console.error(error);
      setMessage("Error: " + error.message);
    } else {
      setMessage("Taxi requested! Waiting for driver…");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Passenger</h1>

      <button
        onClick={updateLocation}
        className="bg-black text-white px-4 py-2 mt-4 rounded"
      >
        {loading ? "Updating…" : "Refresh Location"}
      </button>

      <div className="mt-4">
        <p>Latitude: {lat}</p>
        <p>Longitude: {lng}</p>
      </div>

      <button
        onClick={requestTaxi}
        disabled={!lat || !lng}
        className="bg-green-600 text-white px-4 py-2 mt-6 rounded disabled:bg-gray-400"
      >
        Request Taxi
      </button>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
