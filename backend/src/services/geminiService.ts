import fetch from "node-fetch"; // ensure installed: npm i node-fetch@2
import { StartupAnalysisRequest, StartupAnalysisReport } from "./adkService"; // reuse interfaces

const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL ?? "text-bison-001";

async function callGemini(prompt: string) {
  if (!KEY) throw new Error("GEMINI_API_KEY not set");
  const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generate?key=${KEY}`;
  const body = {
    prompt: { text: prompt },
    temperature: 0.2,
    maxOutputTokens: 1024,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok)
    throw new Error(`Gemini error: ${res.status} ${await res.text()}`);
  const json = await res.json();
  // extract text from response (adjust if API shape differs)
  const text =
    json?.candidates?.[0]?.content || json?.output?.[0]?.content || "";
  return text;
}

function buildPrompt(r: StartupAnalysisRequest) {
  return `You are an expert AgriTech analyst. Return a SINGLE valid JSON object only. Startup: ${JSON.stringify(
    r
  )}\n`;
}

export async function generateStartupAnalysis(
  req: StartupAnalysisRequest
): Promise<StartupAnalysisReport> {
  const prompt = buildPrompt(req);
  const text = await callGemini(prompt);
  try {
    return JSON.parse(text) as StartupAnalysisReport;
  } catch (e) {
    const m = text.match(/(\{[\s\S]*\})/);
    if (m) return JSON.parse(m[1]) as StartupAnalysisReport;
    throw new Error("Failed to parse Gemini response as JSON");
  }
}
export default { generateStartupAnalysis };
