import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './routes/authroutes';
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';
import path from 'path';


import cors from "cors";



// ✅ Allow requests from the frontend

dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI is not defined in the .env file');
}

const app = express();

app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173", // Allow frontend requests
  credentials: true, // Allow cookies and headers
}));

app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);

app.use("/images", express.static(path.join(__dirname, "../public/images")));
// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

// Do not start the server here
export default app;
