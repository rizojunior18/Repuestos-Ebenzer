import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({ codigo: '', nombre: '', categoria: '', stock_minimo: 5 });
  const navigate = useNavigate();

  const cargarProductos = () => {
    fetch('http://localhost:3000/api/productos')
      .then(res => res.json())
      .then(data => setProductos(data));
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) return navigate('/login');
    cargarProductos();
  }, [navigate]);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const agregarProducto = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:3000/api/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoProducto)
    });
    setNuevoProducto({ codigo: '', nombre: '', categoria: '', stock_minimo: 5 });
    cargarProductos();
  };

  const registrarMovimiento = async (producto_id, tipo_movimiento, cantidad) => {
    const res = await fetch('http://localhost:3000/api/productos/movimiento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ producto_id, tipo_movimiento, cantidad })
    });
    if (!res.ok) alert('Error: Verifica que haya suficiente stock para la salida.');
    cargarProductos();
  };

  return (
    <div>
      <nav className="navbar">
        <h2>Repuestos Ebenezer</h2>
        <button onClick={cerrarSesion} className="btn btn-danger">Cerrar Sesión</button>
      </nav>

      <div className="inventory-container">
        <div className="form-panel">
          <h3 style={{marginTop: 0}}>Registrar Nuevo Repuesto</h3>
          <form onSubmit={agregarProducto}>
            <input className="form-input" placeholder="Código (ej. REP-003)" value={nuevoProducto.codigo} onChange={e => setNuevoProducto({...nuevoProducto, codigo: e.target.value})} required />
            <input className="form-input" style={{flex: 2}} placeholder="Nombre de la pieza" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} required />
            <input className="form-input" placeholder="Categoría" value={nuevoProducto.categoria} onChange={e => setNuevoProducto({...nuevoProducto, categoria: e.target.value})} required />
            <input className="form-input" style={{width: '100px'}} type="number" placeholder="Mínimo" value={nuevoProducto.stock_minimo} onChange={e => setNuevoProducto({...nuevoProducto, stock_minimo: Number(e.target.value)})} required />
            <button className="btn btn-primary" type="submit">Agregar</button>
          </form>
        </div>

        <div className="table-panel">
          <h3 style={{marginTop: 0}}>Gestión de Stock</h3>
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Stock Actual / Mínimo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((prod) => (
                <tr key={prod.id}>
                  <td><strong>{prod.codigo}</strong></td>
                  <td>{prod.nombre}</td>
                  <td>{prod.categoria}</td>
                  <td>
                    <span style={{ 
                      background: prod.stock_actual <= prod.stock_minimo ? '#fee2e2' : '#dcfce7',
                      color: prod.stock_actual <= prod.stock_minimo ? '#991b1b' : '#166534',
                      padding: '5px 10px', borderRadius: '15px', fontWeight: 'bold'
                    }}>
                      {prod.stock_actual} / {prod.stock_minimo}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => registrarMovimiento(prod.id, 'entrada', 5)} className="btn btn-success">+5</button>
                    <button onClick={() => registrarMovimiento(prod.id, 'salida', 1)} className="btn btn-danger">-1</button>
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

export default Inventario;