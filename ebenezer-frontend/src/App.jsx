import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Inventario from './Inventario';
import Usuarios from './Usuarios';
import EditarProducto from './EditarProducto'; // Importar el nuevo componente

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inventario" element={<Inventario />} />
        {/* Nueva ruta para editar, que recibe un parámetro dinámico :id */}
        <Route path="/editar/:id" element={<EditarProducto />} />
        <Route path="/usuarios" element={<Usuarios />} />
      </Routes>
    </Router>
  );
}

export default App;