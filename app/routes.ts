import * as express from "express";
import { check, validationResult, matchedData } from "express-validator";

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
  [
    check("title").isAlphanumeric().notEmpty(),
    check("description"),
    check("location").notEmpty(),
    check("datetime").notEmpty(),
    check("poster").notEmpty(),
    check("thumbnail")
  ],
  async function(req: express.Request, res: express.Response, next: express.NextFunction) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.send({
        errors: errors.array()
      });
    }

    db.writePin(Pin.fromObject(matchedData(req)))
    res.redirect("/");
});

module.exports = router;
