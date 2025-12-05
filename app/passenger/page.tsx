"use client";

import { useEffect } from "react";

export default function PassengerIndex() {
  useEffect(() => {
    window.location.href = "/passenger/request-ride";
  }, []);

  return null;
}

