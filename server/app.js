require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandler');

app.use('/api/auth', authRoutes);

app.use(express.static(path.join(__dirname, '../client')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API en marche' });
});

// Etape 4: Cours et chapitres
const courseRoutes = require('./routes/courseRoutes');
const chapterRoutes = require('./routes/chapterRoutes');

app.use('/api/courses', courseRoutes);
app.use('/api/chapters', chapterRoutes);

// Etape 5: Inscription à un cours 
const enrollmentRoutes = require('./routes/enrollmentRoutes');
app.use('/api/enrollments', enrollmentRoutes);

// Etape 6: Gestion des quiz
const quizRoutes = require('./routes/quizRoutes');
app.use('/api/quizzes', quizRoutes);

// dns
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Serveur sur http://localhost:${PORT}`));
  app.use(errorHandler);
});