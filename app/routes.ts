import * as express from "express";
import { check, validationResult, matchedData, FieldValidationError } from "express-validator";

import { WEBSITE_TITLE, WEBSITE_DESCRIPTION, UPLOADS_DIR, PUBLIC_UPLOADS_PATH, HOST_DOMAIN, WEBSITE_TIMEZONE } from "./conf";
import * as data from "./data";
import { Pin } from "./Pin";
import multer from "multer";
import { createEvents } from "ics";

/** Express Router, allows assigning routes*/ 
const router = express.Router();
/** Multer middleware to allow file inputs/image upload */
const upload: ReturnType<typeof multer> = multer({storage: multer.memoryStorage()});
// See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/41970

/**
 * Renders the index page with upcoming/past pins data
 * @param res express route Response object to render in
 * @param returnElapsedPins whether to send elapsed pins. Default=false
 * @param returnUpcomingPins whether to send upcoming pins. Default=true
 */
async function renderIndex(res: express.Response, returnElapsedPins=false, returnUpcomingPins=true) {
  res.render('index', {
    WEBSITE_TITLE: WEBSITE_TITLE,
    WEBSITE_DESCRIPTION: WEBSITE_DESCRIPTION,
    HOST_DOMAIN: HOST_DOMAIN,
    WEBSITE_TIMEZONE: WEBSITE_TIMEZONE,
    pinArray: await data.getPins(returnElapsedPins, returnUpcomingPins)
  });
}

/**
 * Returns an ICS feed with upcoming/past pins data
 * @param res express route Response object to render in
 * @param returnElapsedPins whether to send elapsed pins. Default=false
 * @param returnUpcomingPins whether to send upcoming pins. Default=true
 */
async function renderIcs(res: express.Response, returnElapsedPins=false, returnUpcomingPins=true) {
  const pins = await data.getPins(returnElapsedPins, returnUpcomingPins);
  const events = pins.map((pin) => { return pin.getIcsAttributes() });
  createEvents(events, (err, icsString) => {
    if (err) { throw err };
    res.append("Content-Type", "text/calendar")
    res.send(icsString);
  });
}

/** Home page. Send index of upcoming pins */
router.get('/', async function(req, res, next) {
  renderIndex(res, false, true);
});

/** Archive page. Send index of past pins */
router.get('/archive', async function(req, res, next) {
  renderIndex(res, true, false);
});

/** Ics feed for all pins */
router.get("/all.ics", async function (req, res, next) {
  renderIcs(res, true, true);
});

/** Ics feed for upcoming pins */
router.get("/upcoming.ics", async function (req, res, next) {
  renderIcs(res, false, true);
});

/** Ics feed for past pins */
router.get("/archive.ics", async function (req, res, next) {
  renderIcs(res, true, false);
});

/** About page. Contains links and ics feed urls */
router.get("/about", async function (req, res, next) {
  res.render("about", {
    WEBSITE_TITLE: WEBSITE_TITLE,
    WEBSITE_DESCRIPTION: WEBSITE_DESCRIPTION,
    HOST_DOMAIN: HOST_DOMAIN,
  });
});

/** Route to return files from ./data/uploads/{filename} */
router.get(PUBLIC_UPLOADS_PATH + ":file", function (req, res, next) {
  res.sendFile(req.params.file, { root: UPLOADS_DIR }, (err) => {
    if (err) {
      throw err;
    }
  });
});

/** Route to create new pins */
router.post(
  "/new-event", 
  [
    // Enable multer for a singe file upload
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
    /** All errors caught by Express-Validator */
    const errors = validationResult(req);
    /** The error field keys & messages to display ot the user */
    const returnErrors: {[fieldId:string]: string} = {};
    /** Express-Validator processed data */
    const pinData = matchedData(req);

    // If any Express-Validator errors have been detected, add to returnErrors variable
    if (!errors.isEmpty()) {
      (errors.array() as FieldValidationError[]).forEach((err: FieldValidationError) => {
        returnErrors[err.path] = `${err.msg} (provided value: "${err.value}")`;
      });
    }

    // Multer thumbnail max filesize check, otherwise add to returnErrors
    if (req.file) {
      // From https://stackoverflow.com/a/61791720
      // For MB: amountInMegabytes * 1024 * 1024
      const MBLimit = 10;
      if (req.file.buffer.byteLength >= MBLimit * 1024 * 1024) {
        returnErrors["thumbnailFile"] = `Provided thumbnail is larger than ${MBLimit}MB. Please compress it, or try another image`;
      }

      if (!pinData.thumbnailImageDescr) {
        returnErrors["thumbnailImageDescr"] = "Please enter an image description/transcription for the thumbnail";
      }
    }

    // If any errors are added to returnErrors, don't save the pin. Instead, render the index page with returnErrors
    if (Object.keys(returnErrors).length != 0) {
      // TODO: go to #new on load
      res.render("index", {
        pinArray: await data.getPins(),
        errors: returnErrors,
      });
      return;
    }

    // If a thumbnail url is provided, use that
    if (pinData.thumbnailUrl) {
      pinData.thumbnail = pinData.thumbnailUrl;
    }
    // Otherwise, if a file provided, use that
    else if (req.file) {
      const extension = req.file.originalname.substring(req.file.originalname.lastIndexOf("."))
      const filename = await data.saveImage(pinData.title + extension, req.file?.buffer)
      pinData.thumbnail = filename;
    }

    // Save pin
    data.writePin(Pin.fromObject(pinData));
    // Redirect to index
    res.redirect("/");
});

// Export router for ../app.ts
module.exports = router;
