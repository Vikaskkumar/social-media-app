const mongoose = require("mongoose");
const { mongoUrl } = require("../keys.js");

let connectionPromise;

function Dbconnection() {
  if (!mongoUrl) {
    return Promise.reject(new Error("MONGODB_URI is not configured"));
  }

  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoUrl)
      .then((connection) => {
        console.log("Database connected successfully");
        return connection;
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
}

module.exports = Dbconnection;
