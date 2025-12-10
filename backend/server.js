import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js'
import errorHandler from './middleware/errorHandler.js'

import authRoutes from './routes/authRoutes.js'
import authRoutes from './routes/documentRoutes.js'


// ES6 module_dirname alternative
const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);


// Initialize express app
const app = express();

//Connect to MongoDB
connectDB();

//Middleware to handle CORS
app.use(
    cors({
        origin:"*",
        methods:["GET","POST","PUT","DELETE"],
        allowedHeaders:["Content-Type","Authorization"],
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({extended:true}));

//Static folder for uploads
app.use('/uploads', express.static(path.join(_dirname, 'uploads')));

// Routes
app.use('/api/auth',authRoutes)

app.use(errorHandler);

// 404 Handler
app.use((req,res) =>{
    res.status(404).json({
        success: false,
        erroe: 'Route not found',
        statusCode: 404
    });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>{
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) =>{
    console.error(`Error: ${err.message}`);
    process.exit(1);
});


