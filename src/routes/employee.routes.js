const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

// GET /api/employees
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const search = req.query.search || '';
        const result = await pool.request()
            .input('search', sql.NVarChar, `%${search}%`)
            .query(`
                SELECT e.id, e.name, e.salary,
                       d.id AS departmentId, d.name AS department
                FROM Employee e
                JOIN Department d ON e.departmentId = d.id
                WHERE e.name LIKE @search
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET /api/employees/:id
router.get('/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT e.id, e.name, e.salary,
                       d.id AS departmentId, d.name AS department
                FROM Employee e
                JOIN Department d ON e.departmentId = d.id
                WHERE e.id = @id
            `);
        if (result.recordset.length === 0)
            return res.status(404).json({ message: 'Employee not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// POST /api/employees
router.post('/', async (req, res) => {
    try {
        const { name, salary, departmentId } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('salary', sql.Decimal, salary)
            .input('departmentId', sql.Int, departmentId)
            .query(`
                INSERT INTO Employee (name, salary, departmentId)
                OUTPUT INSERTED.*
                VALUES (@name, @salary, @departmentId)
            `);
        res.status(201).json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// PUT /api/employees/:id
router.put('/:id', async (req, res) => {
    try {
        const { name, salary, departmentId } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('name', sql.NVarChar, name)
            .input('salary', sql.Decimal, salary)
            .input('departmentId', sql.Int, departmentId)
            .query(`
                UPDATE Employee
                SET name = @name, salary = @salary, departmentId = @departmentId
                OUTPUT INSERTED.*
                WHERE id = @id
            `);
        if (result.recordset.length === 0)
            return res.status(404).json({ message: 'Employee not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// DELETE /api/employees/:id
router.delete('/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Employee WHERE id = @id');
        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;