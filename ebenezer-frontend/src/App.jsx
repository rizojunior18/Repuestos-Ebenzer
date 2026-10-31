import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './Login';
import Inventario from './Inventario';
import EditarProducto from './EditarProducto';
import Usuarios from './Usuarios';
import Dashboard from './Dashboard';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/editar/:id" element={<EditarProducto />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
      {/* Contenedor global de notificaciones flotantes */}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
}

export default App;