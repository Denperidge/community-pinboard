import * as express from "express";
import { check, validationResult, matchedData, ValidationError, FieldValidationError } from "express-validator";

import * as db from "./db";
import { Pin } from "./Pin";

const router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
  console.log(await db.getPins())
  res.render('index', { 
    pinArray: await db.getPins()
  });
});

router.post(
  "/new-event", 
  [
    check("title").notEmpty(),
    check("description"),
    check("location").notEmpty(),
    check("datetime").notEmpty(),
    check("poster").notEmpty(),
    check("thumbnail")
  ],
  async function(req: express.Request, res: express.Response, next: express.NextFunction) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const returnErrors: {[key:string]: string} = {};
      (errors.array() as FieldValidationError[]).forEach((err: FieldValidationError) => {
        returnErrors[err.path] = `${err.msg}: "${err.value}"`;
      });
      res.render("index", {
        pinArray: await db.getPins(),
        errors: returnErrors,
      })
      return;
    }

    db.writePin(Pin.fromObject(matchedData(req)))
    res.redirect("/");
});

module.exports = router;
