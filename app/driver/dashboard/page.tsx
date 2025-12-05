"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DriverDashboard() {
  const [driver, setDriver] = useState<any>(null);
  const [status, setStatus] = useState("offline");
  const [incomingRide, setIncomingRide] = useState<any>(null);

  // Load driver profile
  useEffect(() => {
    supabase.auth.getUser().then(async (res) => {
      const user = res.data.user;
      if (!user) return;

      const { data } = await supabase
        .from("drivers")
        .select("*")
        .eq("email", user.email)
        .single();

      setDriver(data);
      setStatus(data?.status || "offline");
    });
  }, []);

  // Toggle driver online/offline
  const toggleStatus = async () => {
    if (!driver) return;

    const newStatus = status === "offline" ? "available" : "offline";
    setStatus(newStatus);

    await supabase
      .from("drivers")
      .update({ status: newStatus })
      .eq("id", driver.id);
  };

  // Listen for new ride requests
  useEffect(() => {
    if (!driver) return;

    const channel = supabase
      .channel("rides")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ride_requests" },
        (payload) => {
          if (status === "available") {
            setIncomingRide(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driver, status]);

  // Accept ride
  const acceptRide = async () => {
    if (!incomingRide) return;

    await supabase
      .from("ride_requests")
      .update({
        status: "accepted",
        driver_id: driver.id,
      })
      .eq("id", incomingRide.id);

    setIncomingRide(null);
  };

  return (
    <div className="w-full h-screen relative">
      {/* TOP BAR */}
      <div className="absolute top-0 w-full p-4 bg-white/90 backdrop-blur shadow z-10">
        <h1 className="text-2xl font-bold">Heiyu Taxi — Driver</h1>
        <p className="text-sm text-gray-600">
          Status: {status === "available" ? "🟢 Online" : "🔴 Offline"}
        </p>
      </div>

      {/* MAP PLACEHOLDER */}
      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
        <p>Map coming soon…</p>
      </div>

      {/* TOGGLE STATUS BUTTON */}
      <button
        onClick={toggleStatus}
        className={`absolute bottom-32 left-1/2 -translate-x-1/2 px-10 py-4 text-xl rounded-full shadow-xl text-white ${
          status === "available" ? "bg-red-600" : "bg-green-600"
        }`}
      >
        {status === "available" ? "Go Offline" : "Go Online"}
      </button>

      {/* INCOMING REQUEST POPUP */}
      {incomingRide && (
        <div className="absolute bottom-0 w-full p-6 pb-10 bg-white shadow-xl rounded-t-2xl animation-slide-up">
          <h2 className="text-xl font-bold mb-2">New Ride Request</h2>
          <p className="text-gray-700 mb-4">
            Pickup: {incomingRide.pickup_lat}, {incomingRide.pickup_lng}
          </p>

          <div className="flex gap-4">
            <button
              onClick={acceptRide}
              className="flex-1 bg-black text-white py-3 rounded-lg text-lg"
            >
              Accept
            </button>
            <button className="flex-1 bg-gray-300 py-3 rounded-lg text-lg">
              Decline
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
