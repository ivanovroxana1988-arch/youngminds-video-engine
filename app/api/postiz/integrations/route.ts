import { NextResponse } from "next/server";
import { PostizClient } from "@/lib/postiz/client";

export async function GET() {
  try {
    const client = new PostizClient();
    const integrations = await client.listIntegrations();
    return NextResponse.json({ integrations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Could not load Postiz integrations" }, { status: 400 });
  }
}
