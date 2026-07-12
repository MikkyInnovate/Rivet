import { NextRequest, NextResponse } from "next/server";
import { generate3DModel } from "@/modules/mechanical/services/geminiService";

// Runs server-side only. The Gemini API key is read from a server-only env var
// (GEMINI_API_KEY) and is never sent to the browser.
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing GEMINI_API_KEY. Add it to .env.local." },
      { status: 500 }
    );
  }

  let imageBase64: string | undefined;
  try {
    ({ imageBase64 } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!imageBase64) {
    return NextResponse.json({ error: "imageBase64 is required." }, { status: 400 });
  }

  try {
    const model = await generate3DModel(imageBase64, apiKey);
    return NextResponse.json(model);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
