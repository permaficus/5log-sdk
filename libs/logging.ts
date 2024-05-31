/**
 *  5Log API Config Init
 *  
 *  by: permaficus<https://github.com/permaficus>
 */

import HttpClient from "./httpClient"
import type { ErrorPayload, FivLogInitConfig } from "./types"

class Logging {
    private args: FivLogInitConfig

   constructor(args: FivLogInitConfig) {
        this.args = args
    }
    /**
     ** ErrorPayload type: object
     * 
     * @param error
     * @example
     * {
     *   logLevel: 'ERROR',
     *   logTicket: {{uuid}} (*) optional
     *   eventCode: 'QR-8493' or HTTP Status code (eg: 400, 401, 500)',
     *   environment: 'Development',
     *   source: {
     *      app_name: 'project_name',
     *      app_version: 'package-version',
     *      package_name: 'project/package_name'
     *   },
     *   errorDescription: 'error-message'
     * }
     */
    write (error: ErrorPayload): void {
        const connector = new HttpClient(this.args.client_id, this.args.url);
        connector.send(error)
    }
}

export { Logging } 