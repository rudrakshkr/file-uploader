require("dotenv").config({path: ".env"});
const express = require("express");
const expressSession = require("express-session");
const passport = require("passport");
const path = require("node:path");
const indexRouter = require("./routes/indexRouter");

const CustomNotFoundError = require('./errors/CustomNotFoundError');

const {PrismaPg} = require('@prisma/adapter-pg');
const {PrismaClient} = require("./generated/prisma/client");
const {PrismaSessionStore} = require("@quixo3/prisma-session-store")

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({connectionString});
const prisma = new PrismaClient({adapter});

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.json());

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

// Make session store

app.use(expressSession({
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000
    },
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(
        prisma,
        {
            checkPeriod: 2 * 60 * 1000,
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }
    )
}));

// Require passport config
require("./config/passport");

app.use(passport.initialize());
app.use(passport.session());

app.use(indexRouter);

app.use((req, res, next) => {
    throw new CustomNotFoundError("Trying to be cheeky eh O_O");
})

app.use((err, req, res, next) => {
  if (!(err instanceof CustomNotFoundError)) {
    console.error(err);
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).send(`${err.name}: ${err.message}`);
});
app.listen(3000, (error) => {
    if(error) {
        throw error;
    }
    console.log("Listening on PORT 3000");
})