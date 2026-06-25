const express = require('express');
const cors = require('cors');
require('dotenv').config();

const employeeRoutes = require('./routes/employee.routes');
const departmentRoutes = require('./routes/department.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));