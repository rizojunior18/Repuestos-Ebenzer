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
    const token = localStorage.getItem('token');
    fetch('https://repuestos-ebenzer.onrender.com/api/productos', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProductos(data);
        } else {
          console.error("Respuesta no es un arreglo:", data);
          setProductos([]);
        }
      })
      .catch(err => {
        console.error("Error al cargar:", err);
        setProductos([]);
      });
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
    const token = localStorage.getItem('token');
    
    const res = await fetch('https://repuestos-ebenzer.onrender.com/api/productos', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
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
    const token = localStorage.getItem('token');
    const res = await fetch('https://repuestos-ebenzer.onrender.com/api/productos/movimiento', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ producto_id, tipo_movimiento, cantidad })
    });
    if (!res.ok) {
      toast.error('Stock insuficiente para realizar esta salida o error de red.');
    } else {
      toast.success(`Movimiento de ${tipo_movimiento} registrado.`);
      cargarProductos();
    }
  };

  const darDeBaja = async (id) => {
    if (window.confirm('¿Seguro que deseas inactivar este repuesto? Desaparecerá de esta vista.')) {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://repuestos-ebenzer.onrender.com/api/productos/${id}/estado`, { 
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        toast.info('Repuesto dado de baja');
        cargarProductos();
      }
    }
  };

  const productosFiltrados = (productos || []).filter(prod => 
    (prod.codigo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (prod.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (prod.categoria || '').toLowerCase().includes(busqueda.toLowerCase())
  );

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
              <input className="form-input" placeholder="Código (ej. REP-003