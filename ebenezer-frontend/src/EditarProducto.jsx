import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './index.css';

const EditarProducto = () => {
  const { id } = useParams(); // Extrae el ID de la URL
  const navigate = useNavigate();
  const [producto, setProducto] = useState({ codigo: '', nombre: '', categoria: '', stock_minimo: 0 });

  useEffect(() => {
    // Verificar sesión y cargar datos del producto
    if (!localStorage.getItem('token')) return navigate('/login');
    
    fetch(`http://localhost:3000/api/productos/${id}`)
      .then(res => res.json())
      .then(data => setProducto(data))
      .catch(err => alert('Error al cargar el producto'));
  }, [id, navigate]);

  const guardarCambios = async (e) => {
    e.preventDefault();
    const res = await fetch(`http://localhost:3000/api/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: producto.nombre,
        categoria: producto.categoria,
        stock_minimo: producto.stock_minimo
      })
    });
    
    if (res.ok) {
      navigate('/inventario'); // Regresar a la tabla si todo sale bien
    } else {
      alert('Error al actualizar');
    }
  };

  return (
    <div>
      <nav className="navbar">
        <h2>Modificar Repuesto</h2>
        <button onClick={() => navigate('/inventario')} className="btn btn-danger">Cancelar y Volver</button>
      </nav>

      <div className="inventory-container">
        <div className="form-panel" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <form onSubmit={guardarCambios} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label>Código (No modificable)</label>
              <input className="form-input" style={{ width: '100%', background: '#eee' }} value={producto.codigo} disabled />
            </div>
            <div>
              <label>Nombre de la pieza</label>
              <input className="form-input" style={{ width: '100%' }} value={producto.nombre} onChange={e => setProducto({...producto, nombre: e.target.value})} required />
            </div>
            <div>
              <label>Categoría</label>
              <input className="form-input" style={{ width: '100%' }} value={producto.categoria} onChange={e => setProducto({...producto, categoria: e.target.value})} required />
            </div>
            <div>
              <label>Stock Mínimo</label>
              <input className="form-input" style={{ width: '100%' }} type="number" value={producto.stock_minimo} onChange={e => setProducto({...producto, stock_minimo: Number(e.target.value)})} required />
            </div>
            <button className="btn btn-primary" type="submit">Guardar Cambios</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarProducto;