"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DriverLogin() {
  const [email, setEmail] = useState("");

const signIn = async () => {
  // create driver record if not exists
  await fetch("/api/driver/init", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  await supabase.auth.signInWithOtp({ email });
  alert("Check your email to continue");
};


  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Driver Login</h1>

      <input
        className="border p-2 mt-4 w-full"
        placeholder="Driver Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        onClick={signIn}
        className="bg-black text-white px-4 py-2 mt-4 w-full"
      >
        Continue
      </button>
      <p className="mt-4 text-sm text-gray-500">
  After clicking the login link in your email, go to{" "}
  <a href="/driver/dashboard" className="text-blue-600 underline">
    /driver/dashboard
  </a>
</p>

    </div>
  );
}
