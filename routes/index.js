const express = require('express');
const router = express.Router();

const db = require("../app/db")
const Event = require("../app/Event");


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
