const mssql = require("mssql")
require("dotenv").config();
var config = {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
      encrypt: false, // Đặt false nếu không dùng SSL
      enableArithAbort: true,
    },
};


const poolPromise = new mssql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to SQL Server");
    return pool;
  })
  .catch((err) => console.log("Database Connection Failed! Bad Config:", err));

module.exports = {
  mssql,
  poolPromise,
};