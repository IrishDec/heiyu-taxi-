"use client";
import { useEffect } from "react";

export default function HomeRedirect() {
  useEffect(() => {
    window.location.href = "/passenger/request-ride";
  }, []);

  return null;
}

