// =====================================================================
// SERVER - CAJUHUB (JWT VERSION)
// =====================================================================

const jwt = require('jsonwebtoken');
const express = require('express');
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

// =====================================================================
// MIDDLEWARE JWT
// =====================================================================

function isAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
}

// =====================================================================
// ROTAS DE AUTENTICAÇÃO
// =====================================================================

// REGISTRO
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    const connection = await pool.getConnection();

    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token,
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

// =====================================================================
// ROTAS DE SALAS
// =====================================================================

app.get('/api/spaces', async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [spaces] = await connection.execute(
      'SELECT id, name, description, size, capacity, price_per_shift, amenities, image_url, is_active FROM spaces WHERE is_active = 1'
    );

    connection.release();

    const parsedSpaces = spaces.map(space => {
      let amenitiesParsed = [];

      if (space.amenities) {
        try {
          amenitiesParsed = JSON.parse(space.amenities);
        } catch {
          amenitiesParsed = [];
        }
      }

      return {
        ...space,
        amenities: amenitiesParsed
      };
    });

    res.json(parsedSpaces);

  } catch (error) {
    console.error('Erro ao buscar salas:', error);
    res.status(500).json({ error: 'Erro ao buscar salas' });
  }
});

// CRIAR SALA (ADMIN)
app.post('/api/spaces', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, description, size, capacity, price_per_shift, amenities, is_active } = req.body;

    const connection = await pool.getConnection();

    await connection.execute(
      'INSERT INTO spaces (name, description, size, capacity, price_per_shift, amenities, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, size, capacity, price_per_shift, JSON.stringify(amenities || []), is_active ? 1 : 0]
    );

    connection.release();

    res.json({ success: true });

  } catch (error) {
    console.error('Erro ao criar sala:', error);
    res.status(500).json({ error: 'Erro ao criar sala' });
  }
});

// =====================================================================
// ROTAS DE RESERVAS
// =====================================================================

app.get('/api/reservations', isAuthenticated, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    let query = `
      SELECT r.*, s.name as space_name, s.price_per_shift as price
      FROM reservations r
      JOIN spaces s ON r.space_id = s.id
    `;

    let params = [];

    if (req.user.role !== 'admin') {
      query += ' WHERE r.user_id = ?';
      params.push(req.user.id);
    }

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

    const connection = await pool.getConnection();

    await connection.execute(
      'INSERT INTO reservations (space_id, user_id, reservation_date, shift, status, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [space_id, req.user.id, reservation_date, shift, 'confirmed', notes || null]
    );

    connection.release();

    res.json({ success: true });

  } catch (error) {
    console.error('Erro ao criar reserva:', error);
    res.status(500).json({ error: 'Erro ao criar reserva' });
  }
});

// CANCELAR RESERVA
app.delete('/api/reservations/:id', isAuthenticated, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [reservations] = await connection.execute(
      'SELECT user_id FROM reservations WHERE id = ?',
      [req.params.id]
    );

    if (reservations.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }

    const reservation = reservations[0];

    if (req.user.role !== 'admin' && reservation.user_id !== req.user.id) {
      connection.release();
      return res.status(403).json({ error: 'Sem permissão' });
    }

    await connection.execute(
      'UPDATE reservations SET status = "cancelled" WHERE id = ?',
      [req.params.id]
    );

    connection.release();

    res.json({ success: true });

  } catch (error) {
    console.error('Erro ao cancelar reserva:', error);
    res.status(500).json({ error: 'Erro ao cancelar reserva' });
  }
});

// =====================================================================

module.exports = app;
