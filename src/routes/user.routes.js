const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

// POST /api/users/register — تسجيل يوزر جديد
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const pool = await poolPromise;

        // تأكد إن اليوزر ما موجود
        const check = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Users WHERE username = @username');

        if (check.recordset.length > 0)
            return res.status(400).json({ message: 'Username already exists' });

        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, password)
            .query('INSERT INTO Users (username, password) VALUES (@username, @password)');

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/users/login — تسجيل دخول
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const pool = await poolPromise;

        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, password)
            .query('SELECT * FROM Users WHERE username = @username AND password = @password');

        if (result.recordset.length === 0)
            return res.status(401).json({ message: 'Invalid username or password' });

        res.json({ message: 'Login successful', user: result.recordset[0] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;