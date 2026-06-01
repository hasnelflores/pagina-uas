# SIPE — Sistema de Préstamo de Equipos
### Facultad de Ingeniería Mochis · UAS

Aplicación web para el control y registro de préstamos de equipos del centro de cómputo y demás áreas de la facultad.

---

## Módulos incluidos

| Módulo | Descripción |
|---|---|
| **Dashboard** | Resumen ejecutivo con estadísticas y actividad reciente |
| **Unidades Académicas** | CRUD — Facultad de Ingeniería, Enfermería, etc. |
| **Carreras** | CRUD — Ing. Civil, Software, Geodésica, etc. |
| **Usuarios** | CRUD — Alumnos y profesores con matrícula |
| **Equipos** | CRUD — Inventario con disponibilidad en tiempo real |
| **Préstamos** | Registro, entrega y seguimiento de préstamos |
| **Reportes** | Filtros por carrera, equipo, usuario, fechas + exportar CSV + imprimir |

---

## Cómo correrlo en VS Code

### Opción A — Live Server (recomendado)

1. Abre la carpeta `prestamos-uas` en VS Code
2. Instala la extensión **Live Server** (Ritwick Dey)
3. Haz clic derecho sobre `index.html` → **"Open with Live Server"**
4. Se abre en `http://127.0.0.1:5500`

### Opción B — npx serve

```bash
cd prestamos-uas
npx serve .
```

### Opción C — Python (si ya lo tienes)

```bash
cd prestamos-uas
python -m http.server 3000
# Abre http://localhost:3000
```

---

## Tecnologías

- **HTML5 / CSS3 / JavaScript vanilla** — sin frameworks
- **localStorage** — persistencia de datos en el navegador
- **Google Fonts** — Syne + DM Sans
- Sin dependencias npm necesarias para correr

---

## Estructura del proyecto

```
prestamos-uas/
├── index.html              ← Punto de entrada
├── src/
│   ├── styles/
│   │   └── main.css        ← Estilos globales
│   ├── data/
│   │   └── db.js           ← Base de datos local (localStorage)
│   ├── pages/
│   │   ├── dashboard.js
│   │   ├── unidades.js
│   │   ├── carreras.js
│   │   ├── usuarios.js
│   │   ├── equipos.js
│   │   ├── prestamos.js
│   │   └── reportes.js
│   └── app.js              ← Router y utilidades
└── README.md
```

---

## Notas de entrega

- La aplicación corre completamente en el navegador (sin backend)
- Los datos se guardan en `localStorage`, persisten al recargar
- Para resetear los datos: `DB.reset()` en la consola del navegador
- Compatible con Chrome, Firefox y Edge modernos
