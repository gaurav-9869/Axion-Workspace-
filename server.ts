import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "dummy").replace(/^["']|["']$/g, "").trim(),
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const rawKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
      const apiKey = rawKey.replace(/^["']|["']$/g, "").trim();
      if (!apiKey || apiKey === "dummy") {
          return res.status(400).json({ error: "API key is missing or invalid. Please check your AI Studio Settings." });
      }

      const localAi = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const { prompt } = req.body;
      if (!prompt) {
          return res.status(400).json({ error: "Missing prompt" });
      }
      
      const response = await localAi.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.warn("Gemini Handshake Failure (handled):", error.message);
      if (error.message && error.message.includes("API key not valid")) {
        res.status(401).json({ error: "Your Gemini API key is invalid. Please check your AI Studio Settings and paste a valid key." });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
