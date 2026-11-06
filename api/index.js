import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;
const app = express();
app.use(cors({ origin: process.env.APP_ORIGIN || true }));
app.use(express.json({ limit: '1mb' }));
if (!process.env.DATABASE_URL) throw new Error('Configura DATABASE_URL en .env');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const tables = {
  usuarios: { table:'usuarios', fields:['nombre','usuario','email','rol','activo'] },
  clientes: { table:'clientes', fields:['nombre','apellido','documento','telefono','email','direccion','fecha'] },
  motos: { table:'motos', fields:['cliente_id','marca','modelo','anio','placa','color','chasis','km'] },
  empleados: { table:'empleados', fields:['nombre','cargo','telefono','email','activo'] },
  servicios: { table:'servicios', fields:['codigo','nombre','descripcion','precio','activo'] },
  ordenes: { table:'ordenes', fields:['numero','cliente_id','moto_id','mecanico_id','ingreso','entrega','estado','observaciones'] },
  facturas: { table:'facturas', fields:['numero','fecha','cliente_id','moto_id','descuento','iva'] },
  pagos: { table:'pagos', fields:['factura_id','fecha','monto','metodo','estado'] },
};
const fromDb = row => Object.fromEntries(Object.entries(row).map(([k,v]) => [k.replace(/_([a-z])/g,(_,c)=>c.toUpperCase()), v instanceof Date ? v.toISOString().slice(0,10) : v]));
const value = (data, field) => data[field.replace(/_([a-z])/g,(_,c)=>c.toUpperCase())] ?? data[field] ?? null;

app.get('/api/health', async (_req,res) => {
  try { await pool.query('SELECT 1'); res.json({ok:true, database:'mototaller_db'}); }
  catch { res.status(500).json({ok:false,error:'No se pudo conectar con PostgreSQL'}); }
});

app.post('/api/login', async (req,res) => {
  const login=String(req.body?.login || '').trim();
  const password=String(req.body?.password || '');
  if (!login || !password) return res.status(400).json({code:'input',error:'Usuario y contraseña requeridos'});
  try {
    const {rows}=await pool.query(`SELECT id,nombre,usuario,email,rol,activo,ultimo_acceso,
      (password_hash = crypt($2,password_hash)) AS password_ok
      FROM usuarios WHERE lower(usuario)=lower($1) OR lower(email)=lower($1) LIMIT 1`,[login,password]);
    const u=rows[0];
    if (!u) return res.status(404).json({code:'user',error:'Usuario no registrado'});
    if (!u.password_ok) return res.status(401).json({code:'pass',error:'Contraseña incorrecta'});
    if (!u.activo) return res.status(403).json({code:'inactive',error:'Usuario inactivo'});
    await pool.query('UPDATE usuarios SET ultimo_acceso=NOW() WHERE id=$1',[u.id]);
    delete u.password_ok;
    res.json({user:fromDb(u)});
  } catch (e) { console.error(e); res.status(500).json({error:'Error al iniciar sesión'}); }
});

async function auth(req,res,next) {
  const id=Number(req.header('x-user-id'));
  if (!id) return res.status(401).json({error:'Sesión no válida'});
  try {
    const {rows}=await pool.query('SELECT id FROM usuarios WHERE id=$1 AND activo=true',[id]);
    if (!rows[0]) return res.status(401).json({error:'Usuario inactivo o sesión vencida'});
    req.userId=id; next();
  } catch(e) { next(e); }
}

app.get('/api/db',auth,async (_req,res) => {
  try {
    const db={};
    for (const [key,cfg] of Object.entries(tables)) {
      const {rows}=await pool.query(`SELECT * FROM "${cfg.table}" ORDER BY id`);
      db[key]=rows.map(r=>fromDb(r));
    }
    db.usuarios=db.usuarios.map(({passwordHash,_passwordHash,...u})=>({...u,password:''}));
    const [os,fi]=await Promise.all([
      pool.query('SELECT orden_id,servicio_id FROM orden_servicios ORDER BY orden_id,servicio_id'),
      pool.query('SELECT id,factura_id,descripcion,cantidad,precio FROM factura_items ORDER BY id')
    ]);
    db.ordenes=db.ordenes.map(o=>({...o,servicios:os.rows.filter(x=>x.orden_id===o.id).map(x=>x.servicio_id)}));
    db.facturas=db.facturas.map(f=>({...f,items:fi.rows.filter(x=>x.factura_id===f.id).map(x=>({id:x.id,descripcion:x.descripcion,cantidad:Number(x.cantidad),precio:Number(x.precio)}))}));
    res.json(db);
  } catch(e) { console.error(e); res.status(500).json({error:'No se pudieron cargar los datos'}); }
});

