const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt'); // You'll need to install this
const jwt = require('jsonwebtoken'); // You'll need to install this
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

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};


// Add client endpoint
app.post('/api/clients', authenticateToken, (req, res) => {
    const {
        name,
        email,
        contactPerson,
        projectType,
        projectBudget,
        startingDate,
        deadline
    } = req.body;

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

// Get clients for a user
app.get('/api/clients', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    db.all('SELECT * FROM clients WHERE user_id = ? ORDER BY created_at DESC', [userId],
        (err, clients) => {
            if (err) {
                console.error('Error fetching clients:', err);
                return res.status(500).json({ error: 'Failed to fetch clients' });
            }
            res.json(clients);
        });
});

// Create a new user
app.post('/api/users', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        res.status(400).json({ error: 'Name and email are required API' });
        return;
    }

    db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            id: this.lastID,
            name,
            email
        });
    });
});


// Get user data
app.get('/api/users/me', authenticateToken, (req, res) => {
    db.get('SELECT id, name, email FROM users WHERE id = ?',
        [req.user.userId],
        (err, user) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json(user);
        });
});


// Get dashboard metrics
app.get('/api/dashboard/metrics', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];

    db.get(`
        SELECT 
            COUNT(*) as totalClients,
            COALESCE(SUM(project_budget), 0) as totalRevenue,
            COUNT(CASE WHEN starting_date IS NOT NULL THEN 1 END) as totalProjects,
            COUNT(CASE WHEN deadline < ? THEN 1 END) as completedProjects
        FROM clients 
        WHERE user_id = ?
    `, [today, userId], (err, metrics) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(metrics);
    });
});

// Get recent activity
app.get('/api/dashboard/activity', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    db.all(`
        SELECT id, activity,
                 strftime('%Y-%m-%dT%H:%M:%fZ', timestamp) as timestamp
        FROM activity_history
        WHERE user_id = ?
        ORDER BY timestamp DESC
        LIMIT 10
    `, [userId], (err, activities) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(activities);
    });
});

// Add activity
app.post('/api/dashboard/activity', authenticateToken, (req, res) => {
    const { activity } = req.body;
    const userId = req.user.userId;

    if (!activity) {
        return res.status(400).json({ error: 'Activity is required' });
    }

    const timestamp = new Date().toISOString(); // Store as ISO string


    db.run(
        'INSERT INTO activity_history (user_id, activity) VALUES (?, ?)',
        [userId, activity, timestamp],
        function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.status(201).json({ id: this.lastID, activity, timestamp: new Date() });
        }
    );
});


// Update client
app.put('/api/clients/:id', authenticateToken, (req, res) => {
    const clientId = req.params.id;
    const userId = req.user.userId;
    const {
        name,
        contact_person,
        project_type,
        project_budget,
        starting_date,
        deadline
    } = req.body;

    db.run(
        `UPDATE clients 
         SET name = ?, contact_person = ?, project_type = ?, 
             project_budget = ?, starting_date = ?, deadline = ?
         WHERE id = ? AND user_id = ?`,
        [name, contact_person, project_type, project_budget, starting_date, deadline, clientId, userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to update client' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Client not found' });
            }
            res.json({ message: 'Client updated successfully' });
        }
    );
});

// Delete client
app.delete('/api/clients/:id', authenticateToken, (req, res) => {
    const clientId = req.params.id;
    const userId = req.user.userId;

    db.run(
        'DELETE FROM clients WHERE id = ? AND user_id = ?',
        [clientId, userId],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to delete client' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Client not found' });
            }
            res.json({ message: 'Client deleted successfully' });
        }
    );
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});