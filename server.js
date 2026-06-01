const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'citizix_user',
    host: 'localhost',
    database: 'citizix_db',
    password: 'S3cret',
    port: 5432,
});

app.get('/usuarios', async (req, res) => {

    try {

        const result = await pool.query('SELECT NOW()');

        res.json(result.rows);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            error: 'Error'
        });

    }

});

app.listen(3001, () => {

    console.log('Servidor iniciado en puerto 3001');

});