import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const Dashboard = () => {
  const [stats, setStats] = useState({ productos: 0, usuarios: 0, stockBajo: 0, movimientos: 0 });
  const [reporte, setReporte] = useState([]);
  const navigate = useNavigate();
  const rol = localStorage.getItem('rol');

  useEffect(() => {
    if (!localStorage.getItem('token')) return navigate('/login');
    
    // Bloquear acceso a Encargados de bodega (solo Admin/Gerencia acceden)
    if (rol === 'Encargado') {
      alert('Acceso denegado: El panel de reportes es exclusivo para Gerencia y Administración.');
      return navigate('/inventario');
    }

    fetch('https://repuestos-ebenzer.onrender.com/api/dashboard/stats')
      .then(res => res.json())
      .then(data => setStats(data));

    fetch('https://repuestos-ebenzer.onrender.com/api/dashboard/reporte')
      .then(res => res.json())
      .then(data => setReporte(data));
  }, [navigate, rol]);

  return (
    <div>
      <nav className="navbar">
        <h2>Panel Gerencial - Reportes</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/inventario')} className="btn btn-primary" style={{ background: '#34495e' }}>Ir al Inventario</button>
          {rol === 'Administrador' && (
            <button onClick={() => navigate('/usuarios')} className="btn btn-primary" style={{ background: '#34495e' }}>Usuarios</button>
          )}
          <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} className="btn btn-danger">Cerrar Sesión</button>
        </div>
      </nav>

      <div className="inventory-container">
        
        {/* Tarjetas de Indicadores KPI */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <div className="form-panel" style={{ flex: 1, textAlign: 'center', minWidth: '200px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Total de Repuestos</h4>
            <h2 style={{ margin: 0, fontSize: '2.5rem', color: '#007bff' }}>{stats.productos}</h2>
          </div>
          <div className="form-panel" style={{ flex: 1, textAlign: 'center', minWidth: '200px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Stock Crítico</h4>
            <h2 style={{ margin: 0, fontSize: '2.5rem', color: '#e74c3c' }}>{stats.stockBajo}</h2>
          </div>
          <div className="form-panel" style={{ flex: 1, textAlign: 'center', minWidth: '200px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Total de Movimientos</h4>
            <h2 style={{ margin: 0, fontSize: '2.5rem', color: '#2ecc71' }}>{stats.movimientos}</h2>
          </div>
        </div>

        {/* Tabla de Reportes (Historial de movimientos) */}
        <div className="table-panel">
          <h3 style={{ marginTop: 0 }}>Reporte Histórico de Entradas y Salidas</h3>
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Repuesto</th>
                <th>Tipo de Transacción</th>
                <th>Cantidad</th>
                <th>Usuario Responsable</th>
              </tr>
            </thead>
            <tbody>
              {reporte.map((mov) => (
                <tr key={mov.id}>
                  <td>{new Date(mov.fecha_movimiento).toLocaleString()}</td>
                  <td><strong>{mov.producto}</strong></td>
                  <td>
                    <span style={{ color: mov.tipo_movimiento === 'entrada' ? '#166534' : '#991b1b', fontWeight: 'bold' }}>
                      {mov.tipo_movimiento.toUpperCase()}
                    </span>
                  </td>
                  <td>{mov.cantidad}</td>
                  <td>{mov.usuario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;