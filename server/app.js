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

// Etape 7: Gestion des fichiers (PDF, images) et certificat
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);
const certificateRoutes = require('./routes/certificateRoutes');
app.use('/api/certificates', certificateRoutes);

// Etape 8: Commentaire et notification
const commentRoutes = require('./routes/commentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Etape 9: Gestion des utilisateurs (admin uniquement)
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);

// dns
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Serveur sur http://localhost:${PORT}`));
  app.use(errorHandler);
});