/**
 *  5Log API Config Init
 *  
 *  by: permaficus<https://github.com/permaficus>
 */

import HttpClient from "./httpClient"
import type { ErrorPayload, FilogInitObject, FilogTransportConfig } from "./types"

class filog {
    private args: FilogTransportConfig

   constructor(args: FilogTransportConfig) {
        this.args = args
    }
    /**
     * Storing / write all the error into the target API
     * 
     * @param {Object} error
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
        const transport: FilogInitObject[] = this.args.filter((field: FilogInitObject) => field.logType === error.logLevel)
        const connector = new HttpClient(transport[0].client_id, transport[0].url);
        connector.send(error)
    }
}

export { filog } 