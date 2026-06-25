const sql = require('mssql');
require('dotenv').config();

const config = {
    server: 'localhost',
    database: 'employeeDB',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    authentication: {
        type: 'default',
        options: {
            userName: 'sa',
            password: '123456'
        }
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ Connected to SQL Server');
        return pool;
    })
    .catch(err => {
        console.error('❌ SQL Server Error:', err.message);
    });

module.exports = { sql, poolPromise };