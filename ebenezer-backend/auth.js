const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body;
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const usuario = result.rows[0];
    if (usuario.estado !== 'activo') return res.status(403).json({ error: 'Usuario inactivo. Contacte al administrador.' });

    const validPassword = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!validPassword) return res.status(401).json({ error: 'Credenciales incorrectas' });

    // Generamos el token de seguridad
    const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, 'secreto_ebenezer', { expiresIn: '2h' });
    
    // IMPORTANTE: Ahora enviamos el token Y el rol al frontend
    res.json({ token, rol: usuario.rol });
  } catch (error) { 
    res.status(500).json({ error: 'Error en el servidor' }); 
  }
});

module.exports = router;