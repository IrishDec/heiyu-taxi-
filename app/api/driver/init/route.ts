import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { email } = await req.json();

  // Check if driver already exists
  const { data: existing } = await supabase
    .from("drivers")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, driver: existing });
  }

  // Create new driver
  const { data, error } = await supabase
    .from("drivers")
    .insert({ email })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, driver: data });
}
