const express = require('express');
const router = express.Router();
const appsConfig = require('../apps.json');

router.get('/', (req, res) => {
    res.json(appsConfig);
});

module.exports = router;
