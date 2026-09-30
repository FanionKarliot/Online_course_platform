# Étape 1 : Conception et installation (Jour 1)

## 1.2 Créer le projet

```bash
mkdir plateforme-cours
cd plateforme-cours
git init
npm init -y
npm install express mongoose bcryptjs jsonwebtoken dotenv cors multer
npm install -D nodemon
```

Créez l'arborescence MVC :
```bash
mkdir -p server/config server/models server/controllers server/routes server/middlewares server/services
mkdir -p client/pages client/css client/js uploads
```

Dans `package.json`, remplacez la partie `scripts` par :
```json
"scripts": {
  "dev": "nodemon server/app.js",
  "start": "node server/app.js"
}
```

## 1.3 Fichiers de configuration

**`.gitignore`**
```
node_modules
notes
.env
uploads/*
```

**`.env`** (ne le mettez jamais sur GitHub)
```
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/plateforme_cours
JWT_SECRET=changez_cette_phrase_secrete
```
Pour MongoDB, deux options : installer MongoDB Community en local, ou créer un cluster gratuit **MongoDB Atlas** et coller son URI dans `MONGO_URI`. Atlas est préférable, car vous en aurez besoin pour le déploiement de toute façon.

## 1.4 Connexion à la base : `server/config/db.js`

```javascript
const mongoose = require('mongoose');

module.exports = async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connecté');
  } catch (err) {
    console.error('Erreur MongoDB :', err.message);
    process.exit(1);
  }
};
```

## 1.5 Serveur : `server/app.js`

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API en marche' });
});

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Serveur sur http://localhost:${PORT}`));
});
```

## 1.6 Test et premier commit

```bash
npm run dev
```
Ouvrez `http://localhost:3000/api/health` : vous devez voir `{"status":"ok",...}`.

Puis créez un dépôt **vide** sur GitHub (nom conseillé : `plateforme-cours-en-ligne`) et poussez :
```bash
git add .
git commit -m "Initialisation du projet : Express + MongoDB + structure MVC"
git branch -M main
git remote add origin https://github.com/VOTRE_NOM/plateforme-cours-en-ligne.git
git push -u origin main
```

## 1.7 Travail de conception à faire aujourd'hui (sur papier ou draw.io)

Listez les **entités** que nous allons créer demain :
`User`, `Course`, `Chapter`, `Enrollment`, `Quiz`, `Result`, `Comment`, `Notification`.

Pour chacune, notez les champs principaux et les liens (un cours a plusieurs chapitres, un étudiant a plusieurs inscriptions, etc.). Ce schéma ira directement dans la partie « conception » de votre ouvrage.

---

## Checklist de fin d'étape 1

- [ ] `npm run dev` démarre sans erreur et affiche « MongoDB connecté »
- [ ] `/api/health` répond
- [ ] Le dépôt GitHub contient le premier commit, sans `.env` ni `node_modules`

Quand c'est fait, envoyez-moi ce qui s'affiche dans le terminal (ou l'erreur en cas de problème), et dites-moi si vous utilisez MongoDB Atlas ou local. On passera à l'**étape 2 : les modèles de données**.