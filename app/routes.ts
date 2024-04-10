import * as express from "express";
import { check, validationResult, matchedData, FieldValidationError, oneOf } from "express-validator";

import { UPLOADS_DIR, PUBLIC_UPLOADS_PATH } from "./conf";
import * as db from "./db";
import { Pin } from "./Pin";
import multer from "multer";


const router = express.Router();
const upload: ReturnType<typeof multer> = multer({storage: multer.memoryStorage()});
// See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/41970

/* GET home page. */
router.get('/', async function(req, res, next) {
  console.log(await db.getPins())
  res.render('index', { 
    pinArray: await db.getPins()
  });
});

router.get(PUBLIC_UPLOADS_PATH + ":file", function (req, res, next) {
  res.sendFile(req.params.file, { root: UPLOADS_DIR }, (err) => {
    if (err) {
      throw err;
    }
  });
});

router.post(
  "/new-event", 
  [
    upload.single("thumbnailFile"),
    check("title")
      .notEmpty().withMessage("The title must not be empty")
      .trim()
      .isLength({max: 20}).withMessage("The title has to be 20 characters or shorter"),
    check("description").optional()
      .isLength({max: 200})
      .withMessage("The description has to be 200 characters or shorter"),
    check("location")
      .notEmpty()
      .withMessage("The location needs to be filled in")
      .isLength({max: 50})
      .withMessage("The location has to be 50 characters or shorter"),
    check("datetime")
      .notEmpty()
      .withMessage("A date/time has to be provided")
      // TOdo: regex based date format?
      //.isDate()
      //.withMessage("Provided date/time incorrect format")
      ,
    check("postedBy")
      .notEmpty()
      .withMessage("Posted by cannot be empty")
      .isLength({max: 20})
      .withMessage("Posted by has to be 20 characters or shorter"),
    check("thumbnailUrl").optional(),
    check("thumbnailFile").optional(),
    check("thumbnailImageDescr")
      .notEmpty().if(oneOf([
        check("thumbnailUrl").notEmpty(),
        check("thumbnailFile").notEmpty()
      ]))
      .withMessage("Please provide an image description or transcription for the thumbnail")
  ],
  async function(req: express.Request, res: express.Response, next: express.NextFunction) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.error("Errors")
      console.error(errors)
      const returnErrors: {[key:string]: string} = {};
      (errors.array() as FieldValidationError[]).forEach((err: FieldValidationError) => {
        returnErrors[err.path] = `${err.msg}: "${err.value}"`;
      });

      // TODO: go to #new on load
      res.render("index", {
        pinArray: await db.getPins(),
        errors: returnErrors,
      })
      return;
    }


    const pinData = matchedData(req);
    if (pinData.thumbnailUrl) {
      pinData.thumbnail = pinData.thumbnailUrl;
    } else if (req.file) {
      const extension = req.file.originalname.substring(req.file.originalname.lastIndexOf("."))
      const na = await db.saveImage(pinData.title + extension, req.file?.buffer)
      pinData.thumbnail = na;
    }

    db.writePin(Pin.fromObject(pinData))
    res.redirect("/");
});

module.exports = router;
