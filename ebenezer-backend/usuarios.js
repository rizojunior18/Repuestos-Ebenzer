const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('./db');
const router = express.Router();

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre_completo, correo, rol, estado FROM usuarios ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) { 
    res.status(500).json({ error: 'Error al obtener usuarios' }); 
  }
});

// Crear un nuevo usuario
router.post('/', async (req, res) => {
  const { nombre_completo, correo, contrasena, rol } = req.body;
  try {
    const hash = await bcrypt.hash(contrasena, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (nombre_completo, correo, contrasena_hash, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre_completo, correo, rol, estado',
      [nombre_completo, correo, hash, rol]
    );
    res.json(result.rows[0]);
  } catch (error) { 
    res.status(500).json({ error: 'Error al crear usuario (quizás el correo ya existe)' }); 
  }
});

// Cambiar estado (Activar/Desactivar)
router.put('/:id/estado', async (req, res) => {
  const { estado } = req.body;
  try {
    await pool.query('UPDATE usuarios SET estado = $1 WHERE id = $2', [estado, req.params.id]);
    res.json({ message: 'Estado actualizado' });
  } catch (error) { 
    res.status(500).json({ error: 'Error al actualizar estado' }); 
  }
});

module.exports = router;