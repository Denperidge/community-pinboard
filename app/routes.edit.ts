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

/** Routes to create or edit pins */
const saveOrEditPinMiddleware = [
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
async function saveOrEditPin(req: express.Request, res: express.Response, writeToSpecificSlug?:string) {
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
    const par = new URLSearchParams(returnErrors);
    res.redirect(`/?${par.toString()}#${Array.from(par.keys())[0]}`);
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


  // Save pin
  data.writePin(Pin.fromObject(pinData), pinSlug, overwrite);
  // Redirect to index
  res.redirect("/");
}

router.post(
  "/pin",
  saveOrEditPinMiddleware,
  async function(req: express.Request, res: express.Response, next: express.NextFunction) {
    saveOrEditPin(req, res);
  }
);

router.get("/edit", function(req, res, next) {
  res.render("edit", {});
});

router.put(
  "/pin/:slug",
  saveOrEditPinMiddleware,
  async function(req: express.Request, res: express.Response, next: express.NextFunction) {
    saveOrEditPin(req, res, req.params.slug);
  }
);

// Export router for ../app.ts
module.exports = router;
