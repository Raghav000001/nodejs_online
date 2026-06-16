import { app } from "./app.js";
import { serverConfig } from "./config/index.js";
import { sequelize } from "./config/sequelize.js";

app.listen(serverConfig.port,async ()=> {
     await sequelize.authenticate()
     console.log("db connected");
     console.log(`Server is running on port ${serverConfig.port}`)
})


