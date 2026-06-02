const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// test DB sin romper server
pool.query('SELECT NOW()')
    .then(() => console.log('DB conectada ✔'))
    .catch(err => console.error('DB error ❌', err));

// ROOT
app.get('/', (req, res) => {
    res.status(200).send('API SIPE funcionando 🚀');
});

// USUARIOS
app.get('/api/usuarios', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔥 FIX CLAVE AQUÍ
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log('Servidor listo en puerto', PORT);
});