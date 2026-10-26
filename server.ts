import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { generateLocalReport } from "./src/utils/reportGenerator";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "15mb" }));

// Server-side Gemini initialization
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API endpoint to generate structured report strictly from user data & prompt
app.post("/api/generate-report", async (req, res) => {
  try {
    const { prompt, rawData, reportTitle, reportType } = req.body;

    if (!prompt && !rawData) {
      return res.status(400).json({ error: "Please provide a prompt or data for the report." });
    }

    const ai = getGenAI();

    // Fallback heuristic generator if no API key is provided
    if (!ai) {
      const fallbackReport = generateLocalReport(prompt, rawData, reportTitle);
      return res.json({ report: fallbackReport, isHeuristic: true });
    }

    const systemInstruction = `You are an expert report builder and data analyst.
Your task is to take the user's prompt and raw data, and transform them into a comprehensive, professional, executive report.
STRICT RULE: The report MUST be strictly based on the user's provided prompt and raw data. Do not invent unrelated data. Extract all metrics, trends, comparisons, tables, and narrative from what the user provided.
If numbers or categories exist in the user's input, format them into:
1. Executive Summary: concise high-level overview.
2. Key Metrics: high-impact KPIs with values, changes (e.g., +14%, -5%, Met), and trends.
3. Visual Charts: bar, line, area, or pie charts with clear labels and numeric values based on the data.
4. Data Tables: structured tabular rows and columns accurately reflecting the input figures.
5. Narrative Sections & Actionable Recommendations.

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
    // Ensure ids are present
    if (!parsed.id) parsed.id = "rep_" + Date.now();
    parsed.rawPrompt = prompt;

    return res.json({ report: parsed });
  } catch (error: any) {
    console.error("Gemini report generation error:", error);
    // Return heuristic report as graceful fallback
    const fallbackReport = generateLocalReport(req.body.prompt, req.body.rawData, req.body.reportTitle);
    return res.json({
      report: fallbackReport,
      isHeuristic: true,
      errorNotice: error?.message || "Using smart structured data parser",
    });
  }
});

// Development or production middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ReportCraft server running at http://localhost:${PORT}`);
  });
}

startServer();
