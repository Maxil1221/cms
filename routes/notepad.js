const express = require('express');
const path = require('path');
const router = express.Router();

// Wyświetlanie interfejsu Notatnika
router.get('/', (req, res) => {
    res.render(path.join('..', 'apps', 'notepad', 'index'));
});

module.exports = router;
