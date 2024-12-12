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

// Database setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        // Create users table with authentication fields
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            disabled BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            contact_person TEXT NOT NULL,
            project_type TEXT NOT NULL,
            project_budget DECIMAL(10,2) NOT NULL,
            starting_date DATE,
            deadline DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS activity_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            activity TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);

    }
});

// Sample routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            return res.status(404).json({ error: 'user_not_found' });
        }

        if (user.disabled) {
            return res.status(403).json({ error: 'account_disabled' });
        }

        try {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ error: 'invalid_credentials' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                "Moeez+Butt=MoeezButt",
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Authentication error' });
        }
    });
});

// Get all users
app.get('/api/users', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});


app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(409).json({ error: 'email_already_exists' });
                    }
                    return res.status(500).json({ error: 'Database error' });
                }

                // Generate JWT token
                const token = jwt.sign(
                    { userId: this.lastID, email },
                    "Moeez+Butt=MoeezButt",
                    { expiresIn: '24h' }
                );

                res.status(201).json({
                    token,
                    user: {
                        id: this.lastID,
                        name,
                        email
                    }
                });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Registration error' });
    }
});

 // Basic validation
 if (!name || !email || !contactPerson || !projectType || !projectBudget) {
    return res.status(400).json({ error: 'All fields are required' });
}

const userId = req.user.userId;

db.serialize(() => {
    // Begin transaction
    db.run('BEGIN TRANSACTION');

    // Insert client
    db.run(
        `INSERT INTO clients (
            user_id, name, email, contact_person, 
            project_type, project_budget, starting_date, deadline
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, name, email, contactPerson, projectType, projectBudget, startingDate, deadline],
        function (err) {
            if (err) {
                db.run('ROLLBACK');
                console.error('Error adding client:', err);
                return res.status(500).json({ error: 'Failed to add client' });
            }

            const clientId = this.lastID;

            // Add activity record
            db.run(
                `INSERT INTO activity_history (user_id, activity) VALUES (?, ?)`,
                [userId, `Added new client: ${name}`],
                (err) => {
                    if (err) {
                        db.run('ROLLBACK');
                        console.error('Error adding activity:', err);
                        return res.status(500).json({ error: 'Failed to add activity' });
                    }

                    // Commit transaction
                    db.run('COMMIT');
                    res.status(201).json({
                        message: 'Client added successfully',
                        clientId: clientId
                    });
                }
            );
        }
    );
});
});

