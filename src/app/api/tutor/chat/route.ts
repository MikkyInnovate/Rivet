import { NextRequest, NextResponse } from "next/server";
import { generateTutorReply } from "@/modules/models/services/geminiService";

// Runs server-side only. Keeps the Gemini API key off the client and holds no
// per-user session state — the client sends the transcript on each request.
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

  try {
    const { model, history, message } = await req.json();
    if (!model?.name || !Array.isArray(model?.parts) || !message) {
      return NextResponse.json(
        { error: "model (name, parts) and message are required." },
        { status: 400 }
      );
    }
    const text = await generateTutorReply(apiKey, model, history ?? [], message);
    return NextResponse.json({ text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chat failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
