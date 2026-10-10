// Inventario.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    cargarProductos(); // Recargar la tabla
  };

  const registrarMovimiento = async (producto_id, tipo_movimiento, cantidad) => {
    const res = await fetch('http://localhost:3000/api/productos/movimiento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ producto_id, tipo_movimiento, cantidad })
    });
    if (!res.ok) alert('Error: Verifica que haya suficiente stock para la salida.');
    cargarProductos(); // El trigger de PostgreSQL ya actualizó el stock, solo recargamos
  };

  return (
    <div>
      {/* Barra de Navegación */}
      <nav style={{ background: '#333', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Repuestos Ebenezer</h2>
        <button onClick={cerrarSesion} style={{ background: 'red', color: 'white', border: 'none', padding: '5px 15px', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </nav>

      <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Formulario de Nuevo Producto */}
        <div style={{ background: '#f4f4f4', padding: '15px', marginBottom: '20px', border: '1px solid #ddd' }}>
          <h4>Registrar Nuevo Repuesto</h4>
          <form onSubmit={agregarProducto} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input placeholder="Código (ej. REP-003)" value={nuevoProducto.codigo} onChange={e => setNuevoProducto({...nuevoProducto, codigo: e.target.value})} required />
            <input placeholder="Nombre de la pieza" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} required />
            <input placeholder="Categoría" value={nuevoProducto.categoria} onChange={e => setNuevoProducto({...nuevoProducto, categoria: e.target.value})} required />
            <input type="number" placeholder="Stock Mínimo" value={nuevoProducto.stock_minimo} onChange={e => setNuevoProducto({...nuevoProducto, stock_minimo: Number(e.target.value)})} required />
            <button type="submit">Agregar a BD</button>
          </form>
        </div>

        {/* Tabla de Inventario */}
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#eee', borderBottom: '2px solid black' }}>
              <th style={{ padding: '8px' }}>Código</th>
              <th style={{ padding: '8px' }}>Nombre</th>
              <th style={{ padding: '8px' }}>Stock Actual / Mínimo</th>
              <th style={{ padding: '8px' }}>Acciones rápidas</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((prod) => (
              <tr key={prod.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px' }}>{prod.codigo}</td>
                <td style={{ padding: '8px' }}>{prod.nombre}</td>
                <td style={{ padding: '8px', fontWeight: 'bold', color: prod.stock_actual <= prod.stock_minimo ? 'red' : 'green' }}>
                  {prod.stock_actual} / {prod.stock_minimo}
                </td>
                <td style={{ padding: '8px', display: 'flex', gap: '5px' }}>
                  <button onClick={() => registrarMovimiento(prod.id, 'entrada', 5)} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '5px' }}>+5 Ingreso</button>
                  <button onClick={() => registrarMovimiento(prod.id, 'salida', 1)} style={{ background: '#f44336', color: 'white', border: 'none', padding: '5px' }}>-1 Venta</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventario;