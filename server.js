const PORT = process.env.PORT;

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('Servidor listo en puerto', PORT);
});

// 🔥 IMPORTANTE: evita crashes silenciosos
server.on('error', (err) => {
    console.error('Server error:', err);
});