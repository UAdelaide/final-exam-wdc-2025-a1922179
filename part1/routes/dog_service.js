var express = require('express');
var router = express.Router();
const db = require('../db');

router.get('/dogs', async (req, res) => {
    const [rows] = await db.query('SELECT Dogs.dog_id, Dogs.size, Users.username FROM Dogs INNER JOIN Users ON Dogs.owner_id = user_id');
    res.json(rows);
});

router.get('/walkrequests/open', async (req, res) => {
    const [rows] = await db.query('SELECT WalkRequests.request_id, Dogs.');
    res.json(rows);
});

module.exports = router;
