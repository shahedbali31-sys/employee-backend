const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

// GET /api/departments
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM Department');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/departments
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .query(`
                INSERT INTO Department (name)
                OUTPUT INSERTED.*
                VALUES (@name)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(400).json({ message: 'Server error', error: err.message });
    }
});

// DELETE /api/departments/:id
router.delete('/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Department WHERE id = @id');
        res.json({ message: 'Department deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;