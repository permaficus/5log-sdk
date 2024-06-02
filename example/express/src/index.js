import { httpServer, serviceInit } from "./libs/service.init.js";

(() => {
    serviceInit;
    httpServer.listen(4020, () => {
        console.log(`\nHTTP Server run at: 4020\n`)
    })
})()