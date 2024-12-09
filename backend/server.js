const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());


const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Athena1991!@',
    database: 'finance_app',
});


db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database.');
    connection.release();
});
app.use(express.static(path.join(__dirname, '../frontend')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, password], (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Registration failed. Please try again.' });
        } else {
            res.status(201).json({ message: 'User registered successfully' });
        }
    });
});

// User Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    console.log('Login request received:', { username, password }); // Debugging log

    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error('Database error during login:', err);
            res.status(500).json({ error: 'Login failed. Please try again.' });
        } else if (results.length === 0) {
            console.log('No matching user found.');
            res.status(401).json({ error: 'Invalid username or password' });
        } else {
            console.log('User logged in:', results[0]);
            res.json({ message: 'Login successful', user: results[0] });
        }
    });
});

app.post('/transaction', (req, res) => {
    const { type, amount, description } = req.body;
    if (!type || !amount || !description) {
        return res.status(400).json({ error: 'Type, amount, and description are required' });
    }

    const sql = 'INSERT INTO transactions (type, amount, description) VALUES (?, ?, ?)';
    db.query(sql, [type, amount, description], (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error adding transaction. Please try again.' });
        } else {
            res.status(201).json({ message: 'Transaction added successfully' });
        }
    });
});


app.get('/transactions', (req, res) => {
    const sql = 'SELECT * FROM transactions ORDER BY id DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error retrieving transactions. Please try again.' });
        } else {
            res.json(results);
        }
    });
});


app.post('/savings', (req, res) => {
    const { name, targetAmount, currentAmount } = req.body;
    if (!name || !targetAmount) {
        return res.status(400).json({ error: 'Name and target amount are required' });
    }

    const sql = 'INSERT INTO savings (name, target_amount, current_amount) VALUES (?, ?, ?)';
    db.query(sql, [name, targetAmount, currentAmount || 0], (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error adding savings goal. Please try again.' });
        } else {
            res.status(201).json({ message: 'Savings goal added successfully' });
        }
    });
});


app.get('/savings', (req, res) => {
    const sql = 'SELECT * FROM savings ORDER BY id DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error retrieving savings goals. Please try again.' });
        } else {
            res.json(results);
        }
    });
});

app.get('/dashboard-summary', (req, res) => {
    const transactionSummarySql = `
        SELECT 
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expenses
        FROM transactions;
    `;

    const savingsSummarySql = `
        SELECT 
            SUM(target_amount) AS total_target, 
            SUM(current_amount) AS total_current
        FROM savings;
    `;

    db.query(transactionSummarySql, (err, transactionSummary) => {
        if (err) {
            console.error('Error retrieving transaction summary:', err);
            res.status(500).json({ error: 'Error retrieving transaction summary' });
        } else {
            db.query(savingsSummarySql, (err, savingsSummary) => {
                if (err) {
                    console.error('Error retrieving savings summary:', err);
                    res.status(500).json({ error: 'Error retrieving savings summary' });
                } else {
                    res.json({
                        transactions: transactionSummary[0],
                        savings: savingsSummary[0],
                    });
                    console.log('Dashboard Summary Response:', {
                        transactions: transactionSummary[0],
                        savings: savingsSummary[0],
                    });
                    
                }
            });
        }
    });
});



app.use((req, res) => {
    res.status(404).json({ error: 'Route not found. Check your URL or API endpoint.' });
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Serving static files from: ${path.join(__dirname, '../frontend')}`);
});
