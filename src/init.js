const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Récupère le chemin de la base de données depuis l'environnement ou utilise la valeur par défaut
const DATABASE_PATH = process.env.DATABASE_PATH || './todos.db';

// Création du dossier parent si nécessaire
const dir = path.dirname(DATABASE_PATH);
if (dir !== '.' && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

// Initialisation de la connexion et création de la table
const db = new Database(DATABASE_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER DEFAULT 0
  )
`);

console.log('DB initialized at', DATABASE_PATH);