const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(cors({ origin: '*' }));
app.use(express.json());

// ======================
// DEBUG (opcional pero útil)
// ======================
console.log("DATABASE_URL existe?", !!process.env.DATABASE_URL);

// ======================
// POSTGRES
// ======================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Probar conexión DB sin tumbar servidor
pool.connect()
    .then(() => console.log("DB conectada ✔"))
    .catch(err => console.error("Error DB ❌", err));

// ======================
// ROOT
// ======================
app.get('/', (req, res) => {
    res.send('API SIPE funcionando 🚀');
});

// ======================
// USUARIOS
// ======================
app.get('/api/usuarios', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error usuarios' });
    }
});

app.post('/api/usuarios', async (req, res) => {
    try {
        const { nombre, tipo, matricula, carrera } = req.body;

        const result = await pool.query(
            `INSERT INTO usuarios (nombre, tipo, matricula, carrera)
             VALUES ($1,$2,$3,$4)
             RETURNING *`,
            [nombre, tipo, matricula, carrera]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error crear usuario' });
    }
});

// ======================
// EQUIPOS
// ======================
app.get('/api/equipos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM equipos');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error equipos' });
    }
});

app.post('/api/equipos', async (req, res) => {
    try {
        const { nombre, codigo, disponible } = req.body;

        const result = await pool.query(
            `INSERT INTO equipos (nombre, codigo, disponible)
             VALUES ($1,$2,$3)
             RETURNING *`,
            [nombre, codigo, disponible]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error crear equipo' });
    }
});

// ======================
// PRESTAMOS
// ======================
app.get('/api/prestamos', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.id,
                u.nombre AS usuario,
                e.nombre AS equipo,
                p.fecha_prestamo,
                p.estado
            FROM prestamos p
            JOIN usuarios u ON p.usuario_id = u.id
            JOIN equipos e ON p.equipo_id = e.id
        `);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error prestamos' });
    }
});

app.post('/api/prestamos', async (req, res) => {
    try {
        const { usuario_id, equipo_id, fecha_prestamo, estado } = req.body;

        const result = await pool.query(
            `INSERT INTO prestamos (usuario_id, equipo_id, fecha_prestamo, estado)
             VALUES ($1,$2,$3,$4)
             RETURNING *`,
            [usuario_id, equipo_id, fecha_prestamo, estado]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error crear prestamo' });
    }
});

// ======================
// SERVER (FIX RAILWAY)
// ======================
const PORT = process.env.PORT;

app.listen(PORT, '0.0.0.0', () => {
    console.log('Servidor listo en puerto', PORT);
});