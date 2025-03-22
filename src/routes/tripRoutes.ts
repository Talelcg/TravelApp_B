import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post('/plan-trip', async (req, res) => {
  const { destination, duration, interests } = req.body;
  const prompt = `You are a travel planner. Create a detailed ${duration}-day itinerary for ${destination}.
  The user's interests: ${interests}.
  The output should be in a table format with three columns:
  1. Day and Time
  2. Activity
  3. Details
  `;

  console.log("📩 Received request body:", req.body);
  console.log("🔑 API Key: Exists ✅");
  console.log("📡 Sending request to Gemini...");

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

   
    interface GeminiResponse {
      candidates: { content: { parts: { text: string }[] } }[];
    }

    const geminiResponse = response.data as GeminiResponse;
    const tripPlan = geminiResponse.candidates[0]?.content?.parts?.[0]?.text || "No plan available";

    res.json(response.data);

  } catch (error) {
    console.error("❌ Error generating trip plan:", error);
    res.status(500).json({ error: '❌ Error generating trip plan ביצירת תכנון טיול' });
  }
});

export default router;
