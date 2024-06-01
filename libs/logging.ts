/**
 *  5Log API Config Init
 *  
 *  by: permaficus<https://github.com/permaficus>
 */

import HttpClient from "./httpClient"
import type { ErrorPayload, FilogInitObject, FilogTransportConfig } from "./types"

class filog {
    private args: FilogTransportConfig
    /**
     *
     * @param {array} args - Argument must be an array value
     */
   constructor(args: FilogTransportConfig) {
        this.args = args
    }
    /**
     * Send this error payload to API service
     * @param {ErrorPayload} error - See example
     * @example
     * {
     *   logLevel: 'ERROR',
     *   logTicket: '{{uuid}}',
     *   eventCode: 'QR-8493',
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
        let transport: FilogInitObject[] = this.args.filter((field: FilogInitObject) => field.logType === error.logLevel)
        if (transport.length === 0) {
            transport = this.args.filter((field: FilogInitObject) => field.logType === 'ANY')
        }
        const connector = new HttpClient(transport[0].client_id, transport[0].url);
        connector.send(error)
    }
}

export { filog } 