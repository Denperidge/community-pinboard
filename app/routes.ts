import * as express from "express";
import { check, validationResult, matchedData, FieldValidationError, oneOf } from "express-validator";

import { WEBSITE_TITLE, WEBSITE_DESCRIPTION, UPLOADS_DIR, PUBLIC_UPLOADS_PATH, HOST_DOMAIN } from "./conf";
import * as data from "./data";
import { Pin } from "./Pin";
import multer from "multer";
import { createEvents } from "ics";


const router = express.Router();
const upload: ReturnType<typeof multer> = multer({storage: multer.memoryStorage()});
// See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/41970

async function renderIndex(res: express.Response, returnElapsedPins=false, returnUpcomingPins=true) {
  res.render('index', {
    WEBSITE_TITLE: WEBSITE_TITLE,
    WEBSITE_DESCRIPTION: WEBSITE_DESCRIPTION,
    HOST_DOMAIN: HOST_DOMAIN,
    pinArray: await data.getPins(returnElapsedPins, returnUpcomingPins)
  });
}

async function renderIcs(res: express.Response, returnElapsedPins=false, returnUpcomingPins=true) {
  const pins = await data.getPins(returnElapsedPins, returnUpcomingPins);
  const events = pins.map((pin) => { return pin.getIcsAttributes() });
  createEvents(events, (err, icsString) => {
    if (err) { throw err };
    res.append("Content-Type", "text/calendar")
    res.send(icsString);
  });
}

/* GET home page. */
router.get('/', async function(req, res, next) {
  renderIndex(res, false, true);
});

router.get('/archive', async function(req, res, next) {
  renderIndex(res, true, false);
});

router.get("/all.ics", async function (req, res, next) {
  renderIcs(res, true, true);
});

router.get("/upcoming.ics", async function (req, res, next) {
  renderIcs(res, false, true);
});

router.get("/archive.ics", async function (req, res, next) {
  renderIcs(res, true, false);
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
    check("thumbnailImageDescr").optional()
  ],
  async function(req: express.Request, res: express.Response, next: express.NextFunction) {
    const errors = validationResult(req);
    const returnErrors: {[key:string]: string} = {};
    const pinData = matchedData(req);

    // Express-Validator
    if (!errors.isEmpty()) {
      (errors.array() as FieldValidationError[]).forEach((err: FieldValidationError) => {
        returnErrors[err.path] = `${err.msg} (provided value: "${err.value}")`;
      });
    }

    // Multer filesize check
    if (req.file) {
      // From https://stackoverflow.com/a/61791720
      // For MB: amount * 1024 * 1024
      const MBLimit = 10;
      if (req.file.buffer.byteLength >= MBLimit * 1024 * 1024) {
        returnErrors["thumbnailFile"] = `Provided thumbnail is larger than ${MBLimit}MB. Please compress it, or try another image`;
      }

      if (!pinData.thumbnailImageDescr) {
        returnErrors["thumbnailImageDescr"] = "Please enter an image description/transcription for the thumbnail";
      }
    }

    
    if (Object.keys(returnErrors).length != 0) {
      // TODO: go to #new on load
      res.render("index", {
        pinArray: await data.getPins(),
        errors: returnErrors,
      });
      return;
    }


    if (pinData.thumbnailUrl) {
      pinData.thumbnail = pinData.thumbnailUrl;
    } else if (req.file) {
      const extension = req.file.originalname.substring(req.file.originalname.lastIndexOf("."))
      const filename = await data.saveImage(pinData.title + extension, req.file?.buffer)
      pinData.thumbnail = filename;
    }

    data.writePin(Pin.fromObject(pinData))
    res.redirect("/");
});

module.exports = router;
