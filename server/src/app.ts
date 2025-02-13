import express from 'express';
import dotenv from 'dotenv'; //const dotenv = require('dotenv');
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import groupRoutes from './routes/group'

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors(
    // {origin: ['http://localhost:5173/','http://192.168.1.32:5173/'],
    //     credentials: true,
    //     methods: ['GET','POST','PUT','DELETE']}
     
));



app.use('/api/auth', authRoutes);

app.use('/api/group',groupRoutes);

connectDB();

export default app;
  