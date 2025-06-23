const express = require('express');
const session = require('express-session');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 25 * 60 * 1000 } // 25 min (5 min vor Token-Timeout)
}));

// Amagno API Konfiguration
const AMAGNO_API = 'https://amagno.me/api/v2';

// Token-Management Middleware
app.use(async (req, res, next) => {
  if (req.session.token && Date.now() > req.session.tokenExpiresAt) {
    // Token automatisch erneuern
    try {
      const newToken = await refreshAmagnoToken(req.session.username, req.session.password);
      req.session.token = newToken.token;
      req.session.tokenExpiresAt = Date.now() + 30 * 60 * 1000; // 30 min
    } catch (error) {
      console.error('Token refresh failed:', error);
      return res.status(401).json({ error: 'SESSION_EXPIRED' });
    }
  }
  next();
});

// Hilfsfunktion: Token erneuern
async function refreshAmagnoToken(username, password) {
  const response = await axios.post(`${AMAGNO_API}/login`, { username, password });
  return {
    token: response.data.token,
    expiresAt: Date.now() + 30 * 60 * 1000
  };
}

// Login-Route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const tokenData = await refreshAmagnoToken(username, password);

    // Session speichern
    req.session.token = tokenData.token;
    req.session.tokenExpiresAt = tokenData.expiresAt;
    req.session.username = username;
    req.session.password = password; // Nur zur Erneuerung (in Produktion verschlüsseln!)

    res.json({ success: true });
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    res.status(401).json({ error: 'LOGIN_FAILED' });
  }
});

// Vaults abrufen
app.get('/api/vaults', async (req, res) => {
  if (!req.session.token) return res.status(401).json({ error: 'UNAUTHORIZED' });

  try {
    const response = await axios.get(`${AMAGNO_API}/vaults`, {
      headers: { Authorization: `Bearer ${req.session.token}` }
    });
    res.json(response.data.vaults);
  } catch (error) {
    console.error('Vault fetch error:', error.response?.data || error.message);
    res.status(500).json({ error: 'API_ERROR' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));