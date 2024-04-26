const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const jwtStrategy = require("./config/jwt");
const mongoose = require("mongoose");
const contactsRouter = require("./routes/api/contacts");

require("dotenv").config();

const { DB_HOST: urlDb } = process.env;

const connection = mongoose.connect(urlDb, { dbName: "db-contacts" });

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

connection
    .then(() => console.log("Database connection successful"))
    .catch((err) => {
        console.error("Database connection error", err);
        process.exit(1);
    });

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

jwtStrategy();

app.use("/api/contacts", contactsRouter);

app.use((req, res) => {
    res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});

module.exports = app;
