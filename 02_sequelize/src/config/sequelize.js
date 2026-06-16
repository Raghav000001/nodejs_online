import { Sequelize } from "sequelize";
import { dbConfig } from "../config/index.js";

export const sequelize = new Sequelize({
                 username: dbConfig.username,
                 password: dbConfig.password,
                 database: dbConfig.database,
                 host: dbConfig.host,
                 dialect: dbConfig.dialect,
                 port: dbConfig.port,
                 logging:true
})