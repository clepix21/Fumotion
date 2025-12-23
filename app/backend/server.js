require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/database');

// Importation des routes
const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const messageRoutes = require('./routes/messages');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://fumotion.com', 'http://localhost', 'http://localhost:80', 'http://127.0.0.1', 'http://127.0.0.1:80', 'http://localhost:3000', 'http://127.0.0.1:3000']
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost', 'http://localhost:80', 'http://127.0.0.1', 'http://127.0.0.1:80'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);

// Route de base
app.get('/', (req, res) => {
  res.json({
    message: 'Backend Fumotion API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Proxy pour le géocodage Nominatim (évite les problèmes CORS)
app.get('/api/geocode/search', async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const params = new URLSearchParams({
      q,
      format: 'json',
      limit,
      addressdetails: 1,
      countrycodes: 'fr',
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          'User-Agent': 'Fumotion/1.0 (contact@fumotion.com)',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erreur Nominatim');
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Erreur geocode search:', error);
    res.status(500).json({ error: 'Erreur de géocodage' });
  }
});

app.get('/api/geocode/reverse', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat et lon requis' });
    }

    const params = new URLSearchParams({
      lat,
      lon,
      format: 'json',
      addressdetails: 1,
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
      {
        headers: {
          'User-Agent': 'Fumotion/1.0 (contact@fumotion.com)',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erreur Nominatim');
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Erreur geocode reverse:', error);
    res.status(500).json({ error: 'Erreur de géocodage inverse' });
  }
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: err.errors
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Erreur serveur interne'
      : err.message
  });
});

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Initialisation de la base de données et démarrage du serveur
async function startServer() {
  try {
    await db.connect();
    console.log('Base de données initialisée avec succès');

    app.listen(PORT, () => {
      console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Gestion propre de l'arrêt du serveur
process.on('SIGINT', () => {
  console.log('\n📴 Arrêt du serveur...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n📴 Arrêt du serveur...');
  db.close();
  process.exit(0);
});

startServer();