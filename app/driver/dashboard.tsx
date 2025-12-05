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
    <div className="p-6">
      <h1 className="text-xl font-bold">Driver Dashboard</h1>

      <button
        onClick={toggleStatus}
        className={`px-4 py-2 mt-4 text-white ${
          status === "available" ? "bg-red-600" : "bg-green-600"
        }`}
      >
        {status === "available" ? "Go Offline" : "Go Online"}
      </button>

      {incomingRide && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="font-bold">New Ride Request</h2>
          <p>
            Pickup: {incomingRide.pickup_lat}, {incomingRide.pickup_lng}
          </p>
          <button
            className="bg-black text-white px-4 py-2 mt-3"
            onClick={acceptRide}
          >
            Accept Ride
          </button>
        </div>
      )}
    </div>
  );
}
