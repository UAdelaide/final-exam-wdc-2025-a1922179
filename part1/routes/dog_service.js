var express = require('express');
var router = express.Router();
const db = require('./db');

router.get('/dogs', async (req, res) => {
  res.render('index', { title: 'Express' });
});

module.exports = router;
