import http from "http";
import sequelize from "../config/database.js";
import { SocketClass } from "../sockets/SocketClass.js";

import "../config/associations.js";
import { App } from "./App.js";


(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({alter: false, force: false});

    const appInstance = new App();
    const httpServer = http.createServer(appInstance.app);

    const socket = new SocketClass();
    socket.initializeServer(httpServer);

    const PORT = process.env.PORT || 4002;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server error:", error);
  }
})();
