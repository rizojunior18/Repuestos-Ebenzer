// productos.js
const express = require('express');
const pool = require('./db');
const router = express.Router();

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) { 
    res.status(500).json({ error: 'Error al obtener productos' }); 
  }
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
  const { codigo, nombre, categoria, stock_minimo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO productos (codigo, nombre, categoria, stock_minimo) VALUES ($1, $2, $3, $4) RETURNING *',
      [codigo, nombre, categoria, stock_minimo]
    );
    res.json(result.rows[0]);
  } catch (error) { 
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto' }); 
  }
});

// Registrar un movimiento (Entrada o Salida)
router.post('/movimiento', async (req, res) => {
  const { producto_id, tipo_movimiento, cantidad } = req.body;
  try {
    // Usamos el usuario_id 1 (Admin) temporalmente para la prueba
    await pool.query(
      'INSERT INTO movimientos (producto_id, usuario_id, tipo_movimiento, cantidad) VALUES ($1, $2, $3, $4)',
      [producto_id, 1, tipo_movimiento, cantidad]
    );
    res.json({ message: 'Movimiento registrado con éxito' });
  } catch (error) { 
    console.error(error);
    res.status(500).json({ error: 'Stock insuficiente o error en BD' }); 
  }
});

module.exports = router;