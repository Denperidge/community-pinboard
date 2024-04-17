import * as express from "express";
import { check, validationResult, matchedData, FieldValidationError } from "express-validator";

import { WEBSITE_TITLE, WEBSITE_DESCRIPTION, UPLOADS_DIR, PUBLIC_UPLOADS_PATH, HOST_DOMAIN, WEBSITE_TIMEZONE, PIN_MAXLENGTHS } from "./conf";
import * as data from "./data";
import { Pin } from "./Pin";
import multer from "multer";
import { createEvents } from "ics";
import slug from "slug";

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
async function renderIndex(req: express.Request, res: express.Response, returnElapsedPins=false, returnUpcomingPins=true) {
  const errorParams = req.query;
  res.render('index', {
    WEBSITE_TITLE: WEBSITE_TITLE,
    WEBSITE_DESCRIPTION: WEBSITE_DESCRIPTION,
    HOST_DOMAIN: HOST_DOMAIN,
    WEBSITE_TIMEZONE: WEBSITE_TIMEZONE,
    PIN_MAXLENGTHS: PIN_MAXLENGTHS,
    errors: errorParams,
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
  renderIndex(req, res, false, true);
});

/** Archive page. Send index of past pins */
router.get('/archive', async function(req, res, next) {
  renderIndex(req, res, true, false);
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

// Export router for ../app.ts
module.exports = router;
