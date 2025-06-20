var express = require('express');
var router = express.Router();
const db = require('./db');

router.get('/dogs', async (req, res) => {
    const [rows] = await.db.query('')
});

module.exports = router;
