const express = require('express');
const pool = require('./db');
const router = express.Router();

// 1. Obtener estadísticas (KPIs) para las tarjetas superiores
router.get('/stats', async (req, res) => {
  try {
    const totalProductos = await pool.query('SELECT COUNT(*) FROM productos');
    const totalUsuarios = await pool.query('SELECT COUNT(*) FROM usuarios');
    const stockBajo = await pool.query('SELECT COUNT(*) FROM productos WHERE stock_actual <= stock_minimo');
    const totalMovimientos = await pool.query('SELECT COUNT(*) FROM movimientos');

    res.json({
      productos: parseInt(totalProductos.rows[0].count),
      usuarios: parseInt(totalUsuarios.rows[0].count),
      stockBajo: parseInt(stockBajo.rows[0].count),
      movimientos: parseInt(totalMovimientos.rows[0].count)
    });
  } catch (error) { 
    res.status(500).json({ error: 'Error al obtener estadísticas' }); 
  }
});

// 2. Obtener historial reciente para el reporte de auditoría
router.get('/reporte', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.id, p.nombre as producto, u.nombre_completo as usuario, m.tipo_movimiento, m.cantidad, m.fecha_movimiento
      FROM movimientos m
      JOIN productos p ON m.producto_id = p.id
      JOIN usuarios u ON m.usuario_id = u.id
      ORDER BY m.fecha_movimiento DESC
      LIMIT 15
    `);
    res.json(result.rows);
  } catch (error) { 
    res.status(500).json({ error: 'Error al obtener el reporte' }); 
  }
});

module.exports = router;