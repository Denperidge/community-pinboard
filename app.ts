import { randomBytes } from "crypto";
var path = require('path');

var express = require('express');
import { Request, Response, NextFunction } from "express";
var createError = require('http-errors');
import helmet from "helmet";
import session from "express-session";
const MemoryStore = require("memorystore")(session);
var sassMiddleware = require("node-sass-middleware");
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var getRouter = require('./app/routes.get');
var editRouter = require('./app/routes.edit');


declare module "express-session" {
  export interface SessionData {
    login: string
  }
}

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// https://expressjs.com/en/advanced/best-practice-security.html#use-helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "img-src": "* data:",
      "script-src": ["'self'", 'https://cdn.jsdelivr.net/npm/add-to-calendar-button@2.6.16/dist/atcb-no-pro.js'],
      "upgrade-insecure-requests": process.env.NODE_ENV != "development" ? helmet.contentSecurityPolicy.getDefaultDirectives()["upgrade-insecure-requests"] : null
    }
  }
}));
app.disable("x-powered-by");

app.use(session({
  // Set cookie lifespan & enable MemoryStore
  cookie: {
    maxAge: 3600000,

    // Serve only on HOST_DOMAIN & http (not js)
    //domain: HOST_DOMAIN,
    httpOnly: true,

   },  // 1 hour
  store: new MemoryStore({
    checkPeriod: 3600000
  }),

  // Non-standard name, randomised secret
  name: "SessionID",
  secret: randomBytes(64).toString("hex"),  // See README.md - Explanation

  // Recommended in default setup for MemoryStore
  resave: false,
  // Only create cookie if a change happens.
  // See https://www.npmjs.com/package/express-session#saveuninitialized
  saveUninitialized: false, 
}));


app.use(sassMiddleware({
  src: path.join(__dirname, "styles"),
  dest: path.join(__dirname, "public", "stylesheets"),
  outputStyle: "compressed",
  prefix: "/stylesheets/"
}));

app.use('/', getRouter);
app.use('/', editRouter);

// catch 404 and forward to error handler
app.use(function(req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

// error handler
app.use(function(err: {status: number, message: string}, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
