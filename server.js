```javascript id="k5n7qc"
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

app.get('/usuarios', async (req, res) => {

    try {

        const result = await pool.query(
            'SELECT * FROM usuarios'
        );

        res.json(result.rows);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            error: 'Error'
        });

    }

});

app.listen(process.env.PORT || 3001, () => {

    console.log('Servidor iniciado');

});
```
