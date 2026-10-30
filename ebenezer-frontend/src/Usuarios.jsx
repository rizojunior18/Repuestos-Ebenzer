import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre_completo: '', correo: '', contrasena: '', rol: 'Encargado' });
  const navigate = useNavigate();

  const cargarUsuarios = () => {
    fetch('http://localhost:3000/api/usuarios')
      .then(res => res.json())
      .then(data => setUsuarios(data));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');
    
    if (!token) return navigate('/login');
    
    if (rol !== 'Administrador') {
      alert('Acceso denegado: Esta pantalla es exclusiva para Administradores.');
      return navigate('/inventario');
    }
    
    cargarUsuarios();
  }, [navigate]);

  const agregarUsuario = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3000/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoUsuario)
    });
    if (res.ok) {
      setNuevoUsuario({ nombre_completo: '', correo: '', contrasena: '', rol: 'Encargado' });
      cargarUsuarios();
    } else {
      alert('Error al crear usuario. Verifica que el correo no exista ya.');
    }
  };

  const cambiarEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
    await fetch(`http://localhost:3000/api/usuarios/${id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado })
    });
    cargarUsuarios();
  };

  return (
    <div>
      <nav className="navbar">
        <h2>Gestión de Usuarios</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/inventario')} className="btn btn-primary" style={{ background: '#34495e' }}>Volver al Inventario</button>
          <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="btn btn-danger">Cerrar Sesión</button>
        </div>
      </nav>

      <div className="inventory-container">
        <div className="form-panel">
          <h3 style={{marginTop: 0}}>Registrar Nuevo Usuario</h3>
          <form onSubmit={agregarUsuario}>
            <input className="form-input" style={{flex: 2}} placeholder="Nombre completo" value={nuevoUsuario.nombre_completo} onChange={e => setNuevoUsuario({...nuevoUsuario, nombre_completo: e.target.value})} required />
            <input className="form-input" type="email" placeholder="Correo" value={nuevoUsuario.correo} onChange={e => setNuevoUsuario({...nuevoUsuario, correo: e.target.value})} required />
            <input className="form-input" type="password" placeholder="Contraseña temporal" value={nuevoUsuario.contrasena} onChange={e => setNuevoUsuario({...nuevoUsuario, contrasena: e.target.value})} required />
            <select className="form-input" value={nuevoUsuario.rol} onChange={e => setNuevoUsuario({...nuevoUsuario, rol: e.target.value})}>
              <option value="Administrador">Administrador</option>
              <option value="Encargado">Encargado</option>
              <option value="Gerencia">Gerencia</option>
            </select>
            <button className="btn btn-primary" type="submit">Crear</button>
          </form>
        </div>

        <div className="table-panel">
          <h3 style={{marginTop: 0}}>Usuarios del Sistema</h3>
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((user) => (
                <tr key={user.id}>
                  <td>{user.nombre_completo}</td>
                  <td>{user.correo}</td>
                  <td>{user.rol}</td>
                  <td>
                    <span style={{
                      background: user.estado === 'activo' ? '#dcfce7' : '#fee2e2',
                      color: user.estado === 'activo' ? '#166534' : '#991b1b',
                      padding: '5px 10px', borderRadius: '15px', fontWeight: 'bold'
                    }}>
                      {user.estado.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => cambiarEstado(user.id, user.estado)} className={user.estado === 'activo' ? "btn btn-danger" : "btn btn-success"}>
                      {user.estado === 'activo' ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Usuarios;