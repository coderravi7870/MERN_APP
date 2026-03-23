import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

dotenv.config();

connectDB();



const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
}));
app.use(express.json());


import apiRoutes from './routes/api.js';

// Routes
app.use('/api', apiRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
