-- Insertar carreras en la base de datos SIREC
-- Fecha: Diciembre 2025
-- 
-- Las dos carreras de la Facultad de Ciencias Empresariales:
-- 1. Ingeniería de Ejecución en Computación e Informática
-- 2. Ingeniería Civil Informática

-- Limpiar datos anteriores si existen
DELETE FROM carrera WHERE Carrera IN (
    'Ingeniería de Ejecución en Computación e Informática',
    'Ingeniería Civil Informática'
);

-- Insertar las carreras
INSERT INTO carrera (Carrera) VALUES 
    ('Ingeniería de Ejecución en Computación e Informática'),
    ('Ingeniería Civil Informática');

-- Verificar las carreras insertadas
SELECT ID_Carrera, Carrera FROM carrera ORDER BY ID_Carrera;
