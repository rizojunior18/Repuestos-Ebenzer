const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas de los módulos
app.use('/api/auth', require('./auth'));
app.use('/api/productos', require('./productos'));
app.use('/api/usuarios', require('./usuarios'));
app.use('/api/dashboard', require('./dashboard'));

// Puerto dinámico para Render o 3000 para entorno local
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`API de Repuestos Ebenezer ejecutándose en el puerto ${port}`);
});