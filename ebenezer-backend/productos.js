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

// Obtener un solo producto por ID (Para la pantalla de edición)
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(result.rows[0]);
  } catch (error) { 
    res.status(500).json({ error: 'Error al buscar el producto' }); 
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
    res.status(500).json({ error: 'Error al crear producto' }); 
  }
});

// Modificar un producto existente
router.put('/:id', async (req, res) => {
  const { nombre, categoria, stock_minimo } = req.body;
  try {
    // El código no se actualiza para mantener la integridad del inventario
    await pool.query(
      'UPDATE productos SET nombre = $1, categoria = $2, stock_minimo = $3 WHERE id = $4',
      [nombre, categoria, stock_minimo, req.params.id]
    );
    res.json({ message: 'Producto actualizado con éxito' });
  } catch (error) { 
    res.status(500).json({ error: 'Error al actualizar producto' }); 
  }
});

// Registrar un movimiento (Entrada o Salida)
router.post('/movimiento', async (req, res) => {
  const { producto_id, tipo_movimiento, cantidad } = req.body;
  try {
    await pool.query(
      'INSERT INTO movimientos (producto_id, usuario_id, tipo_movimiento, cantidad) VALUES ($1, $2, $3, $4)',
      [producto_id, 1, tipo_movimiento, cantidad] // Usuario 1 temporal
    );
    res.json({ message: 'Movimiento registrado con éxito' });
  } catch (error) { 
    res.status(500).json({ error: 'Stock insuficiente o error en BD' }); 
  }
});

module.exports = router;