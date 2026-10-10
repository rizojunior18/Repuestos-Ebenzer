// Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const navigate = useNavigate();

  const manejarIngreso = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena })
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error);
      localStorage.setItem('token', datos.token);
      navigate('/inventario');
    } catch (err) { alert(err.message); }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid black' }}>
      <h3 style={{ textAlign: 'center' }}>Inicio de sesión</h3>
      <form onSubmit={manejarIngreso} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="email" placeholder="Correo" value={correo} onChange={e => setCorreo(e.target.value)} required />
        <input type="password" placeholder="Contraseña" value={contrasena} onChange={e => setContrasena(e.target.value)} required />
        <button type="submit">[ Ingresar ]</button>
      </form>
    </div>
  );
};
export default Login;