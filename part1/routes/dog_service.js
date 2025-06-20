var express = require('express');
var router = express.Router();
const db = require('../db');

router.get('/dogs', async (req, res) => {
    const [rows] = await db.query('SELECT Dogs.dog_id, Dogs.size, Users.username FROM Dogs INNER JOIN Users ON ');
    res.json(rows);
});

module.exports = router;
