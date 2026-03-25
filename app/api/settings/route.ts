import { NextResponse } from "next/server";
import { localContainer } from "@/lib/services/shared/local-service-container";

export async function GET() {
  const settings = await localContainer.services.dashboardService.getSettings();

  return NextResponse.json({
    settings,
    environment: {
      localMode: true,
      supabaseConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
      providers: {
        nvidia: Boolean(process.env.NVIDIA_API_KEY),
        mistral: Boolean(process.env.MISTRAL_API_KEY),
        compatible: Boolean(process.env.COMPATIBLE_API_KEY && process.env.COMPATIBLE_API_BASE_URL),
      },
    },
  });
}

