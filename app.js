const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Dynamiczne ładowanie modułów
const modulesPath = path.join(__dirname, 'modules');
fs.readdirSync(modulesPath).forEach((moduleName) => {
    const modulePath = path.join(modulesPath, moduleName);
    const moduleIndex = path.join(modulePath, 'index.js');

    if (fs.existsSync(moduleIndex)) {
        const moduleRouter = require(moduleIndex)(app);
        app.use(`/apps/${moduleName}`, moduleRouter);
    }
});

// Pulpit systemu
app.get('/', (req, res) => {
    res.render('index'); // Renderuj widok głównej strony
});

// API: Lista aplikacji dla klienta
app.get('/api/apps', (req, res) => {
    const apps = fs.readdirSync(modulesPath).map((moduleName) => {
        const modulePath = path.join(modulesPath, moduleName, 'module.json');
        if (fs.existsSync(modulePath)) {
            return require(modulePath);
        }
        return null;
    }).filter(Boolean);
    res.json(apps);
});

// Start serwera
app.listen(PORT, () => {
    console.log(`System działa na http://localhost:${PORT}`);
});
