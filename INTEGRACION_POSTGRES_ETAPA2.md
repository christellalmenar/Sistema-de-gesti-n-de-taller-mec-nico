# MotoTaller — integración con PostgreSQL (etapa 2)

Esta versión conecta el inicio de sesión y las operaciones de datos de la interfaz con el backend Express y PostgreSQL.

## Antes de reemplazar la carpeta

1. Conserva una copia de la carpeta que ya tienes.
2. Conserva tu archivo `.env` actual. No lo compartas ni lo subas.
3. Extrae esta versión en una carpeta nueva o reemplaza los archivos del proyecto, pero vuelve a colocar tu `.env` en la raíz de `taller-moto-amigo-main`.

## Instalar y ejecutar

En la carpeta que contiene `package.json`:

```powershell
npm install --legacy-peer-deps --no-audit --no-fund
```

Terminal 1 — backend:

```powershell
npm run api
```

Debe indicar `API MotoTaller escuchando en http://localhost:3001`.

Terminal 2 — interfaz:

```powershell
npm run dev
```

Abre la dirección local que muestre Vite/TanStack en la terminal. Mantén abiertas ambas terminales.

## Qué se conecta

- Inicio de sesión contra `usuarios.password_hash` mediante `pgcrypto`.
- Carga de usuarios, clientes, motos, empleados, servicios, órdenes, facturas y pagos desde PostgreSQL.
- Guardado y eliminación de registros mediante la API.
- `localStorage` conserva solamente el identificador de sesión; ya no se usa para almacenar la base de datos de demostración.

## Importante

- No vuelvas a ejecutar el script de migración: los datos ya están en PostgreSQL.
- No pulses acciones de restablecimiento de datos. Esta versión elimina el botón local de restauración de datos de demostración.
- El backend es una configuración local de desarrollo. Antes de publicar el sistema en Internet, hay que sustituir el encabezado `x-user-id` por sesiones seguras y endurecer la autenticación/autorización.
- La conexión `/api/health` confirma el acceso a PostgreSQL; no sustituye las pruebas funcionales de cada pantalla.
