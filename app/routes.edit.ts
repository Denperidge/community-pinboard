import * as express from "express";
import { check, validationResult, matchedData, FieldValidationError } from "express-validator";

import { WEBSITE_TITLE, WEBSITE_DESCRIPTION, UPLOADS_DIR, PUBLIC_UPLOADS_PATH, HOST_DOMAIN, WEBSITE_TIMEZONE, PIN_MAXLENGTHS, LOGINS } from "./conf";
import * as data from "./data";
import { IPinParameters, Pin } from "./Pin";
import multer from "multer";
import slug from "slug";
import { editForms, loginForm } from "./form";
import { rateLimit } from 'express-rate-limit';

/** Express Router, allows assigning routes*/ 
const router = express.Router();
/** Multer middleware to allow file inputs/image upload */
const upload: ReturnType<typeof multer> = multer({storage: multer.memoryStorage()});
// See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/41970


// https://www.npmjs.com/package/express-rate-limit#usage
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15m
  limit: 25,  // 100 req / window
  standardHeaders: "draft-7",
  legacyHeaders: false
});

function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  console.log("Auth!")
  console.log(LOGINS)
  if (req.session !== null) {
    const providedLogin = req.session.login;
    console.log(req.session)
    if (providedLogin !== undefined) {
      if (LOGINS.includes(providedLogin)) {
        console.log("LOGIN")
        next();
        return;
      }
    }
  }
  res.redirect("/login")
  res.end();
}

/** Routes to create or edit pins */
const savePinMiddleware = [
  limiter,
  // Enable multer for a singe file upload
  upload.single("thumbnailFile"),
  check("title")
    .notEmpty().withMessage("The title must not be empty")
    .trim()
    .isLength({max: PIN_MAXLENGTHS.title}).withMessage(`The title has to be ${PIN_MAXLENGTHS.title} characters or shorter`),
  check("description").optional()
    .isLength({max: PIN_MAXLENGTHS.description})
    .withMessage(`The description has to be ${PIN_MAXLENGTHS.description} characters or shorter`),
  check("location")
    .notEmpty()
    .withMessage("The location needs to be filled in")
    .isLength({max: PIN_MAXLENGTHS.location})
    .withMessage(`The location has to be ${PIN_MAXLENGTHS.location} characters or shorter`),
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
    .isLength({max: PIN_MAXLENGTHS.postedBy})
    .withMessage(`Posted by has to be ${PIN_MAXLENGTHS.postedBy} characters or shorter`),
  check("thumbnailUrl").optional(),
  check("thumbnailFile").optional(),
  check("thumbnailImageDescr").optional()
]
// Copy array values (but not reference) using slice
const editPinMiddleware = savePinMiddleware.slice();
// Insert auth
editPinMiddleware.splice(1, 0, auth);


