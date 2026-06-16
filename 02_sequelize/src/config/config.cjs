const { dbConfig } = require("./index.js")

module.exports = {
       development : {
            username: dbConfig.username,
            password: dbConfig.password,
            database: dbConfig.database,
            host: dbConfig.host,
            dialect: dbConfig.dialect,
            port: dbConfig.port,
       }
  } 
