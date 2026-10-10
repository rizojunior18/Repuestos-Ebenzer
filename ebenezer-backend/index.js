// index.js
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./auth'));
app.use('/api/productos', require('./productos'));
app.listen(3000, () => console.log('API de Repuestos Ebenezer en puerto 3000'));