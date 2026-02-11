// =====================================================================
// SERVER - CAJUHUB
// =====================================================================

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================================
// MIDDLEWARES
// =====================================================================

// CORS COM SUPORTE A COOKIES (OBRIGATÓRIO PARA SESSÃO)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..')));
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/js', express.static(path.join(__dirname, '../js')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));


// SESSÃO
app.use(session({
  secret: process.env.SESSION_SECRET || 'seu_secret_aqui',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true em produção com HTTPS
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// =====================================================================
// MIDDLEWARES DE AUTENTICAÇÃO
// =====================================================================

function isAuthenticated(req, res, next) {
  if (req.session.userId) return next();
  return res.status(401).json({ error: 'Não autenticado' });
}

function isAdmin(req, res, next) {
  if (req.session.userId && req.session.role === 'admin') return next();
  return res.status(403).json({ error: 'Acesso negado. Apenas administrador.' });
}

// =====================================================================
// ROTAS DE AUTENTICAÇÃO
// =====================================================================

// REGISTRO USUÁRIO
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    const connection = await pool.getConnection();

    // Verificar se usuário já existe
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserir novo usuário
    await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'user']
    );

    connection.release();

    res.json({
      success: true,
      message: 'Usuário criado com sucesso'
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// LOGIN USUÁRIO
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT id, email, password, name, role FROM users WHERE email = ?',
      [email]
    );
    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.name = user.name;
    req.session.role = user.role;

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// LOGIN ADMIN
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT id, email, password, name, role FROM users WHERE email = ? AND role = "admin"',
      [email]
    );
    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ error: 'Administrador não encontrado' });
    }

    const admin = users[0];
    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    req.session.userId = admin.id;
    req.session.email = admin.email;
    req.session.name = admin.name;
    req.session.role = admin.role;

    res.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Erro no login admin:', error);
    res.status(500).json({ error: 'Erro ao fazer login admin' });
  }
});

