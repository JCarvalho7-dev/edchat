const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://edchat:edchatpass@localhost:5432/edchatdb'
});

const JWT_SECRET = process.env.JWT_SECRET || 'verysecret_edchat_jwt';

// On startup, initialize DB schema and seed admin user
async function initDb(){
  const initSql = fs.readFileSync(__dirname + '/db_init.sql').toString();
  await pool.query(initSql);

  // seed admin user if not exists
  const res = await pool.query('SELECT * FROM users WHERE email=$1', ['master@ed.com']);
  if (res.rowCount === 0) {
    const hashed = await bcrypt.hash('MasterPass123!', 10);
    await pool.query('INSERT INTO users (email, password, role) VALUES ($1,$2,$3)', ['master@ed.com', hashed, 'admin']);
    console.log('Seeded master user: master@ed.com / MasterPass123!');
  }
}

initDb().catch(err => console.error('DB init error', err));

// Auth helper
function generateToken(user){
  return jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '8h' });
}

// Middleware to protect routes
async function authMiddleware(req,res,next){
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({message:'missing token'});
  const token = auth.replace('Bearer ','');
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch(e){
    res.status(401).json({message:'invalid token'});
  }
}

// Public login
app.post('/api/login', async (req,res) => {
  const { email, password } = req.body;
  const u = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  if (u.rowCount === 0) return res.status(401).json({message:'invalid credentials'});
  const user = u.rows[0];
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({message:'invalid credentials'});
  const token = generateToken(user);
  res.json({ token, role: user.role, email: user.email });
});

// Admin: create user
app.post('/api/admin/users', authMiddleware, async (req,res) => {
  if (req.user.role !== 'admin') return res.status(403).json({message:'forbidden'});
  const { email, password, role='user' } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const r = await pool.query('INSERT INTO users (email,password,role) VALUES ($1,$2,$3) RETURNING id,email,role', [email,hashed,role]);
    res.json(r.rows[0]);
  } catch(e){
    res.status(400).json({ error: e.message });
  }
});

// Admin: create group
app.post('/api/admin/groups', authMiddleware, async (req,res) => {
  if (req.user.role !== 'admin') return res.status(403).json({message:'forbidden'});
  const { name } = req.body;
  const r = await pool.query('INSERT INTO groups_tbl (name) VALUES ($1) RETURNING *', [name]);
  res.json(r.rows[0]);
});

// Admin: add user to group
app.post('/api/admin/groups/:groupId/add', authMiddleware, async (req,res) => {
  if (req.user.role !== 'admin') return res.status(403).json({message:'forbidden'});
  const groupId = parseInt(req.params.groupId);
  const { userId } = req.body;
  await pool.query('INSERT INTO user_groups (user_id, group_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [userId, groupId]);
  res.json({ ok: true });
});

// Protected: list groups for user
app.get('/api/groups', authMiddleware, async (req,res) => {
  // admin sees all groups, user sees their groups
  if (req.user.role === 'admin') {
    const r = await pool.query('SELECT * FROM groups_tbl');
    return res.json(r.rows);
  } else {
    const r = await pool.query('SELECT g.* FROM groups_tbl g JOIN user_groups ug ON ug.group_id=g.id WHERE ug.user_id=$1', [req.user.id]);
    return res.json(r.rows);
  }
});

// Socket.io for chat (rooms use group_{id})
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('unauthorized'));
  try {
    const data = jwt.verify(token, JWT_SECRET);
    socket.user = data;
    return next();
  } catch(e){
    return next(new Error('invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('socket connected', socket.user.email);

  socket.on('joinGroup', async ({ groupId }) => {
    // verify membership (admin allowed)
    if (socket.user.role !== 'admin') {
      const r = await pool.query('SELECT * FROM user_groups WHERE user_id=$1 AND group_id=$2', [socket.user.id, groupId]);
      if (r.rowCount === 0) {
        socket.emit('error', 'not a member of this group');
        return;
      }
    }
    const room = 'group_' + groupId;
    socket.join(room);
    socket.emit('joined', { groupId });
  });

  socket.on('message', async ({ groupId, content, media_url, media_type }) => {
    // save to DB
    await pool.query('INSERT INTO messages (user_id, group_id, content, media_url, media_type) VALUES ($1,$2,$3,$4,$5)',
      [socket.user.id, groupId, content || null, media_url || null, media_type || null]);
    const msg = { user: { id: socket.user.id, email: socket.user.email }, content, media_url, media_type, created_at: new Date() };
    io.to('group_' + groupId).emit('message', msg);
  });

  socket.on('disconnect', () => {
    console.log('socket disconnect', socket.user?.email);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log('ED Chat backend running on port', PORT));
