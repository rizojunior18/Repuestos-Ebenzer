CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) CHECK (rol IN ('Administrador', 'Encargado', 'Gerencia')) NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo'
);

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    categoria VARCHAR(100),
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 5,
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movimientos (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id),
    tipo_movimiento VARCHAR(20) CHECK (tipo_movimiento IN ('entrada', 'salida')) NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT
);

CREATE OR REPLACE FUNCTION actualizar_stock_producto() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tipo_movimiento = 'entrada' THEN
        UPDATE productos SET stock_actual = stock_actual + NEW.cantidad WHERE id = NEW.producto_id;
    ELSIF NEW.tipo_movimiento = 'salida' THEN
        IF (SELECT stock_actual FROM productos WHERE id = NEW.producto_id) < NEW.cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente';
        END IF;
        UPDATE productos SET stock_actual = stock_actual - NEW.cantidad WHERE id = NEW.producto_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_stock AFTER INSERT ON movimientos
FOR EACH ROW EXECUTE FUNCTION actualizar_stock_producto();

INSERT INTO usuarios (nombre_completo, correo, contrasena_hash, rol) 
VALUES ('Admin Ebenezer', 'admin@ebenezer.com', '$2b$10$wY.O1F2L159rK3k.Zl.o/O7D/nQ9q2o8g5/TfWJ2T8I8q2e9n9q1u', 'Administrador');

INSERT INTO productos (codigo, nombre, categoria, stock_actual, stock_minimo) 
VALUES ('REP-001', 'Filtro de Aceite', 'Mantenimiento', 15, 10), ('REP-002', 'Bujía de Iridium', 'Eléctrico', 4, 20);