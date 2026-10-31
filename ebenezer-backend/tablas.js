const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://ebenezer_db_user:niLUfb4N0V7N4n0efbslUVnS1pCqZsGR@dpg-dbj13tm7bikc73e4c31g-a.oregon-postgres.render.com/ebenezer_db',
  ssl: { rejectUnauthorized: false }
});

const scriptSQL = `
-- 1. Habilitar pgcrypto para encriptar contraseñas directamente en la base de datos
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Crear tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) CHECK (rol IN ('Administrador', 'Encargado', 'Gerencia')),
    estado VARCHAR(20) DEFAULT 'activo'
);

-- 3. Crear tabla de Productos
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    categoria VARCHAR(100),
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 5,
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Crear tabla de Movimientos
CREATE TABLE IF NOT EXISTS movimientos (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    tipo_movimiento VARCHAR(20) CHECK (tipo_movimiento IN ('entrada', 'salida')),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT
);

-- 5. Crear la Función (Stored Procedure) para actualizar el stock automáticamente
CREATE OR REPLACE FUNCTION actualizar_stock_producto()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tipo_movimiento = 'entrada' THEN
        UPDATE productos 
        SET stock_actual = stock_actual + NEW.cantidad 
        WHERE id = NEW.producto_id;
    ELSIF NEW.tipo_movimiento = 'salida' THEN
        -- Regla de negocio: Verificar que no quede en stock negativo
        IF (SELECT stock_actual FROM productos WHERE id = NEW.producto_id) < NEW.cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente para realizar la salida. El stock no puede ser negativo.';
        END IF;
        
        UPDATE productos 
        SET stock_actual = stock_actual - NEW.cantidad 
        WHERE id = NEW.producto_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Asignar el Trigger a la tabla de Movimientos
DROP TRIGGER IF EXISTS trigger_actualizar_stock ON movimientos;
CREATE TRIGGER trigger_actualizar_stock
AFTER INSERT ON movimientos
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock_producto();

-- 7. Insertar Usuarios de Prueba (La contraseña para todos es: 123456)
INSERT INTO usuarios (nombre_completo, correo, contrasena_hash, rol) VALUES 
('Administrador Principal', 'admin@ebenezer.com', crypt('123456', gen_salt('bf')), 'Administrador'),
('Encargado de Bodega', 'bodega@ebenezer.com', crypt('123456', gen_salt('bf')), 'Encargado'),
('Gerente General', 'gerencia@ebenezer.com', crypt('123456', gen_salt('bf')), 'Gerencia')
ON CONFLICT (correo) DO NOTHING;

-- 8. Insertar Productos de Prueba
INSERT INTO productos (codigo, nombre, categoria, stock_minimo, stock_actual) VALUES 
('REP-001', 'Filtro de Aceite Sintético', 'Mantenimiento', 5, 12),
('REP-002', 'Pastillas de Freno Delanteras', 'Frenos', 10, 8),
('REP-003', 'Bujía de Iridio', 'Motor', 20, 50)
ON CONFLICT (codigo) DO NOTHING;
`;

const ejecutarScript = async () => {
  try {
    console.log('Conectando a la base de datos de Render...');
    await pool.query(scriptSQL);
    console.log('¡Script ejecutado y tablas creadas con éxito!');
  } catch (error) {
    console.error('Error al ejecutar el script:', error);
  } finally {
    pool.end();
  }
};

ejecutarScript();