// LOGOUT
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// VERIFICAR SESSÃO
app.get('/api/auth/session', (req, res) => {
  if (req.session.userId) {
    res.json({
      authenticated: true,
      user: {
        id: req.session.userId,
        email: req.session.email,
        name: req.session.name,
        role: req.session.role
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Alias para frontend antigo
app.get('/api/auth/check-session', (req, res) => {
  if (req.session.userId) {
    res.json({
      authenticated: true,
      user: {
        id: req.session.userId,
        email: req.session.email,
        name: req.session.name,
        role: req.session.role
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// =====================================================================
// ROTAS DE SALAS
// =====================================================================

// LISTAR TODAS AS SALAS
app.get('/api/spaces', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [spaces] = await connection.execute(
      'SELECT id, name, description, size, capacity, price_per_shift, amenities, image_url, is_active FROM spaces WHERE is_active = 1'
    );
    connection.release();


// Parsear amenities com proteção
const parsedSpaces = spaces.map(space => {
  let amenitiesParsed = [];

  if (space.amenities) {
    try {
      let clean = space.amenities.trim();

      // Remove aspas simples externas se existirem
      if (clean.startsWith("'") && clean.endsWith("'")) {
        clean = clean.slice(1, -1);
      }

      amenitiesParsed = JSON.parse(clean);
    } catch (err) {
      console.error("JSON inválido em amenities:", space.amenities);
      amenitiesParsed = [];
    }
  }

  return {
    ...space,
    amenities: amenitiesParsed
  };
});

res.json(parsedSpaces);


// OBTER SALA POR ID
app.get('/api/spaces/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [spaces] = await connection.execute(
      'SELECT id, name, description, size, capacity, price_per_shift, amenities, image_url, is_active FROM spaces WHERE id = ?',
      [id]
    );
    connection.release();

    if (spaces.length === 0) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    const space = spaces[0];
    space.amenities = space.amenities ? JSON.parse(space.amenities) : [];

    res.json(space);
  } catch (error) {
    console.error('Erro ao buscar sala:', error);
    res.status(500).json({ error: 'Erro ao buscar sala' });
  }
});

// CRIAR SALA (ADMIN)
app.post('/api/spaces', isAdmin, async (req, res) => {
  try {
    const { name, description, size, capacity, price_per_shift, amenities, is_active } = req.body;

    if (!name || !capacity || !price_per_shift) {
      return res.status(400).json({ error: 'Nome, capacidade e preço são obrigatórios' });
    }

    const connection = await pool.getConnection();
    const amenitiesJson = JSON.stringify(amenities || []);

    await connection.execute(
      'INSERT INTO spaces (name, description, size, capacity, price_per_shift, amenities, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description || null, size || null, capacity, price_per_shift, amenitiesJson, is_active ? 1 : 0]
    );

    connection.release();

    res.json({
      success: true,
      message: 'Sala criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar sala:', error);
    res.status(500).json({ error: 'Erro ao criar sala' });
  }
});

// ATUALIZAR SALA (ADMIN)
app.put('/api/spaces/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, size, capacity, price_per_shift, amenities, is_active } = req.body;

    const connection = await pool.getConnection();
    const amenitiesJson = JSON.stringify(amenities || []);

    await connection.execute(
      'UPDATE spaces SET name = ?, description = ?, size = ?, capacity = ?, price_per_shift = ?, amenities = ?, is_active = ? WHERE id = ?',
      [name, description || null, size || null, capacity, price_per_shift, amenitiesJson, is_active ? 1 : 0, id]
    );

    connection.release();

    res.json({
      success: true,
      message: 'Sala atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar sala:', error);
    res.status(500).json({ error: 'Erro ao atualizar sala' });
  }
});

// =====================================================================
// ROTAS DE RESERVAS
// =====================================================================

// LISTAR RESERVAS (USUÁRIO VÊ SUAS, ADMIN VÊ TODAS)
app.get('/api/reservations', isAuthenticated, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    let query = `
      SELECT r.id, r.space_id, r.user_id, r.reservation_date, r.shift, r.status, r.notes, r.created_at,
             s.name as space_name, s.price_per_shift as price
      FROM reservations r
      JOIN spaces s ON r.space_id = s.id
    `;
    let params = [];

    // Se não for admin, mostrar apenas suas reservas
    if (req.session.role !== 'admin') {
      query += ' WHERE r.user_id = ?';
      params.push(req.session.userId);
    }

    query += ' ORDER BY r.reservation_date DESC';

    const [reservations] = await connection.execute(query, params);
    connection.release();

    res.json(reservations);
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    res.status(500).json({ error: 'Erro ao buscar reservas' });
  }
});

// CRIAR RESERVA
app.post('/api/reservations', isAuthenticated, async (req, res) => {
  try {
    const { space_id, reservation_date, shift, notes } = req.body;

    if (!space_id || !reservation_date || !shift) {
      return res.status(400).json({ error: 'Sala, data e turno são obrigatórios' });
    }

    const connection = await pool.getConnection();

    // Verificar se a sala está disponível nessa data e turno
    const [existing] = await connection.execute(
      'SELECT id FROM reservations WHERE space_id = ? AND reservation_date = ? AND shift = ? AND status = "confirmed"',
      [space_id, reservation_date, shift]
    );

    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Esta sala já está reservada para este horário' });
    }

    // Criar reserva
    await connection.execute(
      'INSERT INTO reservations (space_id, user_id, reservation_date, shift, status, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [space_id, req.session.userId, reservation_date, shift, 'confirmed', notes || null]
    );

    connection.release();

    res.json({
      success: true,
      message: 'Reserva criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar reserva:', error);
    res.status(500).json({ error: 'Erro ao criar reserva' });
  }
});

// CANCELAR RESERVA
app.delete('/api/reservations/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    // Verificar se a reserva pertence ao usuário ou se é admin
    const [reservations] = await connection.execute(
      'SELECT user_id FROM reservations WHERE id = ?',
      [id]
    );

    if (reservations.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }

    const reservation = reservations[0];

    if (req.session.role !== 'admin' && reservation.user_id !== req.session.userId) {
      connection.release();
      return res.status(403).json({ error: 'Você não tem permissão para cancelar esta reserva' });
    }

    // Cancelar reserva
    await connection.execute(
      'UPDATE reservations SET status = "cancelled" WHERE id = ?',
      [id]
    );

    connection.release();

    res.json({
      success: true,
      message: 'Reserva cancelada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao cancelar reserva:', error);
    res.status(500).json({ error: 'Erro ao cancelar reserva' });
  }
});

// =====================================================================
// ROTA RAIZ
// =====================================================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Servir arquivos HTML específicos
app.get('/:file.html', (req, res) => {
  const filePath = path.join(__dirname, '..', `${req.params.file}.html`);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Arquivo não encontrado');
    }
  });
});


// =====================================================================
// INICIAR SERVIDOR
// =====================================================================

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;
