import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css'; // Aseguramos que cargue el CSS

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
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <p style={{color: '#666'}}>Acceso al sistema Ebenezer</p>
      
      <form onSubmit={manejarIngreso} className="login-form">
        <input className="form-input" type="email" placeholder="Correo electrónico" value={correo} onChange={e => setCorreo(e.target.value)} required />
        <input className="form-input" type="password" placeholder="Contraseña" value={contrasena} onChange={e => setContrasena(e.target.value)} required />
        <button className="btn btn-primary" type="submit">Ingresar al sistema</button>
      </form>
    </div>
  );
};

export default Login;