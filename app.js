require("dotenv").config({path: ".env"});
const express = require("express");
const expressSession = require("express-session");
const passport = require("passport");
const path = require("node:path");
const indexRouter = require("./routes/indexRouter");

const {PrismaPg} = require('@prisma/adapter-pg');
const {PrismaClient} = require("@prisma/client");
const {PrismaSessionStore} = require("@quixo3/prisma-session-store")

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({connectionString});
const prisma = new PrismaClient({adapter});

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));

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

app.use(indexRouter);

app.listen(3000, (error) => {
    if(error) {
        throw error;
    }
    console.log("Listening on PORT 3000");
})