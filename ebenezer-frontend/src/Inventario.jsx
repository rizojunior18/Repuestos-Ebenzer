import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import './index.css';

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [nuevoProducto, setNuevoProducto] = useState({ codigo: '', nombre: '', categoria: '', stock_minimo: 5 });
  const navigate = useNavigate();
  const rol = localStorage.getItem('rol');

  const cargarProductos = () => {
    fetch('https://repuestos-ebenzer.onrender.com/api/productos/movimiento')
      .then(res => res.json())
      .then(data => setProductos(data));
  };

  useEffect(() => {
    if (!localStorage.getItem('token')) return navigate('/login');
    cargarProductos();
  }, [navigate]);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    navigate('/login');
  };

  const agregarProducto = async (e) => {
  e.preventDefault();
  
  // Obtener el token de la sesión guardado en localStorage
  const token = localStorage.getItem('token');

    // Enviar a /api/productos, NO a /movimiento
    const res = await fetch('https://repuestos-ebenzer.onrender.com/api/productos', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // Agregar la cabecera de Autorización obligatoria
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(nuevoProducto)
    });

    if (res.ok) {
      toast.success('Repuesto agregado exitosamente');
      setNuevoProducto({ codigo: '', nombre: '', categoria: '', stock_minimo: 5 });
      cargarProductos();
    } else {
      toast.error('Error al agregar (código duplicado o sesión inválida)');
    }
  };

  const registrarMovimiento = async (producto_id, tipo_movimiento, cantidad) => {
    const res = await fetch('https://repuestos-ebenzer.onrender.com/api/productos/movimiento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ producto_id, tipo_movimiento, cantidad })
    });
    if (!res.ok) {
      toast.error('Stock insuficiente para realizar esta salida.');
    } else {
      toast.success(`Movimiento de ${tipo_movimiento} registrado.`);
      cargarProductos();
    }
  };

  const darDeBaja = async (id) => {
    if (window.confirm('¿Seguro que deseas inactivar este repuesto? Desaparecerá de esta vista.')) {
      const res = await fetch(`https://repuestos-ebenzer.onrender.com/api/productos/${id}/estado`, { method: 'PUT' });
      if (res.ok) {
        toast.info('Repuesto dado de baja');
        cargarProductos();
      }
    }
  };

  const exportarExcel = () => {
    const datosExportar = productosFiltrados.map(p => ({
      'Código': p.codigo,
      'Nombre': p.nombre,
      'Categoría': p.categoria,
      'Stock Actual': p.stock_actual,
      'Stock Mínimo': p.stock_minimo
    }));
    const hoja = XLSX.utils.json_to_sheet(datosExportar);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Inventario");
    XLSX.writeFile(libro, "Reporte_Ebenezer.xlsx");
    toast.success('Archivo Excel descargado');
  };

  const productosFiltrados = productos.filter(prod => 
    prod.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    prod.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <nav className="navbar">
        <h2>Repuestos Ebenezer</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {rol !== 'Encargado' && (
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ background: '#27ae60' }}>Dashboard</button>
          )}
          {rol === 'Administrador' && (
            <button onClick={() => navigate('/usuarios')} className="btn btn-primary" style={{ background: '#34495e' }}>Usuarios</button>
          )}
          <button onClick={cerrarSesion} className="btn btn-danger">Cerrar Sesión</button>
        </div>
      </nav>

      <div className="inventory-container">
        {/* Formulario visible solo para Admin y Encargado */}
        {rol !== 'Gerencia' && (
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
        )}

        <div className="table-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0 }}>Gestión de Stock</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                className="form-input" 
                placeholder="Buscar código, nombre o categoría..." 
                value={busqueda} 
                onChange={e => setBusqueda(e.target.value)}
                style={{ width: '300px' }}
              />
              <button onClick={exportarExcel} className="btn btn-success">Descargar Excel</button>
            </div>
          </div>

          <table className="inventory-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Stock Actual / Mínimo</th>
                {rol !== 'Gerencia' && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((prod) => (
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
                  {rol !== 'Gerencia' && (
                    <td style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => registrarMovimiento(prod.id, 'entrada', 5)} className="btn btn-success" title="Entrada rápida">+5</button>
                      <button onClick={() => registrarMovimiento(prod.id, 'salida', 1)} className="btn btn-danger" title="Venta rápida">-1</button>
                      <button onClick={() => navigate(`/editar/${prod.id}`)} className="btn btn-primary" style={{ background: '#6c757d' }}>Editar</button>
                      {rol === 'Administrador' && (
                        <button onClick={() => darDeBaja(prod.id)} className="btn btn-danger" style={{ background: '#343a40' }}>Baja</button>
                      )}
                    </td>
                  )}
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