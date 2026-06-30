const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

// POST /api/users/register — تسجيل يوزر جديد
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const pool = await poolPromise;

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

// PUT /api/users/reset-password — تغيير الباسورد
router.put('/reset-password', async (req, res) => {
    try {
        const { username, newPassword } = req.body;
        const pool = await poolPromise;

        const check = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Users WHERE username = @username');

        if (check.recordset.length === 0)
            return res.status(404).json({ message: 'Username not found' });

        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('newPassword', sql.NVarChar, newPassword)
            .query('UPDATE Users SET password = @newPassword WHERE username = @username');

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;