-- Usuario de MySQL para la API: solo puede leer la tabla producto.
-- Ejecutar como root, cambiando la contraseña, y poner el usuario y la contraseña en .env
-- (DB_USER=vm_lectura, DB_PASSWORD=...). La API nunca debe conectarse como root.

CREATE USER IF NOT EXISTS 'vm_lectura'@'localhost' IDENTIFIED BY 'CAMBIA_ESTA_CONTRASENA';
ALTER USER 'vm_lectura'@'localhost' IDENTIFIED BY 'CAMBIA_ESTA_CONTRASENA';
GRANT SELECT ON inventario_vm.producto TO 'vm_lectura'@'localhost';
FLUSH PRIVILEGES;

-- Comprobar: SHOW GRANTS FOR 'vm_lectura'@'localhost';