app.post('/api/:collection',auth,async (req,res) => {
  const key=req.params.collection,cfg=tables[key],data=req.body||{};
  if (!cfg) return res.status(404).json({error:'Colección desconocida'});
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    let row;
    if (key==='usuarios') {
      if (data.id && data.password) {
        ({rows:[row]}=await client.query(`UPDATE usuarios SET nombre=$1,usuario=$2,email=$3,rol=$4,activo=$5,password_hash=crypt($6,gen_salt('bf',12)) WHERE id=$7 RETURNING *`,[data.nombre,data.usuario,data.email,data.rol,data.activo,data.password,data.id]));
      } else if (data.id) {
        ({rows:[row]}=await client.query('UPDATE usuarios SET nombre=$1,usuario=$2,email=$3,rol=$4,activo=$5 WHERE id=$6 RETURNING *',[data.nombre,data.usuario,data.email,data.rol,data.activo,data.id]));
      } else {
        if (!data.password) throw new Error('La contraseña es obligatoria para crear usuarios');
        ({rows:[row]}=await client.query(`INSERT INTO usuarios(nombre,usuario,email,rol,activo,password_hash) VALUES($1,$2,$3,$4,$5,crypt($6,gen_salt('bf',12))) RETURNING *`,[data.nombre,data.usuario,data.email,data.rol,data.activo,data.password]));
      }
    } else {
      const vals=cfg.fields.map(f=>value(data,f));
      if (data.id) {
        const set=cfg.fields.map((f,i)=>`"${f}"=$${i+1}`).join(',');
        ({rows:[row]}=await client.query(`UPDATE "${cfg.table}" SET ${set} WHERE id=$${vals.length+1} RETURNING *`,[...vals,data.id]));
      } else {
        const cols=cfg.fields.map(f=>`"${f}"`).join(','),marks=vals.map((_,i)=>`$${i+1}`).join(',');
        ({rows:[row]}=await client.query(`INSERT INTO "${cfg.table}" (${cols}) VALUES (${marks}) RETURNING *`,vals));
      }
    }
    if (!row) throw new Error('Registro no encontrado');
    if (key==='ordenes') {
      await client.query('DELETE FROM orden_servicios WHERE orden_id=$1',[row.id]);
      for (const sid of (data.servicios||[])) await client.query('INSERT INTO orden_servicios(orden_id,servicio_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[row.id,sid]);
    }
    if (key==='facturas') {
      await client.query('DELETE FROM factura_items WHERE factura_id=$1',[row.id]);
      for (const item of (data.items||[])) await client.query('INSERT INTO factura_items(factura_id,descripcion,cantidad,precio) VALUES($1,$2,$3,$4)',[row.id,item.descripcion,item.cantidad,item.precio]);
    }
    await client.query('COMMIT');
    const responseRow=fromDb(row);
    delete responseRow.passwordHash;
    res.json(responseRow);
  } catch(e) { await client.query('ROLLBACK'); console.error(e); res.status(400).json({error:e.message||'No se pudo guardar el registro'}); }
  finally { client.release(); }
});

app.delete('/api/:collection/:id',auth,async (req,res) => {
  const cfg=tables[req.params.collection];
  if (!cfg) return res.status(404).json({error:'Colección desconocida'});
  try {
    const id=Number(req.params.id);
    if (req.params.collection==='ordenes') await pool.query('DELETE FROM orden_servicios WHERE orden_id=$1',[id]);
    if (req.params.collection==='facturas') await pool.query('DELETE FROM factura_items WHERE factura_id=$1',[id]);
    await pool.query(`DELETE FROM "${cfg.table}" WHERE id=$1`,[id]);
    res.json({ok:true});
  }
  catch(e) { res.status(409).json({error:'No se puede eliminar: el registro puede estar relacionado con otros datos.'}); }
});

const port=Number(process.env.API_PORT||3001);
app.listen(port,()=>console.log(`API MotoTaller escuchando en http://localhost:${port}`));
