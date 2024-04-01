const express = require('express');
const router = express.Router();

const db = require("./db")
const Event = require("./Event");


/* GET home page. */
router.get('/', async function(req, res, next) {
  console.log("MEow")
  res.render('index', { 
    events: await db.getEvents()
  });
});

module.exports = router;
