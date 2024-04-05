import * as express from "express";
import { check, validationResult, matchedData, ValidationError, FieldValidationError } from "express-validator";

import { UPLOADS_DIR, PUBLIC_UPLOADS_PATH } from "./conf";
import * as db from "./db";
import { Pin } from "./Pin";
import multer from "multer";


const router = express.Router();

/*
const storage = multer.diskStorage({
  // Adapted from https://www.npmjs.com/package/multer#diskstorage
  destination: (req, file, cb) => {
    cb(null, "data/uploads/");
  },
  filename: (req, file, cb) => {
    //const name = matchedData(req).title;
    //const extension = file.originalname.substring(file.originalname.lastIndexOf("."))
    /*
    TODO: this can cause overwriting!
    So fix that sometime.

    This system also saves to disk when the forms aren't completed.
    All round not production ready, but it works 
    */
/*    cb(null, file.originalname);
  }
})
*/

const upload: ReturnType<typeof multer> = multer({storage: multer.memoryStorage()});
// See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/41970

/* GET home page. */
router.get('/', async function(req, res, next) {
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
    check("title").notEmpty(),
    check("description"),
    check("location").notEmpty(),
    check("datetime").notEmpty(),
    check("postedBy").notEmpty(),
    check("thumbnailUrl"),
    check("thumbnailFile")
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


    const pinData = matchedData(req);
    console.log("thumbnailurl = '" + pinData.thumbnailUrl + "'")
    console.log(req.file)
    console.log(pinData.thumbnailFile)
    if (pinData.thumbnailUrl) {
      console.log("222ZDSFGFDS")
      pinData.thumbnail = pinData.thumbnailUrl;
    } else if (req.file) {
      const extension = req.file.originalname.substring(req.file.originalname.lastIndexOf("."))
      const na = await db.saveImage(pinData.title + extension, req.file?.buffer)
      console.log("333")
      console.log(na)
      pinData.thumbnail = na;
    }

    db.writePin(Pin.fromObject(pinData))
    res.redirect("/");
});

module.exports = router;