async function saveOrEditPin(req: express.Request, res: express.Response, writeToSpecificSlug?:string) {
    /** All errors caught by Express-Validator */
    const errors = validationResult(req);
    /** The error field keys & messages to display ot the user */
    const returnErrors: {[fieldId:string]: string} = {};
    /** Express-Validator processed data */
  const pinData: IPinParameters = matchedData(req) as IPinParameters;

  // If any Express-Validator errors have been detected, add to returnErrors variable
  if (!errors.isEmpty()) {
    (errors.array() as FieldValidationError[]).forEach((err: FieldValidationError) => {
      returnErrors[err.path + "Err"] = `${err.msg} (provided value: "${err.value}")`;
    });
  }

  // Multer thumbnail max filesize check, otherwise add to returnErrors
  if (req.file) {
    // From https://stackoverflow.com/a/61791720
    // For MB: amountInMegabytes * 1024 * 1024
    const MBLimit = 10;
    if (req.file.buffer.byteLength >= MBLimit * 1024 * 1024) {
      returnErrors["thumbnailFileErr"] = `Provided thumbnail is larger than ${MBLimit}MB. Please compress it, or try another image`;
    }

    if (!pinData.thumbnailImageDescr) {
      returnErrors["thumbnailImageDescrErr"] = "Please enter an image description/transcription for the thumbnail";
    }
  }

  // If any errors are added to returnErrors, don't save the pin. Instead, render the index page with returnErrors
  if (Object.keys(returnErrors).length != 0) {
    const params = new URLSearchParams({...pinData, ...returnErrors});
    
    /**
     * /?
     * title=Meow,thumbnailImageDescrErr=Please enter
     * #thumbnailImageDescr
     */
    res.redirect(`/?${params.toString()}#${Object.keys(returnErrors)[0]}`);
    return;
  }

  let pinSlug: string;
  let overwrite = false;
  // If a specific slug is targeted, it's an edit
  if (writeToSpecificSlug) {
    pinSlug = writeToSpecificSlug;
    overwrite = true;
  }
  // If no specific slug is targeted, it's new, and should not overwrite anything
  else {
    pinSlug = slug(pinData.title);
    overwrite = false;
  }

  // If a thumbnail url is provided, use that
  if (pinData.thumbnailUrl) {
    pinData.thumbnail = pinData.thumbnailUrl;
  }
  // Otherwise, if a file provided, use that
  else if (req.file) {
    const extension = req.file.originalname.substring(req.file.originalname.lastIndexOf("."))
    const filename = await data.saveImage(pinSlug + extension, req.file?.buffer)
    pinData.thumbnail = filename;
  }

  // Insert slug here!!
  // No slug here or in the Pin? 
  // The pin doesn't need it for internal design reasons
  // but that's not always necessary
  // What do i do here !!!
  // bc I can put it in the writePin too and let that make a slug

  /*
  const datetimelocalValues: {[key: string]: number} = {};
  const results = 
    /(?<year>\d{4})-(?<month>\d{1,2})-(?<date>\d{1,2})T(?<hours>\d{1,2}):(?<minutes>\d{1,2})/
    .exec(pinData.datetimelocalValue);

  if (!results) {
    throw new Error(`Could not parse datetimelocalValue for PinUTCDatetime! (Provided value: '${pinData.datetimelocalValue}')`);
  }
  if (!results.groups) {
    throw new Error(`Could not parse GROUPS from PinUTCDatetime! (Provided value: '${pinData.datetimelocalValue}')`);
  }
  const groups : {[key: string]: string} = results.groups;
  Object.keys(groups).forEach((key)=> {
    datetimelocalValues[key] = parseInt(groups[key]);
  });
  pinData.datetime = new Date(
    Date.UTC(
      datetimelocalValues.year, 
      (datetimelocalValues.month - 1), 
      datetimelocalValues.date, 
      datetimelocalValues.hours, 
      datetimelocalValues.minutes));
  */

  // Save pin
  data.writePin(new Pin(pinData as IPinParameters), pinSlug, overwrite);
  // Redirect to index
  res.redirect("/");
}

router.get("/login", async function(req: express.Request, res: express.Response) {
  res.render("login", {
    loginForm: loginForm
  });
});

router.post("/login", [limiter], async function(req: express.Request, res: express.Response) {  
  req.session.login = req.body.password;
  res.redirect("/edit");
});

router.post(
  "/pin",
  savePinMiddleware,
  async function(req: express.Request, res: express.Response, next: express.NextFunction) {
    saveOrEditPin(req, res);
  }
);

router.get("/edit", [auth], async function(req: express.Request, res: express.Response) {
  const errorParams = req.query;
  const pinDict = await data.getPins(false, true, false);
  res.render("edit", {
    WEBSITE_TITLE: WEBSITE_TITLE,
    WEBSITE_DESCRIPTION: WEBSITE_DESCRIPTION,
    HOST_DOMAIN: HOST_DOMAIN,
    WEBSITE_TIMEZONE: WEBSITE_TIMEZONE,
    PIN_MAXLENGTHS: PIN_MAXLENGTHS,
    errors: errorParams,
    forms: editForms(pinDict),
    formSlugs: Object.keys(pinDict),
    pinDict: pinDict 
  });
});

router.post(
  "/pin/:slug",
  editPinMiddleware,
  async function(req: express.Request, res: express.Response, next: express.NextFunction) {
    saveOrEditPin(req, res, req.params.slug);
  }
);

// Export router for ../app.ts
module.exports = router;
