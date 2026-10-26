import { GoogleGenAI, Type } from "@google/genai";
import { generateLocalReport } from "../src/utils/reportGenerator";

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, rawData, reportTitle, reportType } = req.body || {};

    if (!prompt && !rawData) {
      return res.status(400).json({ error: "Please provide a prompt or data for the report." });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If no API key configured on Vercel, return high quality structured local report
    if (!apiKey) {
      const fallbackReport = generateLocalReport(prompt, rawData, reportTitle);
      return res.status(200).json({ report: fallbackReport, isHeuristic: true });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const systemInstruction = `You are an expert report builder and data analyst.
Your task is to take the user's prompt and raw data, and transform them into a comprehensive, professional, executive report.
STRICT RULE: The report MUST be strictly based on the user's provided prompt and raw data. Extract all metrics, trends, comparisons, tables, and narrative from what the user provided.
Format strictly as JSON adhering to the required schema. Keep all text in English as requested.`;

    const userPromptContent = `
Report Title Request: ${reportTitle || "Auto-detect appropriate title"}
Report Focus/Context: ${reportType || "Executive Business Report"}
User Instructions / Prompt:
${prompt || "Generate a structured executive report from the following data."}

User Raw Data / Notes:
${rawData || prompt}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPromptContent,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            preparedFor: { type: Type.STRING },
            preparedBy: { type: Type.STRING },
            date: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            theme: {
              type: Type.STRING,
              description: "one of: executive-blue, corporate-navy, emerald-growth, slate-modern, crimson-edge",
            },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    description: "one of: metrics, chart, table, narrative, recommendations",
                  },
                  content: { type: Type.STRING },
                  bullets: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  metrics: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        label: { type: Type.STRING },
                        value: { type: Type.STRING },
                        change: { type: Type.STRING },
                        trend: { type: Type.STRING, description: "up, down, or neutral" },
                        note: { type: Type.STRING },
                      },
                      required: ["id", "label", "value"],
                    },
                  },
                  chart: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      type: { type: Type.STRING, description: "bar, line, area, or pie" },
                      xAxisLabel: { type: Type.STRING },
                      yAxisLabel: { type: Type.STRING },
                      data: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            label: { type: Type.STRING },
                            value: { type: Type.NUMBER },
                            benchmark: { type: Type.NUMBER },
                          },
                          required: ["label", "value"],
                        },
                      },
                      summaryNote: { type: Type.STRING },
                    },
                  },
                  table: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      headers: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      rows: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      summary: { type: Type.STRING },
                    },
                  },
                },
                required: ["id", "title", "type"],
              },
            },
          },
          required: ["title", "subtitle", "date", "executiveSummary", "sections"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response received from model");
    }

    const parsed = JSON.parse(text);
    if (!parsed.id) parsed.id = "rep_" + Date.now();
    parsed.rawPrompt = prompt;

    return res.status(200).json({ report: parsed });
  } catch (error: any) {
    console.error("Vercel API error, falling back:", error);
    const fallbackReport = generateLocalReport(req.body?.prompt, req.body?.rawData, req.body?.reportTitle);
    return res.status(200).json({
      report: fallbackReport,
      isHeuristic: true,
      errorNotice: error?.message || "Using smart structured data parser",
    });
  }
}
