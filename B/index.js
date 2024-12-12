const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'Moeez+Butt=MoeezButt';


// Middleware
const corsOptions = {
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'], // Live Server URLs
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

