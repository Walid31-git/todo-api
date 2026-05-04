const express = require('express');
const Database = require('better-sqlite3');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATABASE_PATH = process.env.DATABASE_PATH || './todos.db';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-me';

// Gestion du dossier de la base de données
const dbDir = path.dirname(DATABASE_PATH);
if (dbDir !== '.' && !fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initialisation de la base de données
const db = new Database(DATABASE_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER DEFAULT 0
  )
`);

const app = express();
app.use(express.json());

// --- Routes ---

// Healthcheck
app.get('/health', (req, res) => res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    version: require('../package.json').version,
}));

// Authentification (Login)
app.post('/login', (req, res) => {
    const { username, password } = req.body || {};
    if (username === 'demo' && password === 'demo') {
        const token = jwt.sign({ user: username }, JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token });
    }
    res.status(401).json({ error: 'invalid credentials' });
});

// Middleware d'authentification
function auth(req, res, next) {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'missing token' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (e) {
        res.status(401).json({ error: 'invalid token' });
    }
}

// Liste des tâches
app.get('/api/todos', auth, (req, res) => {
    res.json(db.prepare('SELECT * FROM todos').all());
});

// Création d'une tâche
app.post('/api/todos', auth, (req, res) => {
    if (!req.body.title) return res.status(400).json({ error: 'title required' });
    const r = db.prepare('INSERT INTO todos (title) VALUES (?)').run(req.body.title);
    res.status(201).json({ id: r.lastInsertRowid, title: req.body.title, done: 0 });
});

// Modification d'une tâche
app.put('/api/todos/:id', auth, (req, res) => {
    const r = db.prepare(
        'UPDATE todos SET title = COALESCE(?, title), done = COALESCE(?, done) WHERE id = ?'
    ).run(req.body.title || null, req.body.done != null ? (req.body.done ? 1 : 0) : null, req.params.id);
    
    if (r.changes === 0) return res.sendStatus(404);
    res.json(db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id));
});

// Suppression d'une tâche
app.delete('/api/todos/:id', auth, (req, res) => {
    const r = db.prepare('DELETE FROM todos WHERE id = ?').run(req.params.id);
    res.sendStatus(r.changes ? 204 : 404);
});

// Démarrage du serveur
if (require.main === module) {
    app.listen(PORT, () => console.log(`API listening on ${PORT}`));
}

module.exports = app;