import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import cors from 'cors';
import axios from 'axios';

import userRoutes from './routes/authroutes';
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';

dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI is not defined in the .env file');
}

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is not defined in the .env file');
}

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Routes
app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);

// Serve static images
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Trip planning API - using Gemini
app.post('/api/plan-trip', async (req, res) => {
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

    console.log("✅ Response from Gemini:", JSON.stringify(response.data, null, 2));

    // גישה נכונה למידע
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


export default app;
