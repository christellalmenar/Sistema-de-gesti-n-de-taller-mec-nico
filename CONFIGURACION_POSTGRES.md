# MotoTaller: backend PostgreSQL (etapa 1)

Se agregó un backend Node.js/Express que conecta con la base local `mototaller_db`.

## Configuración
1. Abre `.env` en la raíz del proyecto.
2. Sustituye `TU_CONTRASENA` por la contraseña local del usuario PostgreSQL `postgres`.
3. No compartas el archivo `.env` ni lo subas a GitHub.
4. En una terminal de VS Code ejecuta `npm install`.
5. Comprueba que PostgreSQL esté iniciado y ejecuta `npm run api`.
6. Abre `http://localhost:3001/api/health`; debe responder con `ok: true`.

## Estado de esta etapa
El backend ya tiene rutas para comprobar la conexión, iniciar sesión con hashes `pgcrypto`, consultar las tablas y guardar/eliminar registros, incluyendo los detalles de órdenes y facturas.

**El frontend aún no se ha conectado a estas rutas.** La siguiente etapa es adaptar `src/lib/store.tsx` y el formulario de acceso para dejar de usar `localStorage`. No borres ni restablezcas los datos actuales.
