//LOAD ENVIRONMENT VARIABLES
require("dotenv").config();
const mongoose = require("mongoose");

const { MONGO_URI } = process.env;
console.log('ABC', MONGO_URI)
exports.connect = async () => {

    await mongoose
        .connect(MONGO_URI)
        .then(() => {
            console.log("Successfully connected to database");
        })
        .catch((error) => {
            console.log("database connection failed. exiting now...");
            console.error(error);
            process.exit(1);
        });
};