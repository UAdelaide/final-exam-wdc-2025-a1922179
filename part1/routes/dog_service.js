var express = require('express');
var router = express.Router();
const db = require('../db');

router.get('/dogs', async (req, res) => {
    const [rows] = await db.query('SELECT Dogs.name, Dogs.size, Users.username FROM Dogs INNER JOIN Users ON Dogs.owner_id = user_id');
    res.json(rows);
});

router.get('/walkrequests/open', async (req, res) => {
    const [rows] = await db.query('SELECT WalkRequests.request_id, Dogs.name, WalkRequests.requested_time, WalkRequests.duration_minutes, WalkRequests.location, Users.username FROM WalkRequests INNER JOIN Dogs ON WalkRequests.dog_id = Dogs.dog_id INNER JOIN Users ON Dogs.owner_id = Users.user_id');
    res.json(rows);
});

router.get('/walkers/summary', async (req, res) => {
    const [rows] = await db.query('SELECT Users.username, COUNT(WalkRatings.rating) AS TotalRatings, AVG(WalkRatings.rating) AS AvgRating, COUNT(DISTINCT WalkRequests.request_id) AS WalksCompleted FROM WalkRatings LEFT JOIN Users ON Users.user_id = WalkRatings.walker_id LEFT JOIN WalkRequests ON WalkRatings.walker_id = WalkRequests.walker_id AND WalkRequests.status = 'completed' GROUP BY Users.username');
    res.json(rows);
});

module.exports = router;
