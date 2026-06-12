import { app } from "./app.js";
import { serverConfig } from "./config/index.js";

app.listen(serverConfig.port,()=> {
     console.log(`Server is running on port ${serverConfig.port}`)
})