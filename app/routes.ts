import * as express from "express";
import { query, validationResult } from "express-validator";

import * as db from "./db";
import { Pin } from "./Pin";

const router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
  console.log("MEow")
  res.render('index', { 
    events: await db.getPins()
  });
});

router.post(
  "/new-event", 
  query("title").isAlphanumeric().not().isEmpty(),
  query("description"),
  query("location"),
  query("datetime"),
  query("poster"),
  query("thumbnail"),
  async function(req, res, next) {
    db.writePin(Pin.fromObject(req.body))
    res.redirect("/");
});

module.exports = router;
