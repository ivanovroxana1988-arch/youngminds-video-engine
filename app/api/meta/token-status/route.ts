import { NextResponse } from "next/server";
import { getTokenStatus } from "@/lib/meta/client";

export async function GET() {
  const status = await getTokenStatus();
  return NextResponse.json(status);
}
