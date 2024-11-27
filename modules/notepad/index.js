const express = require('express');
const path = require('path');

module.exports = (app) => {
    const router = express.Router();

    // Statyczne zasoby aplikacji
    app.use('/apps/notepad/public', express.static(path.join(__dirname, 'public')));

    // Główny widok aplikacji
    router.get('/', (req, res) => {
        res.render(path.join(__dirname, 'views', 'index'));
    });

    return router;
};